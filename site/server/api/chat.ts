/**
 * POST /api/chat — Streaming chat endpoint
 *
 * Receives a chat request, runs the RAG pipeline (embed → search → filter),
 * builds the system prompt, and streams the Anthropic response via SSE.
 * Citations are sent as a final event after the response completes.
 */

import type { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
// Shared engine from dashtwo submodule
import { embedQuery } from '../../../packages/dashtwo/src/engine/embeddingClient';
import { searchFAA, type QdrantSearchResult } from '../../../packages/dashtwo/src/engine/qdrantClient';
import { routeToModel, MODEL_IDS, type DashTwoMode } from '../../../packages/dashtwo/src/engine/modelRouter';
import { augmentQuery } from '../../../packages/dashtwo/src/engine/queryAugmenter';
import { buildQdrantFilter } from '../../../packages/dashtwo/src/engine/metadataFilter';
import { detectMode } from '../../../packages/dashtwo/src/engine/modeDetector';
import { extractCitationsFromQdrant } from '../../../packages/dashtwo/src/engine/citationExtractor';
// DashTwoLaunch-specific (public self-awareness layer, Firebase, rate limiting, usage)
import { buildPublicSystemPrompt, RAG_RETRIEVAL_INSTRUCTIONS } from '../engine/systemPrompts';
import { calculateCostCents, isOverDailyCap, getDateKey, type UsageRecord } from '../engine/usageTracker';
import { adminAuth, adminDb } from '../engine/firebaseAdmin';
import { checkRateLimit } from '../engine/rateLimiter';

interface ChatRequestBody {
  query: string;
  mode: DashTwoMode;
  personaPrefix?: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const VALID_MODES: DashTwoMode[] = ['auto', 'general', 'checkride', 'support', 'interview', 'training', 'debrief'];

function sendSSE(res: Response, event: Record<string, unknown>) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

/** Verify Firebase auth token, returns uid + tier or null for anonymous */
async function verifyAuth(req: Request): Promise<{ uid: string; tier: string } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    // Fetch user profile for tier info
    const profileSnap = await adminDb.collection('users').doc(decoded.uid).get();
    const tier = profileSnap.exists ? (profileSnap.data()?.tier || 'free') : 'free';
    return { uid: decoded.uid, tier };
  } catch {
    return null;
  }
}

/** Get today's usage for a user */
async function getDailyUsage(uid: string): Promise<UsageRecord | null> {
  const dateKey = getDateKey();
  const snap = await adminDb.collection('usage').doc(uid).collection('daily').doc(dateKey).get();
  return snap.exists ? (snap.data() as UsageRecord) : null;
}

/** Record usage after a response */
async function recordUsage(uid: string, model: string, inputTokens: number, outputTokens: number) {
  const dateKey = getDateKey();
  const costCents = calculateCostCents(model, inputTokens, outputTokens);
  const ref = adminDb.collection('usage').doc(uid).collection('daily').doc(dateKey);
  const snap = await ref.get();

  if (snap.exists) {
    const existing = snap.data() as UsageRecord;
    await ref.update({
      inputTokens: existing.inputTokens + inputTokens,
      outputTokens: existing.outputTokens + outputTokens,
      estimatedCostCents: existing.estimatedCostCents + costCents,
      messageCount: existing.messageCount + 1,
      lastUpdated: new Date().toISOString(),
    });
  } else {
    await ref.set({
      inputTokens,
      outputTokens,
      estimatedCostCents: costCents,
      messageCount: 1,
      lastUpdated: new Date().toISOString(),
    });
  }
}

