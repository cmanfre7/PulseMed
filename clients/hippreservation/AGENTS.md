# AGENTS.md — Hip Preservation (hippreservation)

**This file lives in `clients/hippreservation/`. All Hip Preservation–specific AI instructions and status belong here, not in PulseMed root.**

---

## 🚨 CRITICAL: READ BEFORE ANY WORK ON THIS CLIENT

**MANDATORY READING ORDER (all in this folder):**
1. **README.md** — Project structure, setup, commands for this client
2. **AGENTS.md** — This file: AI instructions, current status, key files
3. **CHANGELOG.md** — Running history: where we started, where we are, where we’re going

**Before making ANY changes to hippreservation, you MUST:**
- ✅ Read this folder’s `README.md` and `CHANGELOG.md`
- ✅ Read this `AGENTS.md` (especially "Current Status" and "Critical Rules")
- ✅ Use TodoWrite for multi-step work when appropriate
- ✅ **Never** put Hip Preservation–specific docs or changelogs in PulseMed root; they stay in `clients/hippreservation/`.

---

## 📋 PROJECT OVERVIEW (Hip Preservation)

This client is an **orthopedic resource** for a group of hip preservation surgeons in the **Denver, CO** area. It serves as a **one-stop shop** for hip preservation: procedures, recovery, patient testimonials, blogs, and physician-approved resources.

- **Audience:** Patients and referrers seeking information on hip preservation surgery (PAO, hip arthroscopy, combined procedures, dysplasia, etc.).
- **No patient data:** This chatbot does **not** collect or store PHI. It is **not** HIPAA-bound. Educational only.
- **Core principle:** The AI pools **only** from a small, physician-controlled knowledge base. Content is controlled entirely by the practice.
- **AI:** Claude Sonnet 4.5 via Anthropic API (`claude-sonnet-4-5-20250929`).
- **Hosting:** Practice website on **Wix**; Wix file manager for media/assets. Chatbot backend deployed separately (e.g. Railway).

### Features to Deliver

1. **Admin dashboard** — Full control over what the AI knows and how it behaves.
2. **Knowledge base via document upload** — Primary way physicians add content: upload PDFs; text extracted and indexed for RAG.
3. **Custom AI instructions** — Editable system-prompt additions (recovery timelines, triage wording, tone) so the practice can tune responses without code.
4. **Chat UI** — On-brand chat widget that calls PulseMed core chat API; optional source citations.

---

## 📝 DOCUMENTATION MAINTENANCE (this client only)

When completing meaningful work **in this client folder**:

**A. CHANGELOG.md** (in this folder)
- Add a dated entry under "Recent changes."
- Keep "Current focus" and "Next steps" updated.

**B. README.md** (in this folder)
- Update structure, commands, env if you change how the client runs or deploys.

**C. AGENTS.md** (this file)
- Update "Current Status" and "Next Priorities" when milestones or focus change.

**Status indicators:** ✅ Done | 🔄 In progress | 🟡 Partial | 🔴 Blocked | 📚 Docs

---

## 🚨 CURRENT STATUS — Hip Preservation Build-Out

**Target:** Hip preservation orthopedic resource (Denver, CO). No patient data; physician-controlled knowledge only; admin dashboard + document upload + custom AI instructions.

**✅ In place:**
- `config.json`, `server.js`, `public/` (chat widget: Chat / Library / Videos).
- **Chat tab:** AI conversation; fixed hip background image (`public/hipbackground.svg`); scrollable message area; purple/gold/lavender branding.
- **Library tab:** Five sidebar categories (Hip Dysplasia, Therapy and Rehab, Hip Arthroscopy, PAO, Combined Hip Arthroscopy and PAO). Branded PDF buttons with titles; click to download directly (no modal). PDFs served from `public/pdfs/`.
- **Videos tab:** Category filter buttons (All, Hip Dysplasia, PAO Surgery, Hip Arthroscopy, Rehab & PT, Patient Stories, Meet the Surgeons). Two-column thumbnail grid; click opens YouTube in new tab (no modal). Placeholder YouTube IDs in `public/index.html` — replace with real video IDs for thumbnails and links.
- Core chat: `@pulsemed/core`; RAG from `knowledge-base/` (index + markdown derived from PDFs).
- `scripts/ingest-pdfs.js` — scans `knowledge-base/` PDFs, writes `knowledge-base/pdfs/*.md` and `knowledge-base/index.json`.
- Triage: emergency/urgent keywords and escalation in `config.json`.

