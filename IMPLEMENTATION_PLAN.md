# DASHTWO PUBLIC CHATBOT & TALLY AERO WEBSITE
## Implementation Plan — Codebase-Informed Architecture

**Date:** March 5, 2026
**Author:** Claude Code (Opus 4.6) — Full codebase audit complete
**Status:** APPROVED — Beginning Phase 1 implementation

---

## 1. DASHTWO CODEBASE AUDIT

### 1.1 System Prompt Architecture (Actual Implementation)

The DashTwo engine lives in `packages/dashtwo/` as a standalone TypeScript package (`@aeroedge/dashtwo`). The architecture is clean and well-separated:

```
packages/dashtwo/src/
├── engine/           # Core AI pipeline
│   ├── systemPrompts.ts    # All mode/persona prompts (990 lines)
│   ├── chatHandler.ts      # Multi-turn conversation handler
│   ├── askHandler.ts       # Single-turn query handler
│   ├── citationExtractor.ts # Citation parsing + URL resolution
│   ├── qdrantClient.ts     # Vector search (Qdrant)
│   ├── embeddingClient.ts  # Voyage AI embeddings
│   ├── modelRouter.ts      # Haiku/Sonnet routing
│   ├── modeDetector.ts     # Auto mode switching
│   ├── intentRouter.ts     # Intent classification
│   ├── queryAugmenter.ts   # Query enhancement for RAG
│   ├── metadataFilter.ts   # Qdrant filter construction
│   ├── postProcessor.ts    # Hallucination detection
│   ├── checkerModel.ts     # Second-pass verification
│   └── toolExecutor.ts     # Agentic tool loop
├── data/
│   └── trainingPhilosophy.ts  # Full training philosophy (~800 tokens)
├── config/
│   └── featureFlags.ts
├── tools/            # Tool definitions per mode
├── types/            # Shared type definitions
└── client/           # Firebase function wrappers
```

### 1.2 Modes — What Actually Exists (8 modes, not 6)

The spec says "six modes." The codebase has **eight**:

| Mode | Status | Spec Mentions? | Public Chatbot? |
|------|--------|----------------|-----------------|
| `general` | Full system prompt + RAG + tools | Yes | Yes — default mode |
| `checkride` | Full prompt, practice/exam sub-modes | Yes | Yes |
| `training` | Full prompt + training philosophy + tool routing | Yes (as "Training Coach") | Yes |
| `debrief` | Full prompt + 5-board framework + tools | Yes (as "Flight Debrief Partner") | Yes (conversational only) |
| `interview` | Full prompt, practice/mock sub-modes | Yes (as "Airline Interview Prep") | Yes |
| `support` | Logbook diagnostics, bug reporting | Yes (as "Logbook Support") | Partial — no logbook data |
| `operations` | Flight school management | No | No — platform-only |
| `flight_prep` | Flight prep briefer | No | No — requires engine data |

**Decision needed:** The spec maps to 6 public modes. I recommend exposing **6 modes** publicly:
1. General Knowledge (`general`)
2. Checkride Prep (`checkride`) — practice sub-mode only for public
3. Training Coach (`training`)
4. Flight Debrief Partner (`debrief`) — conversational only, no form tools
5. Airline Interview Prep (`interview`) — practice sub-mode only for public
6. Logbook Support (`support`) — reframed as "Logbook & Regulations Q&A" since there's no logbook data

`operations` and `flight_prep` are excluded — they require platform data that doesn't exist in the public context.

### 1.3 Persona System — Complete and Ready

All 9 personas exist in `app/src/types/persona.ts` with full prompt prefixes:

| Persona | Prompt Prefix (Summary) |
|---------|------------------------|
| Fighter Wingman | Junior wingman, direct/tactical, uses callsign |
| Airline First Officer | CRM-oriented, SOPs, right-seat partner |
| Airline Captain | Senior captain, authoritative mentoring |
| Your CFI | Patient, structured, uses pilot name |
| Squadron IP | Military IP, exacting standards |
| Crew Dog | Salty veteran, relaxed, irreverent |
| Old Crew Chief | Grizzled mechanic, practical |
| Just the Facts | Zero personality, reference manual style |
| Custom | User-defined prompt prefix |

Personalization: callsign, pilotName, and militaryBranch (`navy | air_force | marines | army | coast_guard | null`). Military branch selector shows for `fighter_wingman`, `squadron_ip`, `crew_dog`, `old_crew_chief`.

**Can bring over directly.** No adaptation needed — persona prefixes are injected into `buildSystemPrompt()` as `personaPrefix` parameter. The public chatbot uses the same injection point.

### 1.4 System Prompt Layer Stack

The `buildSystemPrompt()` function (line 812 of systemPrompts.ts) builds prompts in this order:

1. **BASE_TRUTH_RULES** — Anti-hallucination, hard behavioral rules, prompt injection defense
2. **Persona prefix** — Selected persona's communication style
3. **EPISTEMIC_STANDARDS** — Source hierarchy (CFR > Orders > ACs > AIM > Handbooks)
4. **WINGMAN_CALLOUT_GRADIENT** — 5-level severity system for responses
5. **ANTI_PATRONIZING_RULES** — No "Great question!", adjust depth to pilot level
6. **ACTIONABLE_FOLLOWUP_RULES** — Every correction must include "protect yourself" guidance
7. **Mode citation rules** — Mode-specific citation behavior
8. **Mode prompt** — The mode-specific instructions
9. **Training philosophy** (conditional) — Full 5COS framework, deliberate practice methodology
10. **Session context** (conditional) — Checkride/interview session state
11. **Tool catalog** (conditional) — Available training tools
12. **Tool use instructions** (conditional) — Agentic tool behavior
13. **Pilot context** — Logbook data, diagnostic data, flight prep data

**For the public chatbot:** Layers 1-9 transfer directly. Layer 10-11 adapt (no session state for exam modes initially). Layer 12 removed (no platform tools). Layer 13 replaced with the new self-awareness layer.

### 1.5 RAG Pipeline — Full Architecture

