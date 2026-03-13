# 2vX — DASHTWO VS. ANYTHING
## Side-by-Side Aviation AI Comparison Feature

**Date:** March 5, 2026
**Author:** Steven Shaw / DashTwo Design Session
**Purpose:** A comparison feature where pilots can see DashTwo's response next to any competing AI's response to the same prompt. The most honest marketing move possible — don't trust us, compare us, see for yourself.

---

## THE CONCEPT

Instead of claiming DashTwo is the best aviation AI, let pilots verify with their own eyes. They type a question, DashTwo answers, and with one click they see how any other AI handles the same question. Side by side. Same prompt. Let the output speak for itself.

---

## TWO COMPARISON MODES

### Mode 1: API Comparisons (Fully Automated Split-Screen)

For AI models we can access via API. One click, both responses stream simultaneously.

**How it works:**
1. Pilot types a prompt in DashTwo (left side).
2. Pilot clicks "Compare" and selects from a dropdown: ChatGPT / Gemini / Base Claude (no RAG).
3. On a single click: DashTwo's response streams on the left, the selected model's response streams on the right. Simultaneously. Same prompt. Real time.
4. No additional action from the user. One click, both answers appear.

**Available API comparisons:**
- **Base ChatGPT** (OpenAI API) — no aviation training, no RAG, no citations
- **Base Gemini** (Google API) — no aviation training, no RAG, no citations
- **Base Claude without RAG** (Anthropic API) — same underlying model as DashTwo, but without the 420k+ FAA document knowledge base and training philosophy. This is the most powerful comparison because it isolates exactly what the RAG pipeline and aviation-specific engineering adds.

**Transparency note displayed on every API comparison:**
"Comparing DashTwo (powered by Claude with 420k+ FAA document knowledge base) against [model name] standard API. The comparison model has no aviation-specific training or documents."

**Cost:** Minimal. Each comparison is one additional API call — a few cents. Only triggered when the user explicitly clicks Compare, not on every DashTwo interaction.

### Mode 2: Link-Out Comparisons (One Click + One Paste)

For competitor products we can't access via API — their actual websites.

**How it works:**
1. Pilot types a prompt in DashTwo (left side). DashTwo answers.
2. Pilot clicks "Compare" and selects a competitor from the dropdown: Farbot / PilotGPT / MagicAI / ChatGPT (consumer) / Other.
3. On a single click:
   - The prompt is automatically copied to the pilot's clipboard
   - The competitor's website opens in a new browser window
   - A small toast notification appears: "Prompt copied — paste into [competitor name]"
4. Pilot pastes (Ctrl+V / Cmd+V) into the competitor's chat and compares.

**URL auto-populate (where possible):** Before launch, test each competitor's URL structure. If any accept query parameters (e.g., `competitor.com/chat?q=your+question+here`), use that to auto-populate the prompt on their site — making it truly one click, zero paste. Test:
- Farbot
- PilotGPT
- MagicAI
- ChatGPT (chat.openai.com)
- Google Gemini (gemini.google.com)
- Any others in the aviation AI space

If URL auto-populate works for a given competitor, the experience is: one click → their site opens with the prompt already loaded → pilot just hits enter.

**Competitor dropdown list:**
Maintain a configurable list of competitors with:
- Display name
- URL to open
- Whether URL auto-populate is supported
- URL template if auto-populate works (e.g., `https://competitor.com/chat?q={prompt}`)

New competitors can be added to the list without code changes.

**Legal position:** We are not embedding, scraping, iframing, or calling any competitor's product. We are opening a hyperlink to their public website — the same thing a user does when they type a URL in their browser. We're also sending them traffic. If anything, this benefits them.

---

## UI DESIGN

### The Compare Button

After DashTwo responds to any prompt, a "Compare" button appears below or beside the response. Not aggressive — subtle but visible. Pilots who want to compare click it. Pilots who don't, ignore it.

### The Comparison Dropdown

Clicking Compare opens a dropdown with two sections:

**Live Comparison (API):**
- ChatGPT
- Gemini
- Base Claude (no aviation training)

