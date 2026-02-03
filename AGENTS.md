# AGENTS.md — PulseMed

## 🚨 CRITICAL: READ BEFORE ANY WORK

**MANDATORY READING ORDER:**
1. **README.md** — Monorepo structure, setup, deployment
2. **AGENTS.md** — This file: AI instructions, coding standards, current priorities
3. **CHANGELOG.md** — Running history: where we started, where we are, where we’re going

**Before making ANY changes or suggestions, you MUST:**
- ✅ Read `README.md` (project structure, clients, commands)
- ✅ Read this `AGENTS.md` (especially "Current Status" and "Critical Rules")
- ✅ Read `CHANGELOG.md` for recent work and next steps
- ✅ Use TodoWrite to track multi-step work when appropriate

---

## 📋 PROJECT OVERVIEW

**PulseMed** is a white-label healthcare AI platform. Physicians get chatbots that answer **only** from their own curated knowledge—no general web, no hallucination. Each client is a separate practice with its own config, knowledge base, and optional admin dashboard.

**Active development client:** **Hip Preservation (hippreservation)** — an orthopedic resource for a group of hip preservation surgeons in the Denver, CO area.

### Hip Preservation Client (hippreservation)

- **Purpose:** One-stop shop for hip preservation: procedures, recovery, patient testimonials, blogs, and physician-approved resources.
- **Audience:** Patients and referrers seeking information on hip preservation surgery (PAO, hip arthroscopy, combined procedures, dysplasia, etc.).
- **No patient data:** This chatbot does **not** collect or store PHI. It is **not** HIPAA-bound. It is educational only.
- **Same core principle as other PulseMed clients:** The AI pools **only** from a small, physician-controlled knowledge base. Content is controlled entirely by the practice.
- **AI:** Claude Sonnet 4.5 via Anthropic API (`claude-sonnet-4-5-20250929`).
- **Hosting:** Website on **Wix**; Wix file manager can be used for media/assets. Chatbot backend is deployed separately (e.g. Railway).

### Features to Deliver for Hip Preservation

1. **Admin dashboard** — Full control over what the AI knows and how it behaves.
2. **Knowledge base via document upload** — Primary way physicians add content: upload PDFs (and optionally other docs); text is extracted and indexed for RAG.
3. **Custom AI instructions** — Same idea as NayaCare: editable system-prompt additions and specialty instructions (e.g. recovery timelines, triage wording, tone) so the practice can tune responses without code changes.
4. **Chat UI** — Clean, on-brand chat (e.g. widget or embed) that calls the PulseMed core chat API and displays answers with optional source citations.

---

## 📝 DOCUMENTATION MAINTENANCE RULES

### 1. KEEP THREE FILES IN SYNC

When completing meaningful work:

**A. CHANGELOG.md**
- Add a dated entry under "Recent changes" with what was done.
- Keep "Current focus" and "Next steps" updated so any AI knows where we are and where we’re going.

**B. README.md**
- Update client list, status, and commands if you add a client or change run/deploy steps.
- Keep environment variables and deployment notes accurate.

**C. AGENTS.md**
- Update "Current Status" and "Next Priorities" when milestones or focus change.
- Keep this file focused on AI instructions and platform rules, not full project history (that’s CHANGELOG).

### 2. STATUS INDICATORS

Use consistently:
- ✅ = Done / Working
- 🔄 = In progress
- 🟡 = Partially done
- 🔴 = Blocked / critical issue
- 📚 = Documentation update

### 3. PRIMARY DOCUMENTATION HIERARCHY

- **README.md** — Single source of truth for repo layout, clients, setup, and deploy.
- **AGENTS.md** — AI-specific rules, current status, and what to touch/avoid.
- **CHANGELOG.md** — Narrative of where we started, where we are, and where we’re going (for humans and AIs).

---

## 🚨 CURRENT STATUS — Hip Preservation Build-Out

**Target:** Hip preservation orthopedic resource (Denver, CO). No patient data; physician-controlled knowledge only; admin dashboard + document upload + custom AI instructions.