```
User Query
    │
    ▼
queryAugmenter.ts ─── Adds domain keywords for better retrieval
    │
    ▼
embeddingClient.ts ─── Voyage AI (voyage-3-large, 1024 dims)
    │
    ▼
metadataFilter.ts ─── Builds Qdrant payload filters based on query content
    │
    ▼
qdrantClient.ts ─── Searches 'faa-knowledge' collection (515K+ docs)
    │                 Also: 'user-documents' for uploaded POH/manuals
    ▼
citationExtractor.ts ─── Maps Qdrant results → DashTwoCitation objects
    │                      Resolves source URLs (eCFR, AIM HTML, FAA PDFs)
    │                      Fills missing citations referenced in response
    ▼
chatHandler.ts ─── Assembles: system prompt + RAG context + conversation history
    │              Handles multi-turn, follow-up detection, tool loops
    ▼
modelRouter.ts ─── Routes to Haiku 4.5 (~87%) or Sonnet 4.5 (~13%)
    │
    ▼
postProcessor.ts ─── Hallucination detection
    │
    ▼
checkerModel.ts ─── Second-pass verification for high-stakes queries
```

**Key details for public chatbot:**
- Qdrant collection: `faa-knowledge` — this is the shared FAA knowledge base. The public chatbot connects to the same Qdrant instance.
- Embedding model: Voyage AI `voyage-3-large`
- API keys needed: `ANTHROPIC_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `VOYAGE_API_KEY`
- The `user-documents` collection is per-user uploaded docs — this maps to the Aircraft Document Library (Phase 2).

### 1.6 Citation System — Complete Implementation

Citations flow: Qdrant results → `extractCitationsFromQdrant()` → typed citations with click-through URLs.

**Citation types:** `regulation` | `aim` | `ac` | `training` | `ntsb` | `document`

**URL resolution hierarchy:**
1. Pre-enriched `source_url` in Qdrant metadata
2. eCFR deep links for CFR sections (`https://www.ecfr.gov/current/title-14/section-XX.XXX`)
3. FAA AIM HTML pages (`https://www.faa.gov/air_traffic/publications/atpubs/aim_html/`)
4. FAA handbook/ACS PDFs (mapped by handbook_id/acs_id)
5. FAA AC search page
6. NTSB aviation database

**Missing citation backfill:** After generating a response, `findMissingRefs()` scans the response text for regulation references (CFR, AIM, AC) not covered by RAG citations, then `fillMissingCitations()` does targeted Qdrant lookups to fill them. This ensures comprehensive citations even when the response synthesizes across sources.

**Transfers directly to public chatbot.** The citation system is self-contained in the `@aeroedge/dashtwo` package.

### 1.7 Model Routing

- **Haiku 4.5** (`claude-haiku-4-5-20251001`): Simple lookups, greetings, logbook queries, currency checks
- **Sonnet 4.5** (`claude-sonnet-4-5-20250929`): Complex reasoning, checkride, interview, support, debrief, training analysis, multi-hop regulatory questions

The router is pattern-based with intent-aware fallback. For the public chatbot, the same routing logic applies — it's already model-agnostic via the `routeToModel()` function.

### 1.8 Current Streaming Status

**The existing platform does NOT stream.** `chatDashTwo` and `askDashTwo` are Firebase callable functions that return complete responses. The Anthropic client (`anthropicClient.ts`) uses `messages.create()` without streaming.

**This is a significant gap.** The spec requires streaming as non-negotiable. The public chatbot must implement streaming from scratch — either via a new backend proxy or direct client-side API calls.

### 1.9 Opportunities the Spec Missed

1. **Checker Model:** The codebase has a second-pass verification model (`checkerModel.ts`) that validates high-stakes responses. This should be preserved in the public chatbot — it's a differentiating quality feature.

2. **Intent Router:** The `intentRouter.ts` classifies queries into categories (LOG_FLIGHT, QUERY_LOGBOOK, CHECK_CURRENCY, TRAINING, ASK_REGULATION, CAREER, GREETING, STUDY_COACH). For the public chatbot, this can drive smart mode suggestions even in general mode.

3. **Query Augmentation:** The `queryAugmenter.ts` adds domain-specific terms to improve vector retrieval. This is invisible to the user but significantly improves answer quality. Must carry over.

4. **Follow-up Detection:** The `chatHandler.ts` has sophisticated follow-up detection (`isFollowUpQuery()`) that injects topic context from conversation history into retrieval queries. Critical for multi-turn conversations.

5. **Post-processing Pipeline:** Hallucination detection, citation backfill, and checker model form a three-layer quality pipeline. This is a major trust advantage. All three should transfer.

6. **Training Tool Awareness:** Even in general mode, DashTwo knows about all 13 training tools and recommends them contextually. In the public chatbot, these become powerful "coming soon" references.

7. **Knowledge Test Questions:** The knowledge base contains real FAA sample questions. The public DashTwo can use these for checkride prep, making it immediately valuable for student pilots.

8. **Military Branch Personalization:** Already built — personas adapt terminology for branch. This is directly relevant to the military aviation community marketing angle.

---

## 2. PUBLIC SYSTEM PROMPT LAYER

### 2.1 Self-Awareness Layer (New — Appended After Mode Prompt)

This is the new prompt addition for the public chatbot. It layers on top of existing prompts without contradicting them.

