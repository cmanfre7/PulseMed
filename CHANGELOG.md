# CHANGELOG — PulseMed

This file is the **running history** of the PulseMed monorepo and active client work. Any AI or developer reading it should understand: **where we started**, **where we are**, and **where we’re going**.

---

## Current focus

- **Client:** Hip Preservation (`clients/hippreservation/`) — orthopedic hip resource for a Denver, CO practice.
- **Goal:** One-stop shop for hip preservation (procedures, recovery, testimonials, blogs). Physician-controlled knowledge only; no patient data; admin dashboard with document upload and custom AI instructions.
- **Stack:** Claude Sonnet 4.5, `@pulsemed/core` chat, config-driven behavior, Wix for practice website.

---

## Next steps

1. **Admin dashboard** — Implement login and KB management; **document upload** as primary way to add content to the AI; **custom AI instructions** (editable system-prompt additions) so physicians can tune responses without code.
2. **Knowledge base** — If `knowledge-base/pdfs/*.md` were removed, run `node scripts/ingest-pdfs.js` in `clients/hippreservation` to regenerate from PDFs and update `knowledge-base/index.json`.
3. **Optional:** Wix file manager integration for assets (e.g. images/PDFs) if the practice prefers managing files there; chatbot KB can still be fed from dashboard uploads or repo-based ingest.

---

## Recent changes

### 2025-02-02

- **Documentation overhaul**
  - **AGENTS.md** rewritten for PulseMed and Hip Preservation: removed all NayaCare-specific content (pediatrics, neonates, HubSpot, HIPAA, Linear, embed mode, growth charts, etc.). Now describes platform rules, hip preservation client (Denver ortho, one-stop hip resource, no patient data, physician-controlled KB, admin dashboard, document upload, custom AI instructions, Claude Sonnet 4.5, Wix).
  - **README.md** updated: correct repo structure (`clients/hippreservation/`), Hip Preservation as active client, Wix, no HIPAA for this client, commands and env vars.
  - **CHANGELOG.md** created: running history so any AI/human can see where we started, where we are, and where we’re going.
- **Context:** User requested stripping NayaCare-unique content from the NayaCare-style AI instructions doc and aligning docs with a different clinic (orthopedic hip preservation, Denver, no patient data, admin dashboard, document upload, custom AI instructions, Claude Sonnet 4.5, Wix).

### Earlier (hippreservation)

- **Hip Preservation client** added under `clients/hippreservation/`: `config.json`, `server.js`, `knowledge-base/` with PDFs by topic, `scripts/ingest-pdfs.js` (PDF → markdown + index for RAG), `public/` chat widget (Chat / Library / Videos), triage keywords and escalation in config.
- **Ingest script** updated to scan `knowledge-base/` (all PDF folders) instead of legacy `patient resources` path; ingest ran successfully (21 PDFs → markdown + index).
- **User later deleted** all markdown in the hippreservation project except `README.md` (including `knowledge-base/pdfs/*.md` and `prompts/system-prompt.md`). KB will load 0 documents until ingest is run again or the server is pointed at another source.

### Platform baseline

- **PulseMed** monorepo: `packages/core/` (chat API, RAG, triage), multiple clients in `clients/`. NayaCare is production in a separate repo; do not modify `clients/nayacare/`. Hip Preservation is the active development client.
- **Core chat:** `@pulsemed/core` — system prompt from config, optional RAG from client-supplied `loadKnowledgeBase`, emergency keyword triage, Claude Sonnet 4.5.
- **Deployment:** Railway, Nixpacks, root at repo; per-client build/start (e.g. hippreservation).

---

## Where we started (summary)

- PulseMed as white-label physician-controlled AI platform.
- NayaCare as first production client (pediatrics, HIPAA, HubSpot) — reference only; not modified from this repo.
- Hip Preservation client added as second client: orthopedics, Denver CO, hip preservation one-stop resource, no patient data, same core idea (AI only from physician-controlled knowledge). Chat widget and ingest pipeline built; admin dashboard, document upload, and custom AI instructions still to be implemented.

---

## Where we’re going (summary)

- **Hip Preservation:** Full admin dashboard with document upload (primary KB input) and editable custom AI instructions; optional Wix file manager use for assets. Chat remains Claude Sonnet 4.5, RAG from ingested/uploaded documents, config-driven triage and branding.
- **Platform:** Keep core shared; all client-specific logic in `clients/<name>/`. Add new clients by copying template (e.g. hippreservation), updating config and KB.

---

*Update this file whenever you complete meaningful work or change direction so the next reader (human or AI) stays oriented.*
