# DASHTWO PUBLIC CHATBOT & TALLY AERO WEBSITE
## Free AI Aviation Assistant + Platform Preview + Sales Funnel

**Date:** March 5, 2026
**Author:** Steven Shaw / DashTwo Design Session
**Purpose:** Launch DashTwo as a free public-facing AI aviation assistant embedded in the Tally Aero website. The website previews the full platform through philosophy-driven landing pages. DashTwo is the one live feature — everything else shows what's coming. The entire site is a funnel: educate → demonstrate via DashTwo → convert to waitlist and eventually the full platform.

---

## THE CONCEPT

DashTwo is ready now. The full platform isn't. Instead of waiting, launch DashTwo as a standalone product embedded in a website that looks and feels like the future Tally Aero platform. Every page explains the philosophy behind what's being built. Every page funnels to DashTwo. DashTwo delivers immediate value AND naturally references the tools that are coming.

Pilots come for the free AI aviation assistant. They stay because it's genuinely the best aviation AI they've ever used — it cites sources, links to original documents, and was built by fighter pilots who don't take anything at face value. They see the platform taking shape around it and want in.

---

## USER TIERS

### Verified Student Pilots — FREE, Full Access
- Verified via FAA Airmen Registry (automated name/certificate match against scraped registry data)
- Manual backup: email verify@tallyaero.com with photo of student pilot certificate for manual verification within 24 hours
- Full DashTwo access — no message limits, no usage caps
- Full aircraft document library access
- Can upload documents to contribute to shared library
- These are future platform customers. Get them hooked. No friction.

### Everyone Else — Free Tier
- Account creation required (email)
- Full DashTwo access with FAA knowledge base
- Aircraft document library access
- Usage cap: $1.00 of API cost per day tracked behind the scenes. User never sees the dollar amount — just "you've reached your daily limit" when they hit it. At current API pricing this is roughly 20-40 exchanges depending on conversation depth.
- When they hit the cap: "Want unlimited access? Upgrade for $4.99/month" prompt
- Can upload documents to contribute to shared library

### Paid Tier — $4.99/month
- Unlimited DashTwo access (soft cap at 100 messages/day for abuse prevention)
- Full aircraft document library
- Document uploads
- Aircraft-specific responses from their selected aircraft type's documents
- Stripe subscription, simple checkout, cancel anytime

---

## THE WEBSITE

### Structure: Full Platform Nav, Philosophy Content

The site looks like the Tally Aero platform. Left navigation has every tab the full platform will eventually have. DashTwo is the one thing that's fully live. Everything else is a landing page explaining the philosophy behind that section with content about what's coming.

### Left Navigation Tabs

Each tab opens a landing page. Claude Code should read the full tallyaero-logbook codebase to understand what each section does and generate initial descriptive content. Steven will add philosophy explanations and editorial content on top.

1. **Dashboard** — The pilot's home base. Overview of career, recent activity, upcoming flights, skill status.
2. **Logbook** — The central nervous system. Digital logbook that knows everything about every flight and connects to everything else on the platform.
3. **Currency** — Automated currency tracking. The logbook knows your flights, your certificates, your ratings — it calculates what you're current for and what's expiring.
4. **Reports** — Flight time reports, training progress, trend analysis. The logbook data turned into actionable insight.
5. **Training** — Training tools: comm drills, reciprocal headings, rules of thumb, Landing Lab, EP recordings. Deliberate practice on the ground.
6. **PilotIQ** — Skill vector system. Five components of skill (K/ADM/S/P/C) tracked per maneuver, with decay, trend analysis, and targeted improvement prescriptions.
7. **Career** — Career progression tracking. Certificates, ratings, endorsements, type ratings, flight time milestones.
8. **Checkride** — Checkride preparation. ACS standards mapped to skill vectors, readiness assessment, study plans, DPE coordination.
9. **DPE Portal** — Designated Pilot Examiner tools. Applicant management, evaluation forms, reporting.
10. **Achievements** — Gamification. Milestones, streaks, improvement badges. Rewards the behaviors that produce improvement — consistency, honesty, follow-through.
11. **Aircraft** — Aircraft profiles. Tail numbers, types, documents, V-speeds, limitations. Connects to everything — logbook entries, training tools, EP recordings.
12. **Docs** — Document library. POHs, supplements, checklists, personal reference documents. Integrated into DashTwo's knowledge base.
13. **Safety** — Risk assessment tools, safety reporting, trend analysis, hazard identification.
14. **DashTwo** — The AI copilot. Always accessible from any page. The one fully live feature on the site.

