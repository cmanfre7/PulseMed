# CHANGELOG — Hip Preservation (hippreservation)

**This file lives in `clients/hippreservation/`.** It is the running history for this client so any AI or developer knows: **where we started**, **where we are**, and **where we’re going**. Do not put client changelogs in PulseMed root.

---

## Current focus

- **Client:** Hip Preservation — orthopedic hip resource for a Denver, CO practice.
- **Goal:** One-stop shop for hip preservation (procedures, recovery, testimonials, blogs). Physician-controlled knowledge only; no patient data; admin dashboard with document upload and custom AI instructions.
- **Stack:** Claude Sonnet 4.5, `@pulsemed/core` chat, config-driven behavior, Wix for practice website.
- **Frontend:** Chat widget with Chat / Library / Videos tabs; Library uses sidebar categories and direct PDF download; Videos use category filters and open natively (YouTube in new tab). No modals for Library or Videos.

---

## Next steps

1. **Admin dashboard** — Login and KB management; **document upload** as primary way to add content; **custom AI instructions** (editable system-prompt additions).
2. **Knowledge base** — If `knowledge-base/pdfs/*.md` were removed, run `node scripts/ingest-pdfs.js` in this folder to regenerate from PDFs and update `knowledge-base/index.json`.
3. **Videos tab** — Replace placeholder YouTube IDs in `public/index.html` with real video IDs from the practice’s channel so thumbnails and links work.
4. **Optional:** Wix file manager integration for assets; chatbot KB can still be fed from dashboard uploads or repo-based ingest.

---

## Recent changes

### 2025-02-03

- **Frontend rebuild (Chat / Library / Videos)**
  - **Library tab:** Five sidebar categories matching the practice website: Hip Dysplasia, Therapy and Rehab, Hip Arthroscopy, Periacetabular Osteotomy (PAO), Combined Hip Arthroscopy and PAO. Clicking a category shows branded purple/lavender PDF buttons with document titles; clicking a PDF downloads it directly (no modal). Styling matches Hip Preservation branding.
  - **Videos tab:** Category filter buttons (All, Hip Dysplasia, PAO Surgery, Hip Arthroscopy, Rehab & PT, Patient Stories, Meet the Surgeons). Two-column thumbnail grid with play icon overlay; clicking a video opens YouTube in a new tab (no modal). Category tags on each card. Placeholder YouTube IDs in data — replace with real IDs for thumbnails and links.
  - **Chat tab:** Hip background image (`public/hipbackground.svg`) fixed in place behind message area; scrollable message list; no horizontal scroll; purple/gold/lavender color scheme.
  - **Removed:** Modal overlay for Library PDFs and Videos; PDFs download directly; videos open natively.
- **Asset:** `public/hipbackground.svg` added for chat background.
- **Docs:** CHANGELOG.md, README.md, and AGENTS.md updated to reflect frontend structure and current status.

### 2025-02-02

- **Documentation moved into client folder**
  - All Hip Preservation–specific markdown moved from PulseMed root into `clients/hippreservation/`.
  - **AGENTS.md** — Now in this folder; full AI instructions and status for this client only.
  - **CHANGELOG.md** — Now in this folder; running history for this client only.
  - PulseMed root **AGENTS.md** and **README.md** restored to original platform/infrastructure content. Root **CHANGELOG.md** removed.
- **Rule:** PulseMed root is business infrastructure only; no client-specific docs in root.

### Earlier

- **Hip Preservation client** added: `config.json`, `server.js`, `knowledge-base/` with PDFs by topic, `scripts/ingest-pdfs.js`, `public/` chat widget (Chat / Library / Videos), triage in config.
- **Ingest script** updated to scan `knowledge-base/` (all PDF folders); ingest ran successfully (21 PDFs → markdown + index).
- **User deleted** all markdown in this project except `README.md` (including `knowledge-base/pdfs/*.md` and `prompts/system-prompt.md`). KB will load 0 documents until ingest is run again.
- **Docs overhaul (pre-move):** AGENTS.md and README.md had been rewritten at PulseMed root with hip preservation focus; user required all hippreservation-specific docs to live in this folder only.

---

## Where we started (summary)

- Hip Preservation added as PulseMed client: orthopedics, Denver CO, one-stop hip resource, no patient data, physician-controlled knowledge. Chat widget and ingest pipeline built; admin dashboard, document upload, and custom AI instructions still to be implemented.
- All client-specific documentation and changelog belong in `clients/hippreservation/`, not in PulseMed root.

---

## Where we’re going (summary)

- **This client:** Full admin dashboard with document upload (primary KB input) and editable custom AI instructions; optional Wix file manager for assets. Chat remains Claude Sonnet 4.5, RAG from ingested/uploaded documents, config-driven triage and branding. Library and Videos tabs are built out with proper containers and branding; next step is linking real video IDs and (when dashboard exists) dynamic KB/PDF lists.
- **Docs:** Keep README.md, AGENTS.md, and CHANGELOG.md in this folder and update them here when work is done.

---

*Update this file whenever you complete meaningful work on this client.*