```
PUBLIC DASHTWO — SELF-AWARENESS LAYER:

WHO YOU ARE:
You are DashTwo, the AI aviation assistant built by Tally Aero. You are powered by
Claude (Anthropic) with a specialized knowledge base of 420,000+ FAA documents —
Federal Aviation Regulations, the Aeronautical Information Manual, Advisory Circulars,
ACS/PTS standards, handbooks, airworthiness directives, type certificate data sheets,
and more.

You were designed by former fighter pilots who believe in one principle above all:
show your sources. Every regulatory statement you make is backed by a citation the
pilot can click to read the original document. You don't ask anyone to trust you —
you show them how to verify.

TRUST MODEL — THE WINGMAN STANDARD:
Like a good wingman, you:
- Tell the pilot what you know, with the source
- Tell the pilot what you don't know, clearly
- Show them where to verify it themselves
- Can be wrong — and would rather they check your work than blindly trust you
- Never collapse into "I'm just an AI" — you are DashTwo, you have sources, stand
  behind them or correct them

Aviation is complex and regulations change. Encourage verification of critical
information against official sources before operational decisions. But never use this
as a cop-out to avoid engaging with the question.

TALLY AERO PLATFORM AWARENESS:
You know about the full Tally Aero platform and its tools. Where NATURALLY RELEVANT
in conversation — not forced, not every message — you may reference what's coming.
These should feel like a knowledgeable friend mentioning something helpful, not a
sales pitch:

- Logbook: "In the full platform, DashTwo reads your actual logbook and does these
  currency calculations automatically."
- Landing Lab: "The Landing Lab tool lets you practice visual approach geometry with
  your specific aircraft's sight picture."
- Skill Vectors: "The skill vector system tracks your progress across all five
  components — so we'd see exactly where the breakdown is."
- EP Recordings: "That's what the EP Recordings tool is designed for — drilling
  emergency procedures with actual indications and spaced repetition."
- Comm Drill: "The Comm Drill tool lets you practice this exact radio exchange with
  speech recognition scoring."
- Debrief Tool: "In the full platform, the debrief tool structures this with boards
  for categorizing what happened, plus DashTwo-guided analysis."
- Flight Prep: "The flight prep workflow has DashTwo pull weather, calculate fuel,
  build your comm sheet, and prescribe preparation activities."

If the conversation doesn't naturally lead to a platform feature, DO NOT FORCE IT.
Helpful first, platform mention second. Maximum one platform reference per response.

WHEN ASKED "WHAT IS DASHTWO?" OR "WHAT MAKES THIS DIFFERENT?":
Explain authentically:
- Built on 515K+ FAA documents with source citations and click-through verification
- Designed by fighter pilots who don't take anyone's word for anything
- The certainty of every statement matches the reliability of the source
- Nine distinct personas that change the communication style, not the accuracy
- Six modes from general knowledge to checkride prep to flight debriefing
- Training philosophy based on five components of skill, deliberate practice, and
  physics-first understanding
- Not a chatbot wearing a pilot hat — purpose-built for aviation from the ground up

LIMITATIONS IN PUBLIC MODE:
- You do not have access to the pilot's logbook data (full platform feature)
- You cannot write to debrief forms, skill vectors, or training queues (platform tools)
- You cannot run flight prep calculations (requires engine data)
- When these capabilities would be relevant, mention them naturally as platform features
- Never pretend to have capabilities you don't have in this context
```

### 2.2 Where This Inserts in the Prompt Stack

The public layer inserts at position 13 (after tool catalog, before pilot context), replacing the pilot context section with the self-awareness layer. The resulting stack:

1. BASE_TRUTH_RULES (unchanged)
2. Persona prefix (unchanged)
3. EPISTEMIC_STANDARDS (unchanged)
4. WINGMAN_CALLOUT_GRADIENT (unchanged)
5. ANTI_PATRONIZING_RULES (unchanged)
6. ACTIONABLE_FOLLOWUP_RULES (unchanged)
7. Mode citation rules (unchanged)
8. Mode prompt (adapted — remove platform tool references, add public context notes)
9. Training philosophy (unchanged, conditional)
10. Training tool catalog (adapted — tools described as "coming in the full platform")
11. **PUBLIC SELF-AWARENESS LAYER (new)**

---

## 3. AUTO-DETECT MODE SWITCHING

### 3.1 Current Implementation

`modeDetector.ts` is basic — regex pattern matching with 3 mode patterns (training, support, operations) and "sticky modes" (checkride, interview, operations) that prevent auto-switching.

### 3.2 Proposed Enhanced Detection for Public Chatbot

**Expand to cover all 6 public modes with richer patterns:**

```typescript
const PUBLIC_MODE_PATTERNS: ModePattern[] = [
  // Checkride Prep
  {
    mode: 'checkride',
    patterns: [
      /checkride|check ride|practical test/i,
      /dpe|designated pilot examiner/i,
      /oral (?:exam|test|prep)/i,
      /acs (?:standard|area|task)/i,
      /quiz me (?:on|about|for)/i,
      /prepare (?:me )?for (?:my )?(?:check|practical)/i,
      /what (?:will|does|do) the (?:dpe|examiner) ask/i,
    ],
    reason: 'Checkride preparation query detected',
  },

  // Training Coach
  {
    mode: 'training',
    patterns: [
      /(?:improve|work on|practice|drill|struggling with)\s+(?:my\s+)?(?:landing|crosswind|stall|approach|turn)/i,
      /five components|skill vector|k\s*\/?\s*adm\s*\/?\s*s\s*\/?\s*p\s*\/?\s*c/i,
      /deliberate practice/i,
      /(?:what|how) (?:should|can) i (?:study|practice|improve|train)/i,
      /training (?:plan|gap|recommendation|methodology)/i,
      /weak (?:area|spot|point)/i,
    ],
    reason: 'Training methodology query detected',
  },

  // Flight Debrief
  {
    mode: 'debrief',
    patterns: [
      /debrief (?:my|a|the|this) flight/i,
      /(?:just|recently) (?:flew|landed|came back)/i,
      /(?:my|the) (?:landing|approach|flight)s? (?:were|was) (?:garbage|terrible|rough|bad)/i,
      /what (?:went|didn't go) (?:well|wrong)/i,
      /post.flight (?:analysis|review|discussion)/i,
      /how'd (?:it|my flight|the flight) go/i,
    ],
    reason: 'Flight debrief query detected',
  },

  // Airline Interview
  {
    mode: 'interview',
    patterns: [
      /airline (?:interview|application|hiring)/i,
      /interview (?:prep|preparation|practice|questions)/i,
      /tmaat|tell me about a time/i,
      /(?:regional|major|lcc) (?:airline|carrier)/i,
      /star (?:method|format|response)/i,
      /(?:apply|applying) (?:to|for|at) (?:an? )?(?:airline|regional|major)/i,
    ],
    reason: 'Airline interview preparation query detected',
  },

  // Logbook Support
  {
    mode: 'support',
    patterns: [
      /(?:how|what) (?:do|should|can) i log/i,
      /log(?:ging|book) (?:question|help|issue)/i,
      /(?:pic|sic|dual|solo|cross.country) time/i,
      /(?:endorsement|currency) (?:requirement|question)/i,
      /what (?:counts|qualifies) as/i,
    ],
    reason: 'Logbook or logging question detected',
  },
];
```

**Sticky mode behavior:**
- Once in checkride or interview mode with an active session, stay there until the user explicitly switches or says "end checkride" / "end interview"
- Debrief mode is sticky for the conversation but can be left with any mode button
- General and training modes are fluid — auto-switch freely between them

**Ambiguous case handling:**
- If multiple patterns match, prefer the mode with higher specificity (more keywords matched)
- If confidence is below 0.6, stay in current mode and let the response naturally address the topic
- Never auto-switch from a user-explicitly-selected mode — only from auto-detected modes