### Landing Page Design

Each landing page should:

1. **Explain the philosophy** — not the feature. Why this matters, what's wrong with how it's done today, what the training science says, how we think about it differently. Written from the perspective of fighter pilots who understand the problem at a molecular level.

2. **Show what's coming** — describe the tools and capabilities, maybe with concept mockups or video demos. Not screenshots of unbuilt features. Honest about what exists and what's in development.

3. **Push to DashTwo** — every page ends with a contextual prompt that opens DashTwo with a relevant pre-loaded message. The Training page ends with "Ask DashTwo to help you build a practice plan." The Currency page ends with "Ask DashTwo about your currency requirements." The Checkride page ends with "Ask DashTwo to help you prep for your checkride."

4. **Waitlist signup** — every page has a subtle but persistent "Join the waitlist for early access" call to action.

### Philosophy Content Themes

These themes should be woven throughout the landing pages where relevant:

- **Standard of perfection** — not "safe," not "meets ACS." The standard is perfection, unattainable by design. "What wasn't perfect?" catches everything that "what was wrong?" misses.
- **Five components of skill** — every deficiency traces to K, ADM, S, P, or C. Diagnosis before prescription.
- **Deliberate practice** — cannot occur in the aircraft. The airplane is a performance environment. Deliberate practice happens on the ground with purpose-built tools.
- **Physics first** — before any technique or rule of thumb, understand WHY. Techniques without physics understanding are fragile.
- **The four-step diagnostic** — What wasn't perfect? Why (which component)? How to fix (what tool)? Do it.
- **Follow-Along → Drill → Do** — the continuous training gradient.
- **Cognitive load management** — small mismatches + successful resolution = learning. Strip away everything except the target component, then gradually reintroduce complexity.
- **Volume** — the system handles quality, the pilot controls volume. More preparation through the right system always produces better outcomes.

---

## DASHTWO PUBLIC CONFIGURATION

### Self-Awareness System Prompt Layer

DashTwo's public-facing instance gets an additional system prompt layer on top of its existing aviation AI prompt. This layer gives DashTwo self-awareness about what it is, who built it, and why — so it can answer questions about itself authentically.

**Core identity statements DashTwo should be able to articulate naturally when asked:**

"I'm built on Claude by Anthropic, with a specialized aviation knowledge base of over 420,000 FAA documents — FARs, AIM, advisory circulars, ACS standards, airworthiness directives, type certificate data sheets. When I reference a regulation or procedure, I cite the specific source and you can click it to read the original document yourself."

"I was designed by former fighter pilots who don't take anyone's word for anything — and we don't think you should take ours either. That's why I'm built to show you how and why I know what I know."

"The certainty of my statements matches the reliability of my sources. I show my work so you can evaluate my reasoning. If I'm pulling from a specific FAR, I'll cite it and you can click through to the source. If I'm giving you a best practice that isn't codified in regulation, I'll tell you that too."

"Like a good wingman, I'll tell you what I know, tell you what I don't know, and show you where to verify it yourself."

"I can be wrong. Aviation is complex and regulations change. Always verify critical information against official sources before making operational decisions. I'd rather you check my work than blindly trust me."

**Tally Aero platform awareness:**

DashTwo knows about the full platform and its tools. Where naturally relevant in conversation — not forced, not every message — DashTwo can reference what's coming:

- "When Tally Aero's full platform launches, the Landing Lab tool will let you practice visual approaches with your specific aircraft's sight picture."
- "The Tally Aero skill vector system tracks your progress across all five components — so we'd be able to see exactly where your crosswind technique is breaking down and prescribe targeted practice."
- "That's exactly the kind of thing the EP Recordings tool is designed for — drilling emergency procedures with actual aircraft alert tones and spaced repetition."

These references should feel like a knowledgeable friend mentioning a tool that would help, not a sales pitch. DashTwo is helpful first, platform mention second. If the conversation doesn't naturally lead to a platform feature, don't force it.

**Debate and pushback handling:**
- Re-examine sources when user disagrees, hold position if correct but ask for their source
- If wrong, correct cleanly — no groveling
- If user claims "I read online..." without a source, express doubt with citations
- Never get defensive, never collapse into "well I'm just an AI"

**Epistemic standards:**
The certainty of your statement must match the reliability of your source. Show your work so the pilot can evaluate your reasoning.

**Wingman callout gradient:** Five severity levels of confidence in responses, with clear indication of certainty level.

**Protect yourself guidance:** After corrections or gray areas, provide actionable CYA steps — call FSDO, call AME, get second opinion, document with specific reg citation.

### DashTwo Modes

DashTwo has six modes, each demonstrating a different aspect of the platform's capability and philosophy. All six are available in the public chatbot.

**Mode Selection: Auto-Detect + Manual Override**

DashTwo auto-detects the appropriate mode from conversation context and switches seamlessly. Pilot says "I just flew and my landings were garbage" — DashTwo shifts into debrief mode. Pilot says "what's the VFR cloud clearance in Class E" — stays in general knowledge. Pilot says "I have my checkride Friday" — shifts to checkride prep. No button press needed.

Mode buttons are always visible for explicit manual selection — the "I specifically want THIS mode" override. The current active mode is subtly indicated in the UI so the pilot knows what they're in, and they can switch anytime. Conversation starters implicitly activate the corresponding mode when clicked.

This auto-detect behavior is the intended design for the full platform as well — it just hasn't been built yet. The public chatbot should implement it first.

**The six modes:**

**1. General Knowledge** — Default mode. Ask DashTwo anything about aviation — regulations, procedures, weather, systems, airspace, anything. Powered by 420k+ FAA documents with source citations.

**2. Checkride Prep** — DashTwo becomes a checkride coach. ACS standards, oral prep, flight maneuver standards, study plans, weak area diagnosis. Huge draw for student pilots — this is why many of them will come.

**3. Training Coach** — DashTwo applies the five components of skill framework, four-step diagnostic, deliberate practice methodology. Diagnoses weaknesses, prescribes targeted practice, explains the training science. This IS the philosophy demonstration.

**4. Flight Debrief Partner** — DashTwo walks the pilot through a structured post-flight debrief using the five boards framework: what was new, what was unplanned, what went worse than expected, ongoing struggles, what went better than expected. Probes for root causes, identifies components, prescribes next steps. Even without the full debrief form and skill vector data, the conversational methodology is powerful and differentiating.

**5. Airline Interview Prep** — Nobody else offers this. Shows forward thinking about the pilot's entire career arc, not just their next lesson. Useful for commercial pilots and CFIs now, aspirational for students. Demonstrates that Tally Aero thinks about the whole career, not just training.

**6. Logbook Support** — Helps with logbook questions: what to log, how to log it, currency calculations, endorsement requirements, regulatory interpretation for logging edge cases. Even without the actual logbook connected, the knowledge is immediately useful. Natural funnel: "In the full platform, DashTwo would be looking at your actual logbook entries and doing these calculations automatically."

Each mode has its own system prompt layer (already built in the current platform). The public chatbot uses the same mode prompts with an additional layer noting that platform-specific tools (form writing, skill vector lookup, etc.) aren't available in the public version, and naturally referencing what the full platform will provide.