**Try It Yourself:**
- Farbot
- PilotGPT
- MagicAI
- ChatGPT (consumer)
- Gemini (consumer)
- [Other — configurable]

### Split-Screen Layout (API Comparisons)

Left side: DashTwo's response (already displayed).
Right side: Competitor's response streaming in.

Clear labels on each side:
- Left: "DashTwo — 420k+ FAA documents, aviation-trained"
- Right: "[Model name] — general purpose AI, no aviation training"

Both responses remain visible for the pilot to scroll, compare, and evaluate.

### Link-Out Layout (Website Comparisons)

DashTwo stays in the current window. Competitor opens in a new window. The pilot arranges them however they want. On desktop, the browser can be prompted to position the new window to the right (using `window.open` with position parameters) to approximate a side-by-side layout automatically.

---

## WHAT MAKES DASHTWO WIN

In any side-by-side comparison, these advantages are immediately visible:

- **Citations with click-through** — DashTwo cites the specific FAR, AIM section, or AC and the pilot clicks to read the source document. Generic LLMs either don't cite or hallucinate citation numbers.
- **Aviation-specific depth** — DashTwo answers from 420k+ FAA documents. Generic LLMs answer from general internet training data.
- **Training philosophy** — DashTwo doesn't just answer questions, it diagnoses using the five components framework and prescribes specific improvement actions. Generic LLMs give generic advice.
- **Personality and tone** — DashTwo sounds like a pilot talking to a pilot. Generic LLMs sound like a computer.
- **Honesty about uncertainty** — DashTwo says when it's not sure and tells you where to verify. Generic LLMs present everything with equal confidence.

---

## PRE-RECORDED COMPARISONS (Marketing Content)

Separate from the live comparison feature, create marketing content from pre-recorded comparisons:

1. Take 20-30 common pilot questions spanning regulations, training technique, emergency procedures, weather, checkride prep.
2. Ask each major competitor the same questions.
3. Screenshot or screen-record their responses with dates.
4. Create comparison pages / blog posts / social media content showing DashTwo's live response next to the competitor's recorded response.

Format: "We asked 5 aviation AIs the same 20 questions. Here's what happened."

Each comparison links to DashTwo where the pilot can try it live themselves. Every piece of comparison content is a funnel back to the product.

**Label all pre-recorded responses clearly:** "[Competitor name] response captured on [date]. DashTwo response is live."

---

## RISK MITIGATION

**The risk is DashTwo losing a comparison.**

Before launching 2vX:
- Test extensively with the 50 most common pilot questions across all competitors
- Identify any question types where competitors perform better — fix those in DashTwo before launching
- Launch API comparisons first (against base LLMs where DashTwo's advantage is largest)
- Add link-out comparisons to aviation-specific competitors only after thorough testing
- Monitor which comparisons users run and flag any where DashTwo underperforms — that's immediate product feedback

**Ongoing:** If a competitor improves and starts winning comparisons on certain topics, that's a signal to improve DashTwo in those areas. The comparison feature is both marketing and product development feedback.

---

## IMPLEMENTATION

### Phase 1
- Compare button on DashTwo responses
- API split-screen comparisons against ChatGPT, Gemini, and base Claude
- Both responses streaming simultaneously
- Transparency labels

### Phase 2
- Link-out comparisons with clipboard auto-copy
- URL auto-populate testing for each competitor
- Configurable competitor dropdown list

### Phase 3
- Pre-recorded comparison content for marketing
- Comparison landing page ("DashTwo vs. the field")
- Social media and blog content from comparisons

---

## PHILOSOPHY

This feature IS the DashTwo philosophy applied to marketing. "The certainty of your statement should match the reliability of your source. Show your work so the pilot can evaluate your reasoning."

We don't ask pilots to trust our marketing. We give them the tools to evaluate us against the competition themselves. Same approach DashTwo takes with aviation knowledge — here's the answer, here's the source, verify it yourself.

If we're not confident enough to let pilots compare us side by side, we shouldn't be launching.