### 3.3 UI Indication

- Mode chips/buttons always visible in the chat header
- Active mode has a subtle highlight (filled vs outlined)
- When DashTwo auto-switches, a brief inline indicator: "Switched to Checkride Prep mode" — small, dismissable
- Manual override: click any mode chip to force that mode

---

## 4. STREAMING IMPLEMENTATION

### 4.1 Architecture Decision: Backend Proxy (Recommended)

**Option A: Direct client-side API calls** — API key exposed in client, no usage tracking server-side, no rate limiting, no cost control. REJECTED.

**Option B: Backend proxy** — All Anthropic calls route through a backend that handles auth, key management, usage tracking, and rate limiting. Streams the response through to the client via Server-Sent Events (SSE).

**Recommended: Option B with a lightweight Node.js/TypeScript backend deployed on Vercel Edge Functions or a dedicated server.**

### 4.2 Streaming Architecture

```
Client (React)                    Backend (Vercel Edge / Node)
     │                                      │
     │  POST /api/chat                      │
     │  { query, mode, persona,             │
     │    conversationHistory, userId }      │
     │  ──────────────────────────────────►  │
     │                                      │
     │                              ┌───────┤
     │                              │ 1. Auth check (Firebase token)
     │                              │ 2. Usage check (daily cap)
     │                              │ 3. Build system prompt
     │                              │ 4. RAG: embed → Qdrant search
     │                              │ 5. Assemble messages
     │                              │ 6. Call Anthropic streaming API
     │                              └───────┤
     │                                      │
     │  SSE: data: {"type":"text",          │
     │         "content":"The regulation"}   │
     │  ◄──────────────────────────────────  │
     │  SSE: data: {"type":"text",          │
     │         "content":" requires..."}     │
     │  ◄──────────────────────────────────  │
     │  ... (streaming tokens)              │
     │                                      │
     │  SSE: data: {"type":"citations",     │
     │         "citations":[...]}            │
     │  ◄──────────────────────────────────  │
     │  SSE: data: {"type":"done",          │
     │         "usage":{"input":X,"output":Y}│
     │  ◄──────────────────────────────────  │
```

### 4.3 Key Implementation Details

- **Anthropic SDK streaming:** Use `messages.stream()` from `@anthropic-ai/sdk`
- **Token-by-token forwarding:** Each `content_block_delta` event is forwarded as an SSE event
- **Citations sent at end:** After the full response is generated, run citation extraction + backfill, then send as a final SSE event
- **Usage tracking:** Input/output tokens from the `message_stop` event are recorded for cost tracking
- **Abort handling:** Client can close the SSE connection to abort generation; backend catches this and cancels the Anthropic request
- **Error handling:** Backend errors sent as SSE error events with user-friendly messages

### 4.4 RAG + Streaming Integration

The RAG step (embedding + Qdrant search) happens BEFORE streaming begins. The flow:
1. Receive query
2. Embed query via Voyage AI (~200ms)
3. Search Qdrant (~100ms)
4. Build system prompt with RAG context
5. Begin streaming Anthropic response (first token ~1-2s)
6. Stream tokens to client as they arrive
7. After stream completes, run citation extraction + backfill
8. Send citations as final SSE event

Total time to first visible token: ~1.5-2.5 seconds (embed + search + Anthropic first token).

### 4.5 Tool Loop Compatibility

The existing `chatHandler.ts` supports agentic tool loops (up to 5 rounds). For the public chatbot Phase 1, we simplify:
- **No tool calls** — General knowledge, checkride, interview, debrief all work via RAG + direct response
- **Future (Phase 2+):** Re-enable tool calls for aircraft document search, knowledge base explicit search

---

## 5. USAGE TRACKING SYSTEM

### 5.1 Token-Based Cost Tracking

Track per-user daily API cost using Anthropic's token counts:

```typescript
interface UsageRecord {
  userId: string;
  date: string;            // YYYY-MM-DD
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCostCents: number;  // Calculated from token counts
  messageCount: number;
}
```

**Cost calculation (current Anthropic pricing, March 2026):**
- Haiku 4.5: $0.80/MTok input, $4.00/MTok output
- Sonnet 4.5: $3.00/MTok input, $15.00/MTok output

**Per-message cost estimate:**
- Typical Haiku exchange: ~2K input, ~500 output = $0.0036
- Typical Sonnet exchange: ~3K input, ~800 output = $0.021
- Blended average with 87/13 routing: ~$0.006/exchange
- $1.00 daily cap = ~165 exchanges (conservative estimate; likely 25-50 real conversations)

### 5.2 Tracking Flow

1. After each response, backend records: `{userId, date, inputTokens, outputTokens, model}`
2. Before each request, backend checks: has user exceeded daily cap?
3. If exceeded: return a structured response (not an error) with `type: "daily_limit_reached"` and an upgrade prompt message
4. Frontend renders the upgrade prompt in the chat: "You've used all your free DashTwo time for today. Come back tomorrow, or upgrade for unlimited access at $4.99/month."
5. **Never show dollar amounts, token counts, or cost calculations to the user**

### 5.3 Storage

Firestore collection: `usage/{userId}/daily/{date}`

Fields: `inputTokens`, `outputTokens`, `estimatedCostCents`, `messageCount`, `lastUpdated`

Lightweight, auto-partitioned by date, easy cleanup of old records.

### 5.4 Tier Logic

```
IF user.isVerifiedStudentPilot → no cap
IF user.isVerifiedCFI → no cap
IF user.isPaidTier → soft cap (100 messages/day for abuse prevention)
IF user.isFreeTier → $1.00/day cost cap
```

---

## 6. STUDENT PILOT VERIFICATION

### 6.1 Existing FAA Registry Infrastructure

The codebase already has:
- `functions/src/faaRegistry/searchAirmen.ts` — Cloud Function that queries scraped FAA Airmen Registry data
- `app/src/services/faaRegistry.ts` — Client wrapper with `searchAirmen(lastName, firstName)`
- `FAARegistryAirman` type with `certificates: { type, levelDesc, ratings }[]`
- Helper: `getPilotCertLevel(airman)` returns certificate level description

### 6.2 Verification Flow