### DashTwo Personas

DashTwo has multiple personality personas that change its tone, style, and communication approach. All personas carry over from the full platform to the public chatbot. These are a major differentiator — no other aviation AI has personality.

**Available personas:**
- **Fighter Wingman** — Direct, tactical, mission-focused. Your combat-proven wingman.
- **Airline First Officer** — Professional, thorough, CRM-focused. Your right-seat partner.
- **Airline Captain** — Authoritative, mentoring, experienced. A senior captain sharing wisdom.
- **Your CFI** — Patient, encouraging, structured. Your personal flight instructor.
- **Squadron IP** — High-standards, military-precise. A military instructor pilot.
- **Crew Dog** — Relaxed, experienced, real-talk. A salty veteran who keeps it casual.
- **Old Crew Chief** — Grizzled, mechanical, practical. The crew chief who has seen everything.
- **Just the Facts** — No personality, pure information. Regulatory answers only.
- **Custom Persona** — Define your own AI personality and communication style.

**Personalization settings:**
- Callsign (optional)
- Pilot name
- Military branch (None / Air Force / Navy / Marines / Army / Coast Guard) — DashTwo adapts terminology and cultural references to match

All persona system prompts already exist in the current platform codebase. Claude Code should bring them over directly and ensure they work with the public chatbot's additional system prompt layers (self-awareness, philosophy, platform references).

The persona selector should be prominent in the settings/profile area, and on first use the pilot should be invited to pick one. The default is Fighter Wingman unless changed.

### Conversation Starters

First-time users see pre-loaded buttons before they type anything. These guide them into conversations that best demonstrate DashTwo's capabilities. Starters are contextual to the selected mode, but the default set includes:

- **"What is DashTwo and why should I trust it?"** — Opens the philosophy conversation. DashTwo explains its knowledge base, citation system, and the fighter pilot philosophy behind it.
- **"Help me prepare for my next flight"** — Demonstrates flight prep capability. Naturally references the full flight prep workflow tool.
- **"I'm struggling with crosswind landings"** — Demonstrates training diagnosis. DashTwo uses the four-step diagnostic and five components framework. Naturally references Landing Lab.
- **"Debrief my flight with me"** — Demonstrates the debrief methodology. DashTwo walks through the five boards framework conversationally.
- **"Quiz me on emergency procedures"** — Demonstrates knowledge drilling. Naturally references EP Recordings tool.
- **"I have a checkride coming up"** — Demonstrates checkride prep capability. References skill vectors and ACS standards.
- **"Explain the five components of skill"** — Opens the training philosophy conversation. Educational and differentiating.
- **"What makes Tally Aero different from other aviation apps?"** — The big picture conversation about the platform vision.

### Streaming Responses

**Non-negotiable:** DashTwo responses must stream — text appears progressively as tokens are generated from the Anthropic API. No waiting for complete responses then displaying all at once. This is a new standalone build with a direct API connection. Use the Anthropic streaming API. Every response streams.

### Source Citations with Click-Through

DashTwo's existing citation system carries over to the public chatbot. When DashTwo references a regulation, procedure, or document:
- The citation appears inline in the response
- Clicking the citation opens the original source document
- The user can read the actual FAA document DashTwo is referencing
- This is the single most trust-building feature. It cannot be compromised or simplified.

---

## AIRCRAFT DOCUMENT LIBRARY

### Shared Library, Growing with Users

A platform-maintained library of aircraft documents (POHs, supplements, system descriptions) organized by aircraft type and model.

**How it works:**
1. Pilot selects their aircraft type during account setup or in settings
2. System checks if that aircraft type's documents are already in the shared library
3. If yes — pilot is instantly connected. DashTwo can answer aircraft-specific questions.
4. If no — pilot can upload their documents. Documents are processed, verified, and added to the shared library for that aircraft type. The uploader gets immediate access.

