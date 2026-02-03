# PulseMed

**Physician-controlled AI for medical practices.**

PulseMed provides white-label chatbots that answer **only** from each practice’s curated knowledge. No general web, no hallucination. Content is controlled entirely by the physician.

---

## 📁 Project structure

```
PulseMed/
├── packages/core/           # Shared framework (@pulsemed/core)
│   ├── api/chat.js          # AI chat engine, RAG, Claude Sonnet 4.5
│   ├── server.js            # Express setup
│   └── config.js            # Config loading
│
├── clients/
│   ├── nayacare/            # 🚫 PRODUCTION — DO NOT MODIFY (separate repo)
│   └── hippreservation/     # 🦴 Hip Preservation Orthopedics (active development)
│       ├── config.json      # Branding, triage, AI instructions
│       ├── knowledge-base/  # PDFs → ingested to index + markdown for RAG
│       ├── public/          # Chat widget (Chat / Library / Videos)
│       ├── scripts/         # ingest-pdfs.js
│       └── server.js        # Express entry
│
├── web/                     # PulseMed marketing site (Next.js)
├── Markdowns/               # Business docs
├── AGENTS.md                # AI instructions, rules, current status
├── CHANGELOG.md             # Running history (where we started / are / going)
└── README.md                # This file
```

---

## 🏥 Clients

### NayaCare (Pediatrics) — `clients/nayacare/`
- **Do not modify.** Production; separate repo. HubSpot, HIPAA, pediatrics/neonates.
- Reference only for patterns (e.g. custom AI instructions, admin concepts).

### Hip Preservation (Orthopedics) — `clients/hippreservation/`
- **One-stop hip resource** for a Denver, CO orthopedic group: preservation, recovery, procedures, patient testimonials, blogs.
- **No patient data.** Educational only; not HIPAA-bound.
- **Physician-controlled knowledge:** AI uses only practice-approved content (documents + custom AI instructions).
- **Planned:** Admin dashboard with document upload and custom AI instruction editing.
- **Hosting:** Practice website on Wix (file manager for assets). Chatbot backend deployed separately (e.g. Railway).
- **AI:** Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`).

```bash
# From monorepo root
npm run dev:hip

# Or from client folder
cd clients/hippreservation
npm install
npm run start
```

---

## 🚀 Commands (from monorepo root)

```bash
npm install
npm run dev:hip          # Run Hip Preservation client
npm run dev:web          # Run marketing website
npm run build --workspace=@pulsemed/client-hippreservation
npm run start:hip        # Production start for hippreservation
```

### Hip Preservation: rebuild knowledge base

After adding or changing PDFs in `clients/hippreservation/knowledge-base/`:

```bash
cd clients/hippreservation
node scripts/ingest-pdfs.js
```

This updates `knowledge-base/index.json` and `knowledge-base/pdfs/*.md` for RAG. Restart the server to load new content.

---

## 🔑 Environment variables

**Hip Preservation (and any client using Claude):**

```bash
VENDOR_API_KEY=sk-ant-...   # or ANTHROPIC_API_KEY
PORT=3000                   # optional
NODE_ENV=production         # for production
```

No HubSpot or patient-data storage required for hippreservation.

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **README.md** | This file — structure, clients, commands |
| **AGENTS.md** | AI instructions, rules, current status, key files |
| **CHANGELOG.md** | Running history so any AI/human knows where we started and where we’re going |
| **DEVELOPER_GUIDE.md** | Deployment and dev details |
| **Markdowns/** | Business and technical framework docs |

---

## 🛠 Tech stack (platform)

- **Monorepo:** npm workspaces  
- **Core:** Node.js, Express, `@pulsemed/core` (chat API, RAG, triage)  
- **AI:** Anthropic Claude Sonnet 4.5  
- **Deploy:** Railway (Nixpacks), root at repo root  
- **Hip Preservation:** Optional Wix for site; no patient data; admin dashboard + document upload + custom AI instructions (in progress)

---

**PulseMed** — Colorado, USA