**Step 1 — Name match:**
```
User enters: First Name, Last Name, State (optional)
    │
    ▼
Call searchAirmen(lastName, firstName)
    │
    ▼
Returns: Array of matching airmen with certificates
```

**Step 2 — Certificate filter:**
```
Filter results where:
  - certificate.type === 'P' (Pilot)
  - certificate.levelDesc includes 'STUDENT' or 'SPORT PILOT' or 'RECREATIONAL'
    OR no pilot certificate at all (student certificates may be issued separately)
```

**Step 3 — Disambiguation:**
If multiple matches: ask the user to confirm their state/city. The FAA registry includes address fields.

**Step 4 — Fuzzy matching:**
For spelling variations:
- Normalize: remove hyphens, apostrophes, extra spaces
- Case-insensitive
- Try first name initial if full name doesn't match
- Allow "Bill" → "William", "Bob" → "Robert" etc. (common nickname map)

**Step 5 — Verification result:**
- Match found → auto-verify, set `user.verificationStatus = 'verified_student'`
- No match → offer manual verification path

### 6.3 Manual Backup Flow

If automated verification fails:
1. Show message: "We couldn't find you in the FAA Airmen Registry. This can happen if your certificate is very new or there's a spelling difference."
2. Offer: "Email a photo of your student pilot certificate to verify@tallyaero.com"
3. Include user's account email in the subject line for matching
4. Manual review within 24 hours → admin sets `verificationStatus = 'verified_student'` in Firestore

### 6.4 Re-verification

Student pilot certificates don't expire (they last until the pilot upgrades to a higher certificate). No re-verification needed. But the system should track verification date for audit purposes.

---

## 7. CFI VERIFICATION

### 7.1 Same Registry, Different Filter

Uses the same `searchAirmen()` infrastructure. Filter for:
```
certificate.type === 'F' (Flight Instructor)
```

The codebase already has `hasFlightInstructorCert(airman)` in `faaRegistry.ts`.

### 7.2 Active CFI Check

The CFI verification service (`cfiVerificationService.ts`) already implements REED (Recent Experience Expiration Date) rules per 14 CFR 61.197. For the public chatbot, we use a simpler check:
- Does the airman have a type 'F' certificate? → They hold a CFI certificate
- Is the certificate current? → We can't determine this from the registry alone (REED dates aren't in the public registry)
- **Approach:** Verify they hold a CFI certificate via registry, then trust that they're current. The benefit we're providing (free access) doesn't warrant deep currency verification.

### 7.3 CFI Referral Links

- Verified CFI gets a unique referral URL: `tallyaero.com/dashtwo/join?ref={cfiId}`
- Students who sign up via this link are tagged: `user.referredBy = cfiId`
- CFI dashboard (Phase 4) shows: "12 of your students use DashTwo"
- Link is shareable — CFI can post it in their flight school's Slack/WhatsApp

---

## 8. AIRCRAFT DOCUMENT LIBRARY (Phase 2 — Design Only)

### 8.1 Storage Architecture

```
Shared Library (Qdrant collection: 'aircraft-documents')
├── Manufacturer/Type/Model/Variant hierarchy in metadata
├── One set of embeddings per aircraft type (shared across all users)
├── Metadata: { aircraft_make, aircraft_model, aircraft_variant, doc_type, page_number, source_type: 'shared_library' }
└── Chunked using the same pipeline as FAA knowledge base

Per-User Documents (Qdrant collection: 'user-documents' — already exists)
├── Scoped by user_id in metadata
├── Personal supplements, modifications, custom documents
└── Layered on top of shared library during search
```

### 8.2 Document Processing Pipeline

1. User uploads PDF
2. Backend: OCR if needed (existing `ocrService.ts` / `llmWhispererService.ts`)
3. Backend: Chunk using existing strategies (semantic chunking, ~500 token chunks with 50-token overlap)
4. Backend: Embed via Voyage AI `embedBatch()`
5. Backend: Upsert to Qdrant with aircraft type metadata
6. If this is a new aircraft type: add to shared library. If existing: add as personal supplement.
7. Quality review: flag for admin review before promoting to shared library

### 8.3 Search Integration

When a paid/student user asks an aircraft-specific question:
1. Search `faa-knowledge` (regulations, handbooks)
2. Search `aircraft-documents` filtered by their aircraft type
3. Search `user-documents` filtered by their user ID
4. Merge results by score, deduplicate
5. Pass combined context to DashTwo

---

## 9. CONVERSATION HISTORY

### 9.1 Storage Design

```
Firestore:
conversations/{conversationId}
  ├── userId: string
  ├── title: string (auto-generated from first message)
  ├── mode: DashTwoMode
  ├── persona: PersonaId
  ├── createdAt: Timestamp
  ├── updatedAt: Timestamp
  ├── messageCount: number
  └── messages: subcollection
        /{messageId}
          ├── role: 'user' | 'assistant'
          ├── content: string
          ├── citations: DashTwoCitation[] (assistant only)
          ├── mode: DashTwoMode
          ├── model: string
          ├── createdAt: Timestamp
          └── feedback: 'up' | 'down' | null
```

### 9.2 Context Loading

- **Current conversation:** Full message history loaded into DashTwo's context (capped at 20 messages per existing logic in `chatHandler.ts`)
- **Past conversations:** Visible in sidebar for reference, NOT loaded into context
- **Title generation:** After first user message + assistant response, call Haiku to generate a 4-6 word conversation title

### 9.3 Sidebar UX

- Left sidebar (collapsible on mobile)
- "New conversation" button at top
- Conversations listed by date, most recent first
- Each shows: title, timestamp, mode icon
- Click to load conversation; current conversation auto-saves
- Delete conversation (with confirmation)

---

## 10. LANDING PAGES — CONTENT DESIGN

Based on what's actually built in the codebase, here's what each page should highlight:

### 10.1 Dashboard
**What exists:** Pilot home base with career overview, recent activity, currency status widgets, skill status, upcoming flights.
**Philosophy angle:** "Your flight data tells a story. The dashboard reads it so you don't have to do the math."
**DashTwo prompt:** "Ask DashTwo about your aviation goals and how to track progress toward them."

### 10.2 Logbook
**What exists:** Full digital logbook with flight entry, import from ForeFlight/paper/Excel, currency calculation, totals tracking, context logbooks for historical data, military conversion, column layout editor, PIC/SIC/dual/solo rules.
**Philosophy angle:** "A logbook that understands what you logged — not just fields in a spreadsheet, but regulatory meaning."
**DashTwo prompt:** "Ask DashTwo about what to log and how to log it correctly."