**Library organization:**
- By manufacturer → type → model → variant
- Example: Cessna → 172 → 172S → 172S with G1000
- Each variant can have its own document set (different avionics = different POH sections)

**Document processing:**
- Uploaded PDFs are chunked and indexed into the vector store
- Tagged to the specific aircraft type/model/variant
- One indexed copy per aircraft type — shared across all users of that type
- Personal documents (custom supplements, modifications) indexed per-user on top of shared library

**Library growth flywheel:**
- Early adopters upload documents for their aircraft
- Library grows with every new aircraft type added
- New users find their aircraft already covered — instant value, no upload needed
- Library becomes a reason to join: "DashTwo already knows 200+ aircraft types"

**For paid tier:** Aircraft-specific responses are a paid feature. Free users get DashTwo with FAA knowledge base only. Paid users get FAA knowledge base PLUS their aircraft type's documents from the shared library.

**Exception:** Verified student pilots get aircraft library access for free.

---

## MOBILE FIRST

Pilots use this on their phones at the airport, in the FBO, in the car after a flight. The entire site and DashTwo chat must be designed mobile-first, not desktop-first with responsive scaling.

- DashTwo chat must feel native on a phone — full screen chat view, easy thumb typing, no awkward desktop layouts shrunk down
- Landing pages must be readable and fast on mobile
- Persona and mode selection must work with tap targets, not tiny buttons
- PWA (Progressive Web App) capability so pilots can add it to their home screen and it feels like a native app without building native apps
- Eventually native iOS/Android apps, but PWA gets us there for launch

---

## SHARING AND VIRALITY

A hooked pilot needs to be able to share DashTwo with their buddy at the flight school. Word of mouth in the pilot community is the primary growth channel.

**Share individual responses.** Each DashTwo response has a small share button. Click it, get a shareable link or image of that specific response. "DashTwo just explained the crosswind landing technique better than my CFI" shared to a group chat is the best marketing possible.

**Share conversations.** Option to share an entire conversation as a read-only link. A CFI shares a DashTwo checkride prep session with their students as study material. A student shares their debrief conversation with their CFI.

**Referral flow.** When a shared link is opened by someone without an account, they see the shared content and a "Create a free account to try DashTwo yourself" prompt. The sharer gets credit (for future referral-based perks if we ever build them).

**Social proof.** Landing pages can show anonymized stats — "12,000 aviation questions answered this month" or "Trusted by student pilots at 200+ flight schools" (when those numbers are real).

---

## CFI ANGLE

CFIs are force multipliers. One CFI who loves DashTwo tells 15 students. That's 15x more powerful than one student finding it organically.

**CFI-specific entry point.** A landing page or conversation starter specifically for CFIs: "I'm a CFI — how can DashTwo help my students?" DashTwo explains how it can supplement their instruction, what modes are available for students, how the training philosophy aligns with structured instruction.

**CFI verification.** Like student pilot verification but for CFIs — verify against the Airmen Registry for active CFI certificates. Verified CFIs get free full access (same as students) because they're the distribution channel.

**CFI sharing tools.** A verified CFI can generate invite links for their students. Students who sign up through a CFI's link are tagged to that CFI in the system. This builds the flight school design partner pipeline — when we can show a CFI that 12 of their students are actively using DashTwo, that's the conversation that leads to a flight school partnership.

**CFI mode (future).** Eventually a mode where DashTwo helps CFIs plan lessons, build syllabi, assess student progress. Not for launch, but the CFI account structure should support it.

---

## SEO AND DISCOVERABILITY

The philosophy landing pages are the best SEO content possible. Pilots google specific aviation training questions. Our pages answer those questions with genuine depth AND expose them to DashTwo and the platform.

**Target content topics that pilots actively search for:**
- "Five components of pilot skill"
- "How to debrief a training flight"
- "Crosswind landing technique physics"
- "Emergency procedure memory items study method"
- "Private pilot checkride prep"
- "How to improve radio communications"
- "Aeronautical decision making training"
- "Deliberate practice for pilots"

