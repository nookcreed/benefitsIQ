# BenefitsIQ

[![CI](https://github.com/nookcreed/benefitsIQ/actions/workflows/ci.yml/badge.svg)](https://github.com/nookcreed/benefitsIQ/actions/workflows/ci.yml)

**Find the government benefits your family has already earned — in plain language, with zero hallucinated eligibility.**

Every year, **over $60 billion in U.S. government benefits goes unclaimed** — SNAP, Medicaid, CHIP, WIC, LIHEAP, school meals. Not because families don't qualify, but because eligibility is fragmented across dozens of agencies, written in bureaucratic language, and nobody tells you what you've left on the table. A general chatbot can't fix this: ask ChatGPT "do I qualify for SNAP?" and it will *guess* — confidently, and sometimes wrong. For a benefits decision, a confident wrong answer is worse than no answer.

**BenefitsIQ is a benefits navigator built on Databricks that separates language from law.** A conversational agent gathers your situation in plain English; a **deterministic eligibility engine** — not the LLM — decides what you qualify for from real federal rules. The result is a shareable **Statement of Benefits** with a dollar value and a citation for every program, plus a privacy-safe **"families like you"** view of what similar households typically apply for and how long it takes.

🔗 **Live demo:** https://benefitsiq-app-7474659675348398.aws.databricksapps.com
🎥 **Demo video:** _(3-min walkthrough — see `/docs`)_

---

## Why this isn't just a chatbot wrapper

> **The LLM does language. The engine does eligibility. The model never decides whether you qualify.**

This is the core design decision and the reason BenefitsIQ can be trusted with a benefits answer:

| | Generic LLM assistant | **BenefitsIQ** |
|---|---|---|
| Decides eligibility | The model guesses from training data | A **deterministic, auditable engine** over real federal rules (FPL thresholds, gross/net income tests, categorical eligibility) |
| Wrong-answer risk | Hallucinated programs & amounts | Eligibility is a pure function — same inputs always give the same, explainable result |
| Evidence | None | Every program carries a **dollar estimate + agency citation** |
| Personalization | Generic advice | Privacy-safe **k-anonymous cohorts** ("families like you," floor of 30) |
| Output | A wall of text | A structured, shareable **Statement of Benefits** |

The LLM's *only* jobs are (1) turning messy conversation into a structured profile and (2) writing warm, human replies. Swap the model out and the eligibility results don't change — that's the point.

---

## How it works

```
  You (plain English)
        │
        ▼
  ┌──────────────────┐     extracts a structured profile + writes the reply
  │  Model Serving    │  ── Llama 3.3 70B Instruct (Databricks Foundation Model API)
  │  (language only)  │
  └────────┬─────────┘
           │ profile {state, household size, income, situation…}
           ▼
  ┌──────────────────┐     pure, deterministic, auditable
  │ Eligibility Engine│  ── federal rules: FPL, income tests, categorical eligibility
  └────────┬─────────┘
           │ reads rules + cohorts (sub-second)
           ▼
  ┌──────────────────┐     UC Delta tables synced → Lakebase Postgres (read on-behalf-of-user)
  │  Lakebase (OLTP)  │  ── programs · eligibility_rules · fpl_thresholds · cohort_stats
  └────────┬─────────┘
           ▼
  Statement of Benefits  +  "Families like you"
  (programs, $ value, citations)   (k-anonymous, n≥30)
```

---

## Databricks datasets & tools used

BenefitsIQ is built end-to-end on the Databricks platform — not a generic app that happens to call one API:

| Layer | Databricks capability |
|---|---|
| **App runtime** | **Databricks Apps** (AppKit / TypeScript + React) |
| **Language model** | **Model Serving** — `databricks-meta-llama-3-3-70b-instruct` Foundation Model (chat + profile extraction) |
| **Embeddings / RAG** | **Model Serving** — `databricks-gte-large-en` (1024-dim) for semantic retrieval over the how-to-apply knowledge base |
| **Source of truth** | **Unity Catalog** Delta tables (Change Data Feed enabled): `programs`, `eligibility_rules`, `fpl_thresholds`, `cohort_stats`, `benefit_values`, `apply_kb` (+ embeddings), `acs_state_stats` |
| **Serving layer** | **Lakebase** synced tables (UC Delta → serverless Postgres) for sub-second eligibility + retrieval lookups |
| **Operational store** | **Lakebase** Postgres (`app.impact_events`) for live impact metrics |
| **Governance** | Reads run as the app **service principal** with least-privilege `SELECT` on the synced schema — so end users need zero per-user OAuth consent |

**Datasets:**
- Curated U.S. federal program rules (USDA FNS, CMS, HHS) with source citations and effective dates.
- Benefit dollar values (SNAP/WIC/CHIP/NSLP) as data, not code (`benefit_values`).
- Curated, cited how-to-apply knowledge base (`apply_kb`) + its GTE-Large embeddings, powering the RAG "How to apply" feature.
- **U.S. Census ACS** poverty / SNAP-participation data (enriching the "families like you" cohorts). _(See `scripts/` and `/docs/data.md`.)_

---

## Distribution strategy — how families actually find it

Building the tool is half the problem; reaching families is the other half. BenefitsIQ is designed to plug into the channels stressed families already touch — not to wait for them to find a website:

- **211 / United Way** — 211 fields tens of millions of contacts a year for benefit navigation. BenefitsIQ can be the screener their navigators run, or a warm-handoff link. (The app already surfaces **211** for urgent help.)
- **Community health centers (FQHCs) & hospital social workers** — embed the link in intake/discharge workflows so a social worker runs a 60-second check instead of a 45-minute manual screen.
- **Schools & WIC clinics** — NSLP and WIC are natural touchpoints; a QR code on enrollment/appointment forms.
- **SNAP/Medicaid offices, libraries, food banks** — kiosk or QR at the places people already go when seeking help.
- **The shareable Statement** — the Statement of Benefits is built to be shown or printed and taken to an agency, so every user becomes a distribution point.
- **Caseworker mode (roadmap)** — one navigator screens many families; the deterministic engine + per-line citations make assisted screening defensible.

**Trust is the adoption lever.** Because eligibility is deterministic and every line is cited, partner organizations can put their name behind it — something they cannot do with a chatbot that might hallucinate a benefit.

---

## Well-architected: scales at linear cost, extends without rewrites

- **Linear cost / scale-to-zero.** Lakebase is serverless Postgres that autoscales (0.5–32 CU) and **scales to zero** when idle — you pay for traffic, not for an always-on cluster. Model Serving is pay-per-token. There is no fixed-cost tier to outgrow.
- **Read path is sub-second and cheap.** Eligibility reads hit Lakebase synced tables (Postgres), not a SQL warehouse — fast lookups without warehouse spin-up cost.
- **Add features without a rewrite.** The app is composed of **AppKit plugins** (`lakebase`, `serving`, `server`). Adding Vector Search, Genie, or a Jobs trigger is a new plugin + route, not a refactor. New programs/states/values are **data** (rows in UC), not code.
- **Eligibility logic is a pure module** (`server/engine/`) with no I/O — independently testable and portable. See the **unit tests** in [`server/engine/eligibility.test.ts`](./server/engine/eligibility.test.ts) (`npm test`), which prove the deterministic guarantees: same inputs → same result, programs ruled in *and out* with reasons, income-sensitive benefit math, and data-driven values.

### Scalability & cost

Cost scales with **usage**, not with an always-on footprint. Rough per-1,000-families estimate (Databricks list-price assumptions — verify current rates for your tier):

| Component | Driver | ~Cost / 1,000 families |
|---|---|---|
| Model Serving — Llama 3.3 70B (pay-per-token) | ~5 chat turns + 1 RAG answer ≈ 8–12K tokens/family | ~$10–20 |
| Model Serving — GTE-Large embeddings | 1 query embedding/family (KB embedded once, not per-user) | < $1 |
| Lakebase (serverless Postgres, **0.5–32 CU autoscale**, scale-to-zero) | millisecond reads; idle → **0 CU** | ~$1–5 (amortized CU-hours) |
| Databricks App runtime | small fixed compute | negligible per-family |
| **Total** | | **≈ $12–25 per 1,000 families (~1–3¢/family)** |

- **Scale-to-zero:** between sessions Lakebase drops to **0 CU** — no idle spend. Traffic bursts autoscale up to 32 CU and back down automatically.
- **Reads are cheap:** eligibility + retrieval hit Lakebase Postgres (ms), not a SQL warehouse — no per-query warehouse spin-up cost.
- **Linear, not stepped:** there is no fixed cluster to outgrow; doubling families ~doubles token + CU spend, nothing else.
- **Rule-refresh cadence:** federal numbers change on a known schedule — **FPL** annually (January), **SNAP** allotments annually (October COLA), state **Medicaid/CHIP** limits ~annually. Refresh = re-run the UC load + re-sync (a scheduled Lakeflow job); **zero app downtime, zero code change** because rules and dollar values are data. _(Re-syncing recreates the synced tables, so re-apply the SP `SELECT` grant after a refresh — see `docs/data.md`.)_
- **Headroom:** 32 CU Lakebase + pay-per-token serving comfortably handles low-millions of checks/year; the next tier (managed Vector Search for the KB, Genie for data exploration) is **additive**, not a rewrite.

> Cost figures are estimates to illustrate the linear model; actual spend depends on your Databricks pricing tier and current Foundation Model rates.

---

## Project structure

```
server/
  engine/          # Pure eligibility logic (no I/O): eligibility.ts, cohort.ts, types.ts
  routes/
    chat.ts        # Conversational turn: LLM extract profile + reply → then run engine
    benefits.ts    # Eligibility check over Lakebase synced tables + impact logging
  server.ts        # createApp({ plugins: [lakebase(), serving(), server()] })
client/src/        # React UI: chat + animated Statement of Benefits + "families like you"
scripts/           # UC Delta load + UC→Lakebase synced-table creation (data pipeline)
docs/              # Architecture, data sources, demo script
databricks.yml     # Asset Bundle (app + Lakebase resource + OBO scopes)
app.yaml           # Runtime config (serving endpoint, Lakebase binding)
```

---

## Run it yourself

### Prerequisites
- Node.js 22+, Databricks CLI (`databricks aitools install` for the helper skills), access to a Databricks workspace with Lakebase + Model Serving enabled.

### 1. Configure
Edit `databricks.yml` and set your workspace + Lakebase resource names:
```yaml
targets:
  default:
    workspace:
      host: https://<your-workspace>.cloud.databricks.com   # your workspace
    variables:
      postgres_project: projects/<your-lakebase-project>
      postgres_branch:  projects/<your-lakebase-project>/branches/production
      postgres_database: projects/<your-lakebase-project>/branches/production/databases/databricks-postgres
```

### 2. Provision data (one time)
```bash
# Load federal rules + cohorts into Unity Catalog Delta, then sync to Lakebase Postgres
python scripts/uc_load.py            # creates UC Delta tables (CDF on)
python scripts/uc_sync.py            # creates UC→Lakebase synced tables (run sequentially)
```

### 3. Deploy
```bash
npm install
databricks bundle deploy            # creates the app + Lakebase resource
databricks apps deploy benefitsiq-app
```

### Local development
```bash
cp .env.example .env                # set DATABRICKS_HOST
npm run dev                         # hot-reload at the printed URL
```

### Quality gates
```bash
npm run typecheck && npm run lint   # tsc + appkit lint (strict)
npm run build                       # server + client bundles
```

---

## Tech stack
**Databricks:** Apps (AppKit), Lakebase (serverless Postgres + synced tables), Model Serving (Llama 3.3 70B), Unity Catalog.
**App:** TypeScript, React, Vite, Express, Tailwind, shadcn/ui.

## License
MIT — see [LICENSE](./LICENSE).

---

*Built for the Databricks "AI for Good" Hackathon. BenefitsIQ provides eligibility estimates for informational purposes; final determinations are made by the administering agencies.*