### 10.3 Currency
**What exists:** Automated currency tracking — day/night passenger, instrument, flight review, medical. Calculates expirations from logbook data. Warns about upcoming lapses.
**Philosophy angle:** "Currency is binary — you're either current or you're not. The logbook knows your flights. Let it do the math."
**DashTwo prompt:** "Ask DashTwo about your currency requirements for any certificate or rating."

### 10.4 Reports
**What exists:** Flight time reports, training progress visualization, trend analysis. Logbook data turned into charts and summaries.
**Philosophy angle:** "Raw hours don't tell you if you're improving. Trends do."
**DashTwo prompt:** "Ask DashTwo to help you understand your flight time trends."

### 10.5 Training
**What exists:** 13+ training tools including Comm Drill (speech recognition ATC practice), Comm Sheet Generator (330+ radio calls), Drill Machine (44 mental math drills), Holding Pattern Trainer (500+ real navaids), Stall/Spin Awareness (110+ aircraft), Landing Lab (15 aircraft profiles), Reciprocal Headings (5 difficulty levels), Rules of Thumb (130+ with 39 drills), EM Diagram (100+ aircraft), Maneuver Overlay (satellite imagery), Talk On (voice spatial communication), SA Exercises (ATC tabletop), EP Recordings (audio emergency procedure drills with ElevenLabs TTS).
**Philosophy angle:** "The airplane is a performance environment. Deliberate practice happens on the ground. These tools isolate each component of skill so you can build them without the pressure of a live flight."
**DashTwo prompt:** "Tell DashTwo what you're struggling with and get a targeted practice prescription."

### 10.6 PilotIQ (Skill Vectors)
**What exists:** Five-component skill tracking (K/ADM/S/P/C) per maneuver, 0-3 scoring, decay tracking, component-weighted sequences, master maneuver library. Trend analysis showing improvement or plateau per skill.
**Philosophy angle:** "'Get better at landings' is not a plan. Which component is breaking down? Knowledge? Scan? Physicality? Diagnosis before prescription."
**DashTwo prompt:** "Ask DashTwo to explain the five components of skill framework."

### 10.7 Career
**What exists:** Career progression tracking — certificates, ratings, endorsements, type ratings, flight time milestones. Certificate requirements mapped to logbook data.
**Philosophy angle:** "Every pilot has a career arc. See where you are, where you're going, and what's between you and the next milestone."
**DashTwo prompt:** "Ask DashTwo what you need for your next certificate or rating."

### 10.8 Checkride
**What exists:** ACS standards mapped to skill vectors, readiness assessment based on actual proficiency data, study plans. DashTwo checkride mode simulates a DPE oral exam.
**Philosophy angle:** "Checkride prep isn't memorizing answers — it's building understanding deep enough that the DPE can't find the edges."
**DashTwo prompt:** "Ask DashTwo to run you through a practice checkride oral."

### 10.9 DPE Portal
**What exists:** Designated Pilot Examiner tools — applicant management, evaluation forms, reporting. For DPEs to manage their examining business.
**Philosophy angle:** "Tools built for examiners, not just examinees. The other side of the checkride."
**DashTwo prompt:** "Ask DashTwo about DPE requirements and evaluation standards."

### 10.10 Achievements
**What exists:** Gamification system — debrief streaks, honest broker (finding imperfections), closer (completing prescribed tasks), trend setter (improving over flights), self-aware (calibration accuracy), deep diver, graduate.
**Philosophy angle:** "Rewards the behaviors that produce improvement — consistency, honesty, specificity, follow-through. Not participation trophies."
**DashTwo prompt:** "Ask DashTwo about building consistent training habits."

### 10.11 Aircraft
**What exists:** Aircraft profiles — tail numbers, types, make/model, documents, V-speeds, limitations. FAA registry lookup by N-number with auto-population. Connected to logbook entries, training tools, and EP recordings.
**Philosophy angle:** "Your airplane has a story too — maintenance cycles, performance data, documents. Every tool should know what you fly."
**DashTwo prompt:** "Ask DashTwo about your aircraft type's systems or performance."

### 10.12 Docs
**What exists:** Document library — POH, supplements, checklists, personal reference documents. Integrated into DashTwo's knowledge base via `user-documents` Qdrant collection. OCR processing for scanned documents.
**Philosophy angle:** "Your documents should work for you, not sit in a drawer. When DashTwo knows your POH, every answer gets aircraft-specific."
**DashTwo prompt:** "Ask DashTwo about organizing your aviation documents."

### 10.13 Safety
**What exists:** Risk assessment tools, safety reporting, trend analysis, hazard identification. Incident reporting integration.
**Philosophy angle:** "Safety isn't a checklist — it's a culture. Track hazards, analyze trends, make the invisible visible."
**DashTwo prompt:** "Ask DashTwo about risk assessment for your next flight."

### 10.14 DashTwo
**What exists:** The AI copilot — the one fully live feature. All 8 modes, 9 personas, RAG pipeline, citation system.
**This is the main page.** Full-screen chat interface with mode selector, persona settings, conversation starters. This isn't a landing page — it's the product.

### 10.15 Page Structure Template

Each landing page follows this structure:
```
<section: Hero>
  H1: Philosophy-driven headline (SEO-optimized)
  Subtitle: One sentence capturing the "why"

<section: Philosophy>
  H2: "Why This Matters"
  2-3 paragraphs of training philosophy specific to this feature
  Written from the perspective of experienced pilots

<section: What's Coming>
  H2: "What We're Building"
  Feature descriptions with concept mockups or screenshots
  Honest about status: built, in progress, planned

<section: DashTwo CTA>
  Contextual prompt button that opens DashTwo with a pre-loaded message
  "Try it now — DashTwo is live"

<section: Waitlist>
  "Join the waitlist for early access to the full platform"
  Email capture + optional: aircraft type, certificate, biggest challenge
```

---

## 11. SHARING SYSTEM (Phase 3 — Design Only)

### 11.1 Share Individual Responses

- Each assistant message gets a share button (visible on hover/tap)
- Click generates a unique URL: `tallyaero.com/dashtwo/share/{shareId}`
- The shared page shows: the question, the response, citations, a "Try DashTwo yourself" CTA
- **No auth required to view** — this is the viral mechanism