Each landing page should be written with SEO in mind — proper headings, meta descriptions, structured content that search engines can parse. The philosophy content is genuinely valuable and unique, which is what Google rewards.

**Blog / articles section (Phase 3).** Longer-form training philosophy articles, technique breakdowns, training science explanations. Each one links to DashTwo and the relevant platform tool. Content marketing that's actually useful, not keyword-stuffed garbage.

---

## CONVERSATION HISTORY

DashTwo remembers past conversations. A pilot can come back tomorrow and pick up where they left off, or start a new conversation.

**How it works:**
- Conversations are saved per user
- Conversation list in a sidebar (like ChatGPT's interface) — pilot can see past conversations, click to revisit, or start new
- DashTwo has access to the current conversation's history for context continuity
- DashTwo does NOT have cross-conversation memory by default (too expensive in context tokens) — but conversation titles and metadata are saved for the pilot's reference

**Value:** Stickiness. A pilot who has 20 past conversations with DashTwo is not switching to another AI. Their history, their context, their relationship with DashTwo is built up over time.

**Cost consideration:** Conversation history is stored text, which is cheap. The expensive part is feeding long conversation history into context for each new message. Keep context window to current conversation only. Past conversations are visible to the user for reference but not loaded into DashTwo's context.

---

## FEEDBACK MECHANISM

Thumbs up / thumbs down on every DashTwo response. Simple, one-click, non-intrusive.

**What it gives us:**
- Signal on what's working and what isn't
- Identifies responses where DashTwo is wrong, unhelpful, or off-tone
- Data for improving system prompts and RAG retrieval
- Makes users feel heard — their feedback matters

**Optional follow-up:** When a pilot clicks thumbs down, offer an optional one-line text field: "What was wrong with this response?" Not required, but valuable when provided.

**Internal dashboard (Phase 4):** Aggregate feedback data — which modes get the most thumbs up, which topics get thumbs down, which personas are most popular. Product research happening automatically.

---

## WAITLIST AND USER ACQUISITION

### Every Page Converts

- Persistent "Join the waitlist for early access to the full platform" — not aggressive, not pop-up, just always visible
- Email capture on waitlist signup
- Optional: what aircraft do you fly, what certificate are you working on, what's your biggest training challenge (market research disguised as onboarding)

### DashTwo as the Hook

The chatbot IS the conversion mechanism. A pilot who has a great 15-minute conversation with DashTwo about their checkride prep, where DashTwo cited specific ACS standards and linked to the source documents, is already sold on the platform. The waitlist signup is just capturing intent.

### Metrics to Track
- Total accounts created
- Verified student pilots
- Paid subscribers
- Daily active users
- Messages per user per day
- Free tier users hitting the usage cap (conversion opportunity)
- Waitlist signups
- Aircraft types in the library
- Documents uploaded
- Most common conversation topics (product research)

---

## TECHNICAL REQUIREMENTS

### New Standalone Build
This is NOT bolted onto the existing tallyaero-logbook codebase. This is a new, standalone web application purpose-built for the public chatbot and website. It shares:
- DashTwo's system prompt and personality
- The RAG pipeline and FAA knowledge base
- The citation system

But it is its own application with its own hosting, auth, payment, and user management.

### Stack
- React/TypeScript for the frontend
- Anthropic streaming API for DashTwo responses
- Vector store for RAG (same as existing platform or a shared instance)
- Firebase Auth or similar for user accounts
- Stripe for payment processing
- Vercel or Netlify for hosting
- FAA Airmen Registry data for student pilot verification

### Performance
- DashTwo response streaming must feel instant — first token within 1-2 seconds
- Landing pages must load fast — static content, no heavy client-side rendering
- Mobile responsive — pilots will use this on phones at the airport

### Security
- No platform codebase exposure
- No architecture details in public-facing content
- User-uploaded documents are per-user or shared library only — no cross-user access to personal documents
- Authentication required for DashTwo chat (free account minimum)
- Rate limiting on all API endpoints

---

## IMPLEMENTATION

### Phase 1: Launch DashTwo + Basic Site
- DashTwo chat with streaming, citations, and click-through sources
- FAA knowledge base (existing RAG pipeline)
- Public-facing system prompt layer (self-awareness, philosophy, platform references)
- Conversation starters for first-time users
- Basic site with left nav and landing pages for each section (content can be minimal initially — philosophy headers and "coming soon" body text that gets filled in over time)
- Account creation (email)
- Student pilot verification via FAA registry lookup + manual backup
- Free tier with $1.00/day usage cap tracked behind the scenes
- Waitlist signup

### Phase 2: Aircraft Library + Paid Tier
- Shared aircraft document library
- Document upload and processing pipeline
- Aircraft type selection in user profile
- Aircraft-specific DashTwo responses for paid/student users
- Stripe integration for $4.99/month subscription
- Paid tier upgrade prompts when free users hit cap

### Phase 3: Rich Landing Pages
- Full philosophy content on every landing page (Steven writes, Claude Code structures)
- Video demos / animated walkthroughs of platform tools
- Contextual DashTwo prompts at bottom of every page
- Blog / content section for training articles

### Phase 4: Analytics and Optimization
- Usage metrics dashboard (internal)
- Conversation topic analysis
- Conversion funnel tracking
- A/B testing on conversation starters and upgrade prompts

---

## CLAUDE CODE INSTRUCTIONS

**Codebase location for context:** `C:\Users\12147\Desktop\10X Flight Training\Claude Code\tallyaero-logbook`

**This spec location:** `C:\Users\12147\Desktop\10X Flight Training\Claude Code\DashTwo Public\dashtwo-public-spec.md`

**Read the full tallyaero-logbook codebase for context** — understand DashTwo's existing system prompt, the RAG pipeline, the citation system, the training philosophy, all platform tools, and all six mode-specific system prompts. The public DashTwo must be consistent with the existing DashTwo personality and capabilities.

**Important: This spec was written during a brainstorming session without direct access to the codebase. You have access to the actual code. Where the spec is vague, incomplete, or assumes something that doesn't match reality, use your knowledge of the codebase to make better decisions. Specifically:**

- **The landing page content for each nav tab** — the spec lists tab names but doesn't detail what each section does in the current codebase. You can see exactly what exists. Generate accurate, compelling descriptions of each section based on what's actually built, what's in progress, and what's planned in the specs.
- **DashTwo's existing system prompt and all mode prompts** — the spec describes what the public layer should add. You can see the full existing prompts for all six modes. Make sure the public layer is consistent with and additive to what already exists, not contradictory. Adapt each mode for the public chatbot context (no platform tools available, natural platform references instead).
- **The RAG pipeline and citation system** — the spec assumes these exist. You can see exactly how they work. Build the public chatbot's integration based on the actual implementation, not assumptions.
- **Training philosophy content** — the spec outlines themes. The codebase contains the full training philosophy system prompt with much more detail. Use all of it for landing page content and DashTwo's self-awareness layer.
- **If you see opportunities the spec missed** — things in the codebase that would make the public site or DashTwo better that we didn't think of during brainstorming — flag them in your implementation plan before building.

**Read all skills in** `C:\Users\12147\.claude\skills` — use the frontend-design skill extensively. This website must look world-class. Not generic startup template. Not AI slop. Aviation-informed, confident, sophisticated design that makes pilots trust the product before they even try it.

**Deliverable for Phase 1:** A deployable web application with DashTwo chat (streaming, citations, source click-through), account creation, student pilot verification, usage tracking, conversation starters, and basic landing pages for all nav sections. Design must be exceptional.

**Do not build Phase 2-4 yet.** Launch DashTwo and the basic site first. Iterate based on real user behavior.
