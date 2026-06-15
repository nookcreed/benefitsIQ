# BenefitsIQ — 3-Minute Demo Video Script

**Runtime: 2:55** (hard cap 3:00 — Stage One disqualifies anything over)

This script is designed to be given to an AI video tool or human editor to produce a polished demo with voiceover. Every second is mapped, every visual is specified, and every segment maps to one of the five judging criteria.

---

## Production Notes

- **Resolution**: 1920×1080, 60fps
- **Tone**: Confident, warm, civic. Not corporate — this is a public service tool. Think PBS meets Y Combinator demo day.
- **Pacing**: ~145 words/min. Let the visuals breathe — don't rush.
- **Typography on screen**: Use a clean sans-serif (Inter or Public Sans). Key stats and pull-quotes should appear as text overlays so judges who watch on mute still get the message.
- **Color palette**: Treasury green (#155C43), warm paper (#F5F0E8), white cards — match the app's "Civic Trust" design.
- **Music**: Subtle, optimistic underscore. Fade under voiceover, swell at the close. No lyrics.
- **Live app URL**: https://benefitsiq-app-7474659675348398.aws.databricksapps.com

---

## The Script

### ACT 1: THE PROBLEM (0:00 – 0:32)
*Criterion: (a) Business Applicability*

---

**[0:00 – 0:15]**

VISUAL: Dark screen. The number **$60,000,000,000** types itself out, digit by digit. It resolves into **$60 BILLION**. Below it, a subtitle fades in: *"in U.S. government benefits goes unclaimed. Every year."*

VOICEOVER:
> "Sixty billion dollars in U.S. government benefits goes unclaimed every single year. SNAP. Medicaid. Housing vouchers. Cash assistance. School meals. Energy help. Eight major federal programs — scattered across dozens of agencies, buried in paperwork nobody can read."

---

**[0:15 – 0:32]**

VISUAL: The number **15,000,000** fades in, then resolves to **15 million families**. Below: *"are eligible but never apply."* Cut to a simple animation: a family silhouette next to a stack of forms with a red X. Then a chat bubble appears — a generic chatbot response: *"You may qualify for some programs. I'd recommend checking with your local office..."* A red stamp appears: **⚠ HALLUCINATED**.

VOICEOVER:
> "Fifteen million eligible Americans never apply — not because they don't qualify, but because no one tells them. You could ask a chatbot. But ask an AI 'Do I qualify for SNAP?' and it *guesses*. Confidently. Sometimes wrong. For a benefits decision, a confident wrong answer is worse than no answer at all."

---

### ACT 2: THE SOLUTION (0:32 – 0:55)
*Criteria: (c) Creativity, (e) Well-Architected*

---

**[0:32 – 0:55]**

VISUAL: Clean split screen. Left side: "Generic AI" with a brain icon — label: *"The model decides eligibility."* Right side: "BenefitsIQ" with a shield icon — label: *"A deterministic engine decides eligibility."* The left side fades to gray. The right side expands. An architecture diagram animates in:

```
User (plain English)
    ↓
Model Serving — Llama 3.3 70B
    (extracts structured profile)
    ↓
Deterministic Eligibility Engine
    (pure functions — no AI in the loop)
    ↓
Lakebase ← Unity Catalog Delta
    (federal rules, FPL thresholds, Census data)
    ↓
Statement of Benefits
    (programs · dollar values · citations)
```

A green banner flashes: **"Zero hallucinated eligibility. Same inputs → same result. Every time."**

VOICEOVER:
> "BenefitsIQ solves this with one architectural decision. The language model handles language — turning your words into a structured profile. But a **deterministic engine** — not the AI — decides what you qualify for. Real federal rules. Real income thresholds. The model never touches eligibility. So the answer is explainable, repeatable, and auditable. Zero hallucination by design."

---

### ACT 3: THE LIVE DEMO (0:55 – 1:50)
*Criteria: (d) Thoroughness, (a) Business Applicability*

---

**[0:55 – 1:15]**

VISUAL: The BenefitsIQ app loads. The warm landing page appears — the "$60B" callout card, the "15 million families" stat, five quick-start scenario chips. A cursor clicks: **"Lost my job in Georgia, 2 kids"**.

The chat interface responds. The assistant asks for income. The user types: **"No income right now."**

A loading animation plays (1-2 seconds). Then the **Statement of Benefits** card animates in — the total counts up from $0 to **$44,736/year**.

VOICEOVER:
> "Here's how it works in practice. A family types three words: 'Lost my job in Georgia, two kids.' BenefitsIQ asks only what it needs — their income. Then it runs the deterministic engine across all eight federal programs and produces a **Statement of Benefits** — a real dollar total: over **forty-four thousand dollars a year** this family has already earned."

---

**[1:15 – 1:35]**

VISUAL: Scroll slowly through the Statement. Each program appears with its dollar value and source citation:

- **Housing Voucher (Section 8)** — $12,000/yr — *Source: HUD · 2024*
- **Food Assistance (SNAP)** — $11,676/yr — *Source: USDA FNS · Oct 2024*
- **Children's Health (CHIP)** — $10,800/yr — *Source: CMS/KFF · 2024*
- **Cash Assistance (TANF)** — $5,760/yr — *Source: HHS ACF · FY2024*
- **School Meals (NSLP)** — $2,700/yr — *Source: USDA FNS · SY24-25*
- **Nutrition (WIC)** — $1,800/yr — *Source: USDA FNS · 2024*
- **Utility Relief (LIHEAP)** — varies — *Source: HHS OCS · FY2024*

Highlight the "How to apply →" links and the SNAP note: *"Use your current income — not your former salary. You may qualify for expedited processing."*

VOICEOVER:
> "Every program has a dollar estimate and an agency citation. Not generated text — deterministic math from published federal rules. SNAP, Section 8, TANF, CHIP, WIC, school meals, energy assistance. And for SNAP, it even flags that this family should use their *current* income — zero — not their former salary, and that they may qualify for expedited processing."

---

**[1:35 – 1:50]**

VISUAL: Scroll to the **"Families like you"** panel. Show the cohort data: *"Households like yours typically applied to SNAP first. Average processing: 7 days."* Then the **Census ACS panel**: *"In Georgia, about 13% of households receive SNAP."* Then the **"What if you lived in..."** dropdown — select Florida. A comparison line appears: *"In Florida, you'd qualify for 7 programs worth $46,236/yr (+$1,500)."*

VOICEOVER:
> "Below the Statement, a **'Families like you'** panel — drawn from privacy-safe, k-anonymous cohorts — shows what similar households typically applied for first and how long it took. Real Census data contextualizes: 'In Georgia, thirteen percent of households receive SNAP.' And a state comparison lets you see how eligibility changes across state lines — all from the same deterministic engine."

---

### ACT 4: THE PLATFORM (1:50 – 2:30)
*Criteria: (b) Data Relevance, (e) Well-Architected*

---

**[1:50 – 2:10]**

VISUAL: Navigate to the **Data & Sources** page. Show the Unity Catalog table list with live row counts: *programs (8 rows), eligibility_rules, fpl_thresholds, cohort_stats, acs_state_stats, apply_kb, apply_kb_emb, benefit_values.* Show the Databricks tools cards: Unity Catalog, Lakebase, Model Serving (LLM + Embeddings), Service Principal.

VOICEOVER:
> "BenefitsIQ is built end-to-end on Databricks — not a wrapper. Eight Unity Catalog Delta tables with Change Data Feed hold the federal rules, Census data, and a curated how-to-apply knowledge base with GTE-Large embeddings. All synced into Lakebase serverless Postgres for sub-second reads. Model Serving runs Llama 3.3 70B for language and GTE-Large for semantic search — with Vector Search as the primary retrieval tier."

---

**[2:10 – 2:30]**

VISUAL: Navigate to **How It Works**. Click the **"Try it yourself"** button. The custom profile form expands. Fill in a different profile: California, household of 4, $1,500/month, pregnant, has young children. Click "Check eligibility." The engine trace shows all 8 programs — some ruled IN with dollar values, some ruled OUT with specific reasons. The **FPL threshold** displays: *"$31,800/year ($2,650/month)."* Scroll to the **chatbot comparison card**: side-by-side of a generic chatbot (vague, no amounts, deflects) vs. BenefitsIQ (specific, dollar values, shows its work, rules OUT too).

VOICEOVER:
> "Judges, try it yourself. Any profile, any state. The engine traces every rule that fired — programs ruled IN *and* ruled OUT, each with a reason. A chatbot gives you a wall of vague text. BenefitsIQ gives you a number, a rule, and a citation. And adding a new program? It's just data — rows in Unity Catalog. No code changes. No rewrite. The engine is generic. Sixty-six unit tests prove it."

---

### ACT 5: THE CLOSE (2:30 – 2:55)
*Criteria: (a) Business Applicability, (c) Creativity*

---

**[2:30 – 2:45]**

VISUAL: Return to the Statement of Benefits. The $44,736 total pulses once. Below it, text overlays appear one at a time:

- ✓ **Deterministic eligibility** — zero hallucination
- ✓ **Every line cited** — auditable by design
- ✓ **Privacy-safe cohorts** — no individual data exposed
- ✓ **Scales to zero** — linear cost, no idle spend
- ✓ **Programs are data** — add one in 5 minutes, no code change

VOICEOVER:
> "Eligibility you can audit. Citations you can check. Privacy you can trust. Cost that scales linearly. And every new program is five minutes of data entry — not a code rewrite. BenefitsIQ turns sixty billion unclaimed dollars into benefits families can actually claim."

---

**[2:45 – 2:55]**

VISUAL: Clean end card on the warm paper background. The BenefitsIQ seal logo, centered. Below it:

```
BenefitsIQ
Built on Databricks. For good.

🔗 benefitsiq-app-7474659675348398.aws.databricksapps.com
📂 github.com/nookcreed/benefitsIQ
```

A final line fades in: *"Need help now? Call or text 211."*

VOICEOVER:
> "BenefitsIQ. Built on Databricks. For good."

*[Music swells gently, fades out.]*

---

## Judging Criteria Coverage Map

| Criterion | Where it's covered | Seconds |
|---|---|---|
| **(a) Business Applicability** | 0:00–0:32 ($60B problem + 15M gap), 0:55–1:50 (live demo with real output), 2:30–2:45 (close) | ~85s |
| **(b) Data Relevance** | 1:50–2:10 (Data & Sources page, 8 UC tables, live row counts, Census ACS, Vector Search) | ~20s |
| **(c) Creativity** | 0:15–0:32 (chatbot hallucination contrast), 0:32–0:55 (deterministic architecture), 2:10–2:30 (chatbot comparison card), 2:30–2:45 (programs-as-data) | ~50s |
| **(d) Thoroughness** | 0:55–1:50 (full Statement walkthrough, 8 programs, citations, cohorts, Census, state comparison) | ~55s |
| **(e) Well-Architected** | 0:32–0:55 (architecture diagram), 1:50–2:30 (UC→Lakebase→Model Serving, scale-to-zero, 66 tests, Try it yourself, programs-as-data) | ~50s |

**Every criterion has at least 20 seconds of dedicated screen time. The tiebreaker criteria — (a) Business Applicability — gets the most.**

---

## Exact Demo Inputs

### Primary flow (the Statement):
1. Open the app. Let the landing page load (shows $60B card + national stats).
2. Click the chip: **"Lost my job in Georgia, 2 kids"**
3. When asked for income, type: **"No income right now"**
4. Wait for Statement of Benefits to render (~2s).
5. Scroll through all programs slowly — linger on dollar amounts and citations.
6. Scroll to "Families like you" and Census ACS panels.
7. In "What if you lived in..." select **Florida** — show the comparison.

### Secondary flow (the engine trace):
1. Navigate to **How It Works**.
2. Click **"Try it yourself"**.
3. Enter: State=CA, Household=4, Income=$1,500, check "Is pregnant" and "Has young children".
4. Click **Check eligibility**.
5. Show the FPL display, ruled-in programs, ruled-out programs with reasons.
6. Scroll to the chatbot comparison card.

### Data & Sources (B-roll):
1. Navigate to **Data & sources**.
2. Show the 8 UC tables with live row counts.
3. Show the Databricks tools cards.

---

## If Running Long

The video MUST be under 3:00. If you need to cut time, remove in this order:

1. **Cut the state comparison** (1:45–1:50) — saves 5s
2. **Shorten the platform section** (1:50–2:10 → 1:50–2:00) — saves 10s
3. **Cut the "Try it yourself" segment** (2:10–2:30) — saves 20s. Move the "66 tests, programs as data" line to the close.

Do NOT cut: the $60B opening, the chatbot contrast, the live Statement demo, or the close. These are the moments judges remember.