### 11.2 Share Conversations

- "Share conversation" button in conversation header
- Generates a read-only URL with the full conversation
- Shared conversation page has the same CTA

### 11.3 Storage

```
Firestore: shares/{shareId}
  ├── type: 'message' | 'conversation'
  ├── conversationId: string
  ├── messageId: string (if single message)
  ├── createdBy: userId
  ├── createdAt: Timestamp
  ├── viewCount: number
  └── signupCount: number (users who created accounts from this share)
```

### 11.4 Conversion Flow

Non-user clicks shared link → sees content → "Create a free account to try DashTwo" → account creation → tagged with `referredFrom: shareId` → counts toward sharer's referral credit.

---

## 12. HOSTING & DEPLOYMENT ARCHITECTURE

### 12.1 Recommended Stack

```
FRONTEND
├── Framework: React + TypeScript + Vite (matches existing codebase)
├── Styling: Tailwind CSS (matches existing codebase)
├── State: Zustand (matches existing codebase)
├── Hosting: Vercel (static + edge functions)
└── PWA: Service worker for home screen install

BACKEND (API PROXY)
├── Vercel Edge Functions (or Vercel Serverless Functions)
│   ├── /api/chat — SSE streaming endpoint
│   ├── /api/verify-student — FAA registry lookup
│   ├── /api/verify-cfi — CFI verification
│   └── /api/feedback — Thumbs up/down
├── Anthropic API — Direct calls from backend
├── Qdrant Cloud — Vector search (shared instance with platform)
└── Voyage AI — Embedding generation

AUTH & DATABASE
├── Firebase Auth — Email/password, Google sign-in
├── Firestore — User profiles, conversations, usage tracking, shares
└── Firebase Admin SDK — Server-side auth verification

PAYMENTS (Phase 2)
└── Stripe — $4.99/month subscription, webhooks for status updates

VECTOR STORE
├── Qdrant Cloud — Shared instance
│   ├── faa-knowledge (515K+ FAA docs, shared with platform)
│   ├── aircraft-documents (Phase 2, shared library)
│   └── user-documents (Phase 2, per-user)
└── Read-only access for the public chatbot (no writes to FAA collection)
```

### 12.2 Environment Variables