export async function handleChat(req: Request, res: Response) {
  // Rate limiting — 30 requests per minute per IP
  const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const rateCheck = checkRateLimit(clientIp);
  if (rateCheck) {
    res.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
      retryAfterMs: rateCheck.retryAfterMs,
    });
    return;
  }

  const body = req.body as ChatRequestBody;

  // Validate input
  if (!body.query || typeof body.query !== 'string') {
    res.status(400).json({ error: 'query is required' });
    return;
  }

  if (body.query.length > 2000) {
    res.status(400).json({ error: 'query must be 2000 characters or fewer' });
    return;
  }

  const requestedMode = VALID_MODES.includes(body.mode) ? body.mode : 'auto';
  const isAutoMode = requestedMode === 'auto';
  let mode: DashTwoMode = isAutoMode ? 'general' : requestedMode;
  const history = Array.isArray(body.conversationHistory) ? body.conversationHistory.slice(-20) : [];

  // Auth + usage check (optional — anonymous users can still chat)
  let userAuth: { uid: string; tier: string } | null = null;
  try {
    userAuth = await verifyAuth(req);
    if (userAuth) {
      const usage = await getDailyUsage(userAuth.uid);
      if (isOverDailyCap(usage, userAuth.tier)) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.flushHeaders();
        const limitMessage = userAuth.tier === 'paid'
          ? "You've hit the daily message limit (100 messages). This resets at midnight UTC."
          : "You've used all your free DashTwo time for today. Upgrade to Pro for unlimited access, or verify as a student pilot for free unlimited access.";
        sendSSE(res, {
          type: 'daily_limit',
          message: limitMessage,
          tier: userAuth.tier,
        });
        sendSSE(res, { type: 'done', usage: null });
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
    }
  } catch {
    // Auth errors don't block — proceed as anonymous
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let aborted = false;
  res.on('close', () => { aborted = true; });

  try {
    // ── Step 0: Auto Mode Detection ───────────────────────────────────
    const detectedMode = detectMode(body.query, mode);
    if (detectedMode && (isAutoMode || detectedMode !== mode)) {
      mode = detectedMode;
      sendSSE(res, { type: 'mode_switch', mode: detectedMode });
    }

    // ── Step 1: RAG Pipeline ────────────────────────────────────────────
    const ragStart = Date.now();

    const augmentedQuery = augmentQuery(body.query, mode);
    const filter = buildQdrantFilter(body.query, mode);
    console.log(`[DashTwo] Query: "${body.query.slice(0, 80)}" | Mode: ${mode} | Filter:`, JSON.stringify(filter));
    const queryEmbedding = await embedQuery(augmentedQuery);
    const searchResults = await searchFAA(queryEmbedding, filter, 10);

    console.log(`[DashTwo] RAG: ${Date.now() - ragStart}ms | ${searchResults.length} results`);
    // Log top results to debug registry contamination
    for (const r of searchResults.slice(0, 5)) {
      console.log(`  [result] score=${r.score.toFixed(3)} doc_type=${r.metadata.document_type} content_type=${r.metadata.content_type} source=${String(r.metadata.source || r.metadata.title || '').slice(0, 60)}`);
    }

    if (aborted) return;

    // ── Step 2: Build System Prompt ─────────────────────────────────────
    const systemPrompt = buildPublicSystemPrompt(mode, body.personaPrefix);

    // Build RAG context from search results
    let ragContext = '';
    if (searchResults.length > 0) {
      ragContext = '\n\n' + RAG_RETRIEVAL_INSTRUCTIONS + '\n\n<retrieved_documents>\n';
      for (let i = 0; i < searchResults.length; i++) {
        const r = searchResults[i];
        const meta = r.metadata;
        ragContext += `<document index="${i + 1}" source="${meta.source || ''}" title="${meta.title || ''}" document_type="${meta.document_type || ''}" content_type="${meta.content_type || ''}">\n${r.text}\n</document>\n`;
      }
      ragContext += '</retrieved_documents>';
    }

    // ── Step 3: Build Messages ──────────────────────────────────────────
    const messages: Anthropic.MessageParam[] = [];
    for (const msg of history) {
      messages.push({ role: msg.role, content: msg.content });
    }
    messages.push({
      role: 'user',
      content: `<user_input>${body.query}</user_input>${ragContext}`,
    });

    // ── Step 4: Route to Model & Stream ─────────────────────────────────
    const modelKey = routeToModel(body.query, mode);
    const modelId = MODEL_IDS[modelKey];

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = anthropic.messages.stream({
      model: modelId,
      max_tokens: 2048,
      temperature: 0.3,
      system: systemPrompt,
      messages,
    });

    let fullContent = '';

    stream.on('text', (text) => {
      if (aborted) return;
      fullContent += text;
      sendSSE(res, { type: 'text', content: text });
    });

    const finalMessage = await stream.finalMessage();

    if (aborted) return;

    // ── Step 5: Citations ───────────────────────────────────────────────
    const citations = extractCitationsFromQdrant(searchResults);

    if (citations.length > 0) {
      sendSSE(res, { type: 'citations', citations });
    }

    // ── Step 6: Record Usage ─────────────────────────────────────────────
    const inputTokens = finalMessage.usage.input_tokens;
    const outputTokens = finalMessage.usage.output_tokens;

    if (userAuth) {
      recordUsage(userAuth.uid, modelId, inputTokens, outputTokens).catch(err => {
        console.error('[DashTwo] Usage recording error:', err);
      });
    }

    // ── Step 7: Done ────────────────────────────────────────────────────
    sendSSE(res, {
      type: 'done',
      usage: { inputTokens, outputTokens, model: modelId },
    });

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error('[DashTwo] Chat error:', err);
    if (!aborted) {
      sendSSE(res, {
        type: 'error',
        message: err instanceof Error ? err.message : 'Internal server error',
      });
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
}
