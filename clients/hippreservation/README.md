# Hip Preservation - AI Surgery Recovery Assistant

## 🦴 Project Overview

HipGuide is an AI-powered assistant for patients of Hip Preservation Orthopedic Surgery. It helps patients navigate their recovery journey from hip preservation procedures including:

- **PAO (Periacetabular Osteotomy)** - Complex hip dysplasia correction
- **Hip Arthroscopy** - Minimally invasive hip joint surgery
- **Combined Procedures** - Arthroscopy + PAO

## 🚀 Quick Start

```bash
# From PulseMed monorepo root
npm install
npm run start:hip
```

Or from this directory:

```bash
npm install
npm run start
```

The app runs at **http://localhost:3000**. The chat widget is served from `public/index.html` (static HTML/CSS/JS; no Vite build required for the widget).

## 📚 Documentation (in this folder)

All Hip Preservation–specific docs live **here**, not in PulseMed root:

| File | Purpose |
|------|---------|
| **README.md** | This file — structure, setup, commands |
| **AGENTS.md** | AI instructions, current status, key files — **read before making changes** |
| **CHANGELOG.md** | Running history: where we started, where we are, where we’re going |

## 📁 Project Structure

```
hippreservation/
├── config.json           # 🔧 CLIENT CONFIGURATION - Your main customization file
├── knowledge-base/       # 📚 PDF documents for the AI to reference (index.json + pdfs/*.md after ingest)
├── prompts/              # 💬 Custom system prompts (optional)
├── overrides/            # 🔄 Client-specific code overrides
├── public/               # 🎨 Chat widget and static assets
│   ├── index.html        # Chat widget: Chat / Library / Videos tabs (single-page)
│   ├── hipbackground.svg # Background image in chat message area
│   └── pdfs/             # PDFs served for Library tab download links
├── scripts/              # ingest-pdfs.js — PDF → markdown + index for RAG
├── AGENTS.md             # AI instructions and status (this client only)
├── CHANGELOG.md          # Running history (this client only)
├── server.js             # 🖥️ Express server entry point
└── package.json          # Dependencies
```

### Chat Widget Tabs

- **Chat** — AI conversation with hip background image; RAG from knowledge base.
- **Library** — Sidebar with 5 categories (Hip Dysplasia, Therapy and Rehab, Hip Arthroscopy, PAO, Combined Hip Arthroscopy and PAO). PDF titles shown as branded buttons; click to download. No modal.
- **Videos** — Category filters (Hip Dysplasia, PAO Surgery, Hip Arthroscopy, Rehab & PT, Patient Stories, Meet the Surgeons). Thumbnail grid; click opens YouTube in a new tab. No modal.

## 🎯 What You Need to Do

### 1. Configure the Client (`config.json`)

The `config.json` file is your main customization point. Key sections:

- **branding**: Colors, chatbot name, welcome message
- **ai.systemPromptAdditions**: Add specialty-specific instructions
- **triage**: Emergency keywords and escalation messages
- **knowledgeBase.medicalTopics**: Topics that trigger KB lookup

### 2. Add Knowledge Base Documents (`knowledge-base/`)

Add PDF documents that the AI should reference:

```
knowledge-base/
├── PAO-Recovery-Guide.pdf
├── Physical-Therapy-Protocol.pdf
├── Pain-Management-FAQ.pdf
└── ...
```

Run `npm run kb:ingest` after adding new PDFs.

### 3. Customize the UI (`public/`)

The chat widget is a single-page app in `public/index.html` (HTML, CSS, inline JS):

- **Chat tab** — Message area, input, quick actions; background image from `public/hipbackground.svg`.
- **Library tab** — Sidebar categories and PDF download buttons; data and categories are defined in the script section of `index.html`.
- **Videos tab** — Category filters and video cards; replace placeholder YouTube IDs in the `videos` array with real video IDs from the practice’s channel for thumbnails and links.
- **Branding** — CSS variables in `:root` (primary purple, gold, lavender) match Hip Preservation website.

### 4. (Optional) Add Custom Logic (`overrides/`)

If you need client-specific features not in the core:

```javascript
// overrides/custom-triage.js
export function customTriageLogic(message) {
  // Hip-specific triage rules
}
```

## 🔧 Configuration Reference

### Branding

```json
{
  "branding": {
    "primaryColor": "#4a1c7c",      // Purple (matches hippreservation.org)
    "accentColor": "#c9a227",       // Gold accent
    "chatbotName": "HipGuide",
    "welcomeMessage": "Hi! I'm HipGuide..."
  }
}
```

### AI System Prompt Additions

These instructions are added to the base system prompt:

```json
{
  "ai": {
    "systemPromptAdditions": [
      "You specialize in hip preservation surgery recovery...",
      "When discussing physical therapy, emphasize..."
    ]
  }
}
```

### Triage Keywords

Keywords that trigger emergency/urgent responses:

```json
{
  "triage": {
    "emergencyKeywords": ["blood clot", "DVT", "PE", "severe pain"],
    "urgentKeywords": ["increased swelling", "new pain"]
  }
}
```

## 🏗️ Development Workflow

### Local Development

```bash
npm run start        # Run Express server (from this directory)
# Or from monorepo root:
npm run start:hip    # Same — Hip Preservation on http://localhost:3000
```

The chat widget is static (`public/index.html`); no separate build step. The server serves `public/` (or `dist/` if built) and handles `/api/chat`, `/api/health`, `/api/content`.

### Adding Knowledge Base Documents

1. Add PDFs to `knowledge-base/`
2. Run `npm run kb:ingest` to process them
3. The AI will now reference these documents

### Testing

- Test emergency keywords trigger proper responses
- Test knowledge base citations appear correctly
- Test mobile responsiveness

## 📡 Deployment

This client is deployed via Railway (managed by PulseMed):

1. Push changes to the repository
2. Railway auto-deploys from the `clients/hippreservation` directory
3. Environment variables are configured in Railway dashboard

### Required Environment Variables

- `USE_VENDOR_LLM=true`
- `VENDOR_API_KEY=sk-ant-...` (or `ANTHROPIC_API_KEY`) — Anthropic API key
- No patient data or HubSpot required for this client

## 🆘 Support

For framework questions, check `packages/core/` documentation.
For client-specific questions, contact the PulseMed team.

---

**Note**: Do not modify `packages/core/` unless adding features that benefit ALL clients. Client-specific code goes in `overrides/`.
