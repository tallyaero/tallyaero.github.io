/**
 * Share API endpoints
 *
 * POST /api/share — Create a shareable link for a message or conversation
 * GET /api/share/:id — Retrieve shared content and increment view count
 */

import type { Request, Response } from 'express';
import { adminDb } from '../engine/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

function generateShareId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

interface ShareRequestBody {
  type: 'message' | 'conversation';
  content: string;
  query?: string;
  citations?: any[];
  conversationMessages?: Array<{ role: string; content: string; citations?: any[] }>;
  mode: string;
}

export async function handleCreateShare(req: Request, res: Response) {
  try {
    const { type, content, query, citations, conversationMessages, mode } = req.body as ShareRequestBody;

    if (!type || !content || !mode) {
      return res.status(400).json({ error: 'Missing required fields: type, content, mode' });
    }

    if (type !== 'message' && type !== 'conversation') {
      return res.status(400).json({ error: 'type must be "message" or "conversation"' });
    }

    const shareId = generateShareId();

    const shareData: Record<string, any> = {
      type,
      content,
      mode,
      createdAt: FieldValue.serverTimestamp(),
      viewCount: 0,
    };

    if (query) shareData.query = query;
    if (citations && citations.length > 0) shareData.citations = citations;
    if (conversationMessages && conversationMessages.length > 0) {
      shareData.conversationMessages = conversationMessages;
    }

    await adminDb.collection('shares').doc(shareId).set(shareData);

    const url = `/share/${shareId}`;
    res.json({ shareId, url });
  } catch (err) {
    console.error('[Share] Error creating share:', err);
    res.status(500).json({ error: 'Failed to create share' });
  }
}

export async function handleGetShare(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    if (!id || id.length !== 8) {
      return res.status(400).json({ error: 'Invalid share ID' });
    }

    const docRef = adminDb.collection('shares').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Increment view count
    await docRef.update({ viewCount: FieldValue.increment(1) });

    const data = doc.data()!;
    // Convert Firestore timestamp to ISO string
    const createdAt = data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString();

    res.json({
      id,
      type: data.type,
      content: data.content,
      query: data.query || null,
      citations: data.citations || [],
      conversationMessages: data.conversationMessages || [],
      mode: data.mode,
      createdAt,
      viewCount: (data.viewCount || 0) + 1,
    });
  } catch (err) {
    console.error('[Share] Error getting share:', err);
    res.status(500).json({ error: 'Failed to get share' });
  }
}