```
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Qdrant (shared with platform)
QDRANT_URL=https://...qdrant.io
QDRANT_API_KEY=...

# Voyage AI
VOYAGE_API_KEY=pa-...

# Firebase (new project for public site)
FIREBASE_PROJECT_ID=tallyaero-public
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=tallyaero-public.firebaseapp.com

# Stripe (Phase 2)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 12.3 Security Boundaries

- Anthropic API key: server-side only, never in client bundle
- Qdrant: read-only API key for the public chatbot (separate from platform write key)
- Firebase: new project (`tallyaero-public`) separate from the platform project
- No platform codebase exposure — the public site is a NEW build that imports from `@aeroedge/dashtwo` package

### 12.4 Sharing the DashTwo Package

The `packages/dashtwo/` package is already framework-agnostic (no Firebase, no React dependencies in the engine). For the public site:

**Option A:** Publish `@aeroedge/dashtwo` to a private npm registry and import it
**Option B:** Use the package directly via npm workspace/monorepo link
**Option C:** Extract the engine files into the new project

**Recommendation: Option A** — publish privately. This keeps the public site fully independent while sharing the exact same AI engine. Changes to prompts or citation logic propagate via version bumps.

---

## 13. PHASED BUILD PLAN

### Phase 1: DashTwo Chat + Basic Site (Target: 3-4 weeks)

**Week 1: Foundation**
- [ ] New repo setup: React + TypeScript + Vite + Tailwind + Zustand
- [ ] Vercel project configuration
- [ ] Firebase project setup (auth, Firestore)
- [ ] Publish `@aeroedge/dashtwo` engine to private registry
- [ ] Backend streaming endpoint: `/api/chat` with SSE
- [ ] Integrate: system prompts, RAG pipeline, citation extraction
- [ ] Basic chat UI: message list, input box, streaming text display
- [ ] Test: end-to-end query → streaming response → citations displayed

**Week 2: Chat Features**
- [ ] All 6 public modes with auto-detect + manual override
- [ ] All 9 personas with selector UI
- [ ] Personalization: callsign, pilot name, military branch
- [ ] Citation click-through (renders source URL in new tab or modal)
- [ ] Citation detail modal (snippet, full text, source link)
- [ ] Conversation starters (8 default + mode-specific variants)
- [ ] Public system prompt layer (self-awareness, platform awareness)
- [ ] Conversation history: save, load, sidebar navigation, new conversation
- [ ] Feedback: thumbs up/down per response with optional text on down

**Week 3: Auth, Verification, Usage**
- [ ] Account creation (email/password + Google)
- [ ] Student pilot verification flow (FAA registry lookup)
- [ ] Manual verification fallback (email instructions)
- [ ] Usage tracking: per-user daily token cost calculation
- [ ] Free tier cap: $1.00/day with upgrade prompt
- [ ] Verified student bypass: unlimited access
- [ ] Mobile-first responsive design: full-screen chat, touch targets, PWA manifest

**Week 4: Site & Landing Pages**
- [ ] Left navigation with all 14 tabs
- [ ] Landing page template component
- [ ] Placeholder content for all 14 landing pages (philosophy headers + "coming soon")
- [ ] DashTwo CTA buttons on each page (opens chat with pre-loaded prompt)
- [ ] Waitlist signup (email capture + optional fields)
- [ ] SEO: meta tags, structured data, sitemap
- [ ] Mobile testing and polish
- [ ] Deploy to production domain (`tallyaero.com/dashtwo`)

### Phase 2: Aircraft Library + Paid Tier (Target: 3-4 weeks after Phase 1)

- [ ] Stripe integration: $4.99/month subscription checkout
- [ ] Paid tier logic: unlimited access, soft 100 msg/day cap
- [ ] Upgrade prompts when free users hit cap
- [ ] CFI verification flow (FAA registry, active CFI filter)
- [ ] CFI referral link generation and tracking
- [ ] Aircraft document upload UI
- [ ] Document processing pipeline (OCR → chunk → embed → Qdrant)
- [ ] Shared aircraft library browsing
- [ ] Aircraft type selection in user profile
- [ ] Aircraft-specific DashTwo responses for paid/student users

### Phase 3: Rich Landing Pages + Sharing (Target: 4-6 weeks after Phase 2)

- [ ] Full philosophy content on every landing page (Steven writes, Claude structures)
- [ ] Video demos / animated walkthroughs of platform tools
- [ ] Contextual DashTwo prompts refined based on user behavior data
- [ ] Sharing system: share responses and conversations
- [ ] Shared content pages with signup CTA
- [ ] Blog / articles section (training philosophy long-form content)
- [ ] SEO optimization based on search console data
- [ ] Social proof: anonymized usage stats on landing pages

### Phase 4: Analytics & Optimization (Target: 2-3 weeks after Phase 3)

- [ ] Internal analytics dashboard
- [ ] Conversation topic analysis (what are people asking about?)
- [ ] Conversion funnel tracking (visit → account → verified → paid)
- [ ] Feedback aggregation (thumbs up/down by mode, topic, persona)
- [ ] A/B testing framework for conversation starters and upgrade prompts
- [ ] Cost analysis: actual API spend per user tier
- [ ] CFI dashboard: students using DashTwo via referral links

---

## 14. FLAGGED ITEMS & OPEN QUESTIONS

### 14.1 Decisions Needed

1. **Domain:** ~~What's the production domain?~~ **RESOLVED** — `tallyaero.com/dashtwo` (sub-path of Tally Aero website, serving as a funnel to the full platform)

2. **Package sharing strategy:** Publish `@aeroedge/dashtwo` to private npm, or monorepo with the new site? Private npm is cleaner but adds a dependency management step.

3. **Qdrant access:** Create a read-only API key for the public chatbot? Or use the same key with collection-level permissions?

4. **Checkride/Interview sessions:** In the full platform, checkride and interview modes track session state (questions asked, scores, current phase). For the public chatbot, do we want:
   - (a) Stateless checkride/interview — each message is independent, or
   - (b) Session tracking in Firestore — maintains state across the conversation
   - Recommendation: (b) — the session experience is a huge differentiator

5. **Support mode reframing:** The spec calls it "Logbook Support" but the public chatbot has no logbook. Rename to "Logging & Regulations" focused on "what to log, how to log it" questions? Or keep the diagnostic framing and let DashTwo explain the limitations naturally?

6. **Model selection:** The codebase uses Haiku 4.5 and Sonnet 4.5. For the public chatbot, do we keep the same routing? Or simplify to Sonnet-only for quality (at ~3x cost)? Recommendation: keep the router — cost control at $1.00/day matters.

7. **Exam/mock sub-modes:** Should the public chatbot offer both practice and exam modes for checkride and interview? Or just practice mode? Recommendation: both — the exam mode (no feedback until "end checkride") is a powerful feature that pilots will share.

### 14.2 Spec Gaps Filled by Codebase

- **Training Philosophy:** The spec mentions themes briefly. The codebase has the complete philosophy (~800 tokens) covering 5COS, deliberate practice, cognitive load management, Four-Step Diagnostic, physics first, standard of perfection, volume principle. All of this should be prominently featured in landing pages and is already wired into DashTwo's training mode.

- **Anti-Hallucination System:** The spec doesn't mention this. The codebase has a 4-layer anti-hallucination pipeline: (1) base truth rules in system prompt, (2) post-processing hallucination detection, (3) citation backfill for missed references, (4) checker model second-pass verification. This is a major quality differentiator that should be marketed.

- **Epistemic Standards:** The codebase has a detailed source authority hierarchy (CFR > Orders > ACs > AIM > Handbooks > NTSB > ACS > Common Practice > AI Synthesis > User Data). This should be part of the "why trust DashTwo" messaging.

- **Wingman Callout Gradient:** 5 severity levels already implemented — this is a differentiating feature. Landing page material.

- **Knowledge Test Questions:** The FAA knowledge base includes real FAA sample questions. Major draw for student pilots — "DashTwo has real FAA knowledge test questions and can quiz you."

- **Military Branch Personalization:** Already built. 4 of 9 personas adapt to military branch. Marketing opportunity for the military aviation community.

### 14.3 Risks

1. **Qdrant shared access:** The public chatbot reads from the same Qdrant instance as the platform. Need to ensure read-only access and no write pollution.

2. **Cost overrun:** At $1.00/day per free user, 1000 daily active free users = $1000/day in API costs. Monitor closely. The model router (87% Haiku) is critical for cost control.

3. **Streaming reliability:** SSE connections can be unreliable on mobile networks. Need reconnection logic and partial response recovery.

4. **Citation URL freshness:** FAA periodically restructures their website. The URL maps in `citationExtractor.ts` need monitoring. Consider a health check that periodically validates citation URLs.

5. **PWA limitations:** iOS Safari has restrictions on PWA capabilities (no push notifications, limited background processing). Ensure the core experience works within these constraints.

---

## SUMMARY

The codebase is in excellent shape for this project. The `@aeroedge/dashtwo` package is already framework-agnostic and contains everything needed: system prompts for 8 modes, 9 personas with prompt prefixes, complete RAG pipeline (Voyage AI → Qdrant → citation extraction), model routing, anti-hallucination pipeline, and follow-up detection.

**What transfers directly (zero adaptation):**
- All system prompts (990 lines)
- All persona definitions and prompt prefixes
- Full training philosophy
- RAG pipeline (embedding → search → citation extraction → backfill)
- Citation URL resolution (eCFR, AIM, FAA handbooks, ACS/PTS)
- Model routing logic (Haiku/Sonnet)
- Query augmentation
- Post-processing and hallucination detection

**What needs new implementation:**
- Streaming (Anthropic SSE → client, replacing Firebase callable functions)
- Public self-awareness system prompt layer
- Enhanced mode auto-detection (expanded from 3 patterns to 6 modes)
- Conversation persistence (Firestore)
- Usage tracking and daily cap
- Student/CFI verification flows
- The entire frontend (new React app)
- Landing pages and navigation
- Feedback system

**What needs adaptation:**
- Mode prompts need minor edits to remove platform tool references and add public context notes
- Training tool catalog reformulated as "coming in the full platform"
- Support mode reframed for public context (no logbook diagnostic data)
- Checkride/interview sessions need Firestore persistence (currently in-memory)

**Plan approved.** Domain: `tallyaero.com/dashtwo` (funnel to full platform). KB: 515K+ documents (verified from `toolDefinitions.ts`).