**🔄 To build:**
- Admin dashboard: login, KB management, **document upload** (primary KB input), **custom AI instructions** (editable system-prompt additions).
- **Videos:** Replace placeholder YouTube IDs in `public/index.html` with real video IDs from the practice’s channel.
- Optional: Wix file manager integration for assets; chatbot KB can still be fed from dashboard uploads or repo-based ingest.
- If `knowledge-base/pdfs/*.md` were removed: run `node scripts/ingest-pdfs.js` from this folder to regenerate.

**🔴 Critical rules**
- **Do not modify PulseMed root** — Root is business infrastructure only. No client-specific markdown in root.
- **Do not modify `clients/nayacare/`** — Production; separate repo. Reference only.
- **Client isolation:** All hippreservation work stays in `clients/hippreservation/`. Core changes (`packages/core/`) need discussion.

---

## 🛠 TECH STACK (this client)

- **Runtime:** Node.js + Express (`server.js`), static/served UI in `public/`.
- **AI:** `@pulsemed/core` chat handler; Claude Sonnet 4.5.
- **KB:** PDFs in `knowledge-base/` → ingest → `knowledge-base/pdfs/*.md` + `knowledge-base/index.json`.
- **Deploy:** Railway (from monorepo root); build/start for this client. Wix for practice site.

---

## 📁 KEY FILES (paths relative to this folder)

| Path | Purpose |
|------|---------|
| `config.json` | Branding, triage, AI model, `ai.systemPromptAdditions` |
| `server.js` | Express app: health, content, chat; loads KB from `knowledge-base/`; serves `public/` (or `dist/`) |
| `knowledge-base/` | Source PDFs by topic; after ingest: `index.json` + `pdfs/*.md` |
| `scripts/ingest-pdfs.js` | PDF → markdown + index for RAG; scans `knowledge-base/` (all subfolders) |
| `public/index.html` | Chat widget: Chat (AI + hip bg), Library (sidebar + PDF download buttons), Videos (category filters + thumbnail grid → YouTube in new tab). Data for Library/Videos in script section. |
| `public/hipbackground.svg` | Background image in chat message area |
| `public/pdfs/` | PDFs served for Library tab download links |
| `packages/core/api/chat.js` (monorepo) | Shared chat handler; do not change without discussion |

Custom AI instructions live in `config.json` under `ai.systemPromptAdditions`. Optional: load from `prompts/system-prompt.md` and merge in server if added.

---

## 🔧 DEVELOPMENT STANDARDS

- **Config-driven:** Prefer `config.json` and env for client behavior.
- **Client isolation:** No hippreservation logic in core; no core logic here except using `@pulsemed/core`.
- **Docs:** After meaningful changes, update this folder’s CHANGELOG.md and, if needed, README.md and this AGENTS.md.
- **AI instructions:** Editable via admin (future) and/or config so physicians can tune without code deploys.

---

## 🔐 ENVIRONMENT & DEPLOYMENT

- **No patient data / no HIPAA** for this client.
- **Env:** `VENDOR_API_KEY` or `ANTHROPIC_API_KEY`; `PORT`; `NODE_ENV=production` in prod.
- **Railway:** Monorepo root; build/start for `@pulsemed/client-hippreservation`.

---

## 🎯 WORKING WITH AI

1. **Always read this folder’s README.md and CHANGELOG.md** for context and direction.
2. **Never add Hip Preservation–specific docs or changelogs to PulseMed root.**
3. **Use CHANGELOG.md** (here) to record what was done and what’s next.
4. **Admin dashboard:** Implement document upload and custom AI instructions so the practice has full control.

---

*Last Updated: February 2025 — Frontend rebuild (Library sidebar, Videos category grid, no modals) reflected in CHANGELOG.md and README.md.*
