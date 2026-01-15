# Hip Preservation - AI Surgery Recovery Assistant

## 🦴 Project Overview

HipGuide is an AI-powered assistant for patients of Hip Preservation Orthopedic Surgery. It helps patients navigate their recovery journey from hip preservation procedures including:

- **PAO (Periacetabular Osteotomy)** - Complex hip dysplasia correction
- **Hip Arthroscopy** - Minimally invasive hip joint surgery
- **Combined Procedures** - Arthroscopy + PAO

## 🚀 Quick Start

```bash
# From this directory
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (Vite dev server).

## 📁 Project Structure

```
hippreservation/
├── config.json           # 🔧 CLIENT CONFIGURATION - Your main customization file
├── knowledge-base/       # 📚 PDF documents for the AI to reference
├── prompts/              # 💬 Custom system prompts (optional)
├── overrides/            # 🔄 Client-specific code overrides
├── public/               # 🎨 Static assets (logo, images)
├── src/                  # ⚛️ React frontend code
│   ├── App.jsx           # Main application component
│   └── index.css         # Styles (Tailwind)
├── server.js             # 🖥️ Express server entry point
└── package.json          # Dependencies
```

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

### 3. Customize the UI (`src/`)

The React frontend can be customized:

- `src/App.jsx` - Main component (chat interface)
- `src/index.css` - Tailwind CSS styles
- `public/` - Logo and static assets

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
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run start        # Run production server
```

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
- `VENDOR_API_KEY=sk-ant-...` (Anthropic API key)
- `HUBSPOT_API_KEY=...` (if using HubSpot)

## 🆘 Support

For framework questions, check `packages/core/` documentation.
For client-specific questions, contact the PulseMed team.

---

**Note**: Do not modify `packages/core/` unless adding features that benefit ALL clients. Client-specific code goes in `overrides/`.