**✅ In place (hippreservation):**
- Client folder `clients/hippreservation/` with `config.json`, `server.js`, `public/` (chat widget UI).
- Core chat: `@pulsemed/core` chat handler; RAG from `knowledge-base/` (index + markdown derived from PDFs).
- PDF ingest script: `scripts/ingest-pdfs.js` — scans `knowledge-base/` PDFs, extracts text, writes `knowledge-base/pdfs/*.md` and updates `knowledge-base/index.json`.
- Triage: emergency/urgent keywords and escalation message in `config.json`.
- Chat UI: floating widget with Chat / Library / Videos tabs; Library lists PDFs and opens modal viewer.
- Public PDFs served from `public/pdfs/` for download/view.

**🔄 To build:**
- Admin dashboard: login, KB management, **document upload** (primary way to add to AI knowledge), and **custom AI instructions** (editable system-prompt additions).
- Optional: Wix file manager integration for assets (e.g. images/PDFs) if practice prefers managing files there; chatbot KB can still be fed from uploads to the dashboard or from ingested files in repo.
- Rebuild KB after you deleted markdown: run `node scripts/ingest-pdfs.js` from `clients/hippreservation` to regenerate `knowledge-base/pdfs/*.md` and `index.json` if needed.

**🔴 Critical rules**
- **Do not modify `clients/nayacare/`** — Production; separate repo and stack (HubSpot, pediatrics, HIPAA). Reference only.
- **Client isolation:** All hip-preservation-specific work stays under `clients/hippreservation/` (config, knowledge-base, overrides, admin UI).
- **Core changes:** `packages/core/` is shared; discuss before changing.

---

## 🛠 TECH STACK (Platform)

- **Monorepo:** npm workspaces.
- **Core:** Node.js + Express; `packages/core/api/chat.js` — RAG + Claude Sonnet 4.5.
- **AI:** Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`).
- **Clients:** Per-client Express app (e.g. `clients/hippreservation/server.js`), optional React/Vite in `src/`, static or server-rendered UI.
- **Deploy:** Railway (Nixpacks), root at monorepo; build/start for the target client (e.g. hippreservation).
- **Hip Preservation:** No HIPAA; no patient data storage. Wix for marketing site; file manager for assets as needed.

---

## 📁 KEY FILES (Hip Preservation)

| Path | Purpose |
|------|---------|
| `clients/hippreservation/config.json` | Branding, triage keywords, AI model, system-prompt additions, features |
| `clients/hippreservation/server.js` | Express app: health, content, chat; loads KB from `knowledge-base/index.json` + `knowledge-base/pdfs/*.md` |
| `clients/hippreservation/knowledge-base/` | Source PDFs by topic; after ingest: `index.json` + `pdfs/*.md` |
| `clients/hippreservation/scripts/ingest-pdfs.js` | Extract text from PDFs → markdown + index for RAG |
| `clients/hippreservation/public/index.html` | Chat widget (Chat / Library / Videos) |
| `packages/core/api/chat.js` | Shared chat handler: system prompt builder, RAG context, Claude call, triage |

Custom AI instructions for hip preservation live in `config.json` under `ai.systemPromptAdditions`. Optional: load from a file (e.g. `prompts/system-prompt.md`) and merge into system prompt in the client server if you add that.

---

## 🔧 DEVELOPMENT STANDARDS

- **Config-driven:** Prefer `config.json` and env over code changes for client-specific behavior.
- **Client isolation:** No hippreservation logic in core; no core logic in hippreservation except using `@pulsemed/core` and shared patterns.
- **Docs:** After meaningful changes, update CHANGELOG.md and, if needed, README.md and AGENTS.md.
- **AI instructions:** Editable via admin (custom AI instructions) and/or config/system prompt file so physicians can tune tone and content without code deploys.

---

## 🔐 ENVIRONMENT & DEPLOYMENT (Hip Preservation)

- **No patient data / no HIPAA** for this client.
- **Env:** `VENDOR_API_KEY` or `ANTHROPIC_API_KEY` for Claude; `PORT`; `NODE_ENV=production` in prod.
- **Railway:** Root `.`; build e.g. `npm install && npm run build --workspace=@pulsemed/client-hippreservation`; start `node clients/hippreservation/server.js`.

---

## 🎯 WORKING WITH AI (You)

1. **Always read README.md and CHANGELOG.md** for context and recent direction.
2. **Respect client isolation and “do not modify nayacare.”**
3. **Use CHANGELOG.md** to record what was done and what’s next so the next AI (or human) knows where we started and where we’re going.
4. **Admin dashboard:** Implement document upload and custom AI instructions so the practice has full control over knowledge and behavior.

---

*Last Updated: February 2025*
