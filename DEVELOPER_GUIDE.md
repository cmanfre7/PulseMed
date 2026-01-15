# PulseMed Developer Guide

## 🎯 For New Developers Working on Client Projects

Welcome! This guide explains how PulseMed is structured and how to build new client applications.

---

## 📁 Repository Structure

```
PulseMed/
├── packages/
│   └── core/                    # 🔧 SHARED FRAMEWORK (don't modify unless adding universal features)
│       ├── api/chat.js          # AI chat engine
│       ├── server.js            # Express server utilities
│       ├── config.js            # Configuration loading
│       └── types/               # Type definitions
│
├── clients/
│   └── hippreservation/         # 🦴 HIP PRESERVATION CLIENT (your workspace)
│       ├── config.json          # Client configuration
│       ├── knowledge-base/      # PDF documents
│       ├── prompts/             # System prompt customizations
│       ├── overrides/           # Client-specific code
│       └── src/                 # React frontend
│
├── nayacare/                    # 👶 NAYACARE (PRODUCTION - DO NOT TOUCH)
│                                # This is a separate, completed project
│
├── web/                         # 🌐 Marketing website (Next.js)
│
└── Markdowns/                   # 📄 Business documentation
```

---

## ⚠️ Important Rules

### 1. DO NOT TOUCH `/nayacare`
NayaCare is a **production application** for a different client (pediatrics). It uses HubSpot and has completely different features. Leave it alone.

### 2. Client Code Goes in `/clients/{client-name}/`
Each client gets their own folder under `/clients/`. All work for that client stays in their folder:
- Configuration → `config.json`
- Knowledge base → `knowledge-base/`
- UI customizations → `src/`
- Custom features → `overrides/`

**Current clients:**
- `hippreservation/` - Hip Preservation Orthopedic Surgery (Wix)

### 3. Core Changes Require Discussion
If you think something should be added to `packages/core/`, discuss it first. Core changes affect ALL future clients.

---

## 🦴 Current Project: Hip Preservation

> This section documents the **current active client**. Future clients will have similar structure but different configs.

### Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **AI**: Claude (Anthropic)
- **CRM**: Wix (NOT HubSpot)
- **Hosting**: TBD (Railway or client's preference)

### Key Files

| File | Purpose |
|------|---------|
| `config.json` | All client settings (branding, AI behavior, triage rules) |
| `prompts/system-prompt.md` | Additional AI instructions for orthopedics |
| `knowledge-base/*.pdf` | Surgeon's documents the AI references |
| `src/App.jsx` | Main React application |

### Configuration (`config.json`)

```json
{
  "clientId": "hippreservation",
  "clientName": "Hip Preservation Orthopedic Surgery",
  "platform": "wix",
  
  "branding": {
    "primaryColor": "#4a1c7c",    // Purple
    "accentColor": "#c9a227",     // Gold
    "chatbotName": "HipGuide"
  },
  
  "ai": {
    "systemPromptAdditions": [
      "You specialize in hip preservation surgery recovery..."
    ]
  },
  
  "triage": {
    "emergencyKeywords": ["blood clot", "DVT", "severe pain", ...]
  }
}
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd /Users/cmanfre/Desktop/Projects/PulseMed/clients/hippreservation
npm install
```

### 2. Set Environment Variables
Create `.env` file:
```
VENDOR_API_KEY=sk-ant-api03-...  # Anthropic API key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Add Knowledge Base Documents
1. Get PDFs from the Hip Preservation surgical team
2. Add them to `knowledge-base/`
3. Run `npm run kb:ingest` to process them

---

## 🎨 Customization Guide

### Branding (Colors, Logo)
Edit `config.json` → `branding`:
```json
{
  "branding": {
    "primaryColor": "#4a1c7c",
    "accentColor": "#c9a227",
    "chatbotName": "HipGuide",
    "welcomeMessage": "Hi! I'm HipGuide..."
  }
}
```

### AI Behavior
Edit `config.json` → `ai.systemPromptAdditions` or `prompts/system-prompt.md`:
```json
{
  "ai": {
    "systemPromptAdditions": [
      "When discussing PAO recovery, emphasize the 6-12 week non-weight bearing period",
      "Always recommend following the specific PT protocol from the surgical team"
    ]
  }
}
```

### Emergency/Triage Rules
Edit `config.json` → `triage`:
```json
{
  "triage": {
    "emergencyKeywords": ["blood clot", "DVT", "PE", "severe pain", "fever over 101"],
    "escalationMessage": "🚨 Contact your surgeon immediately..."
  }
}
```

### UI Components
Modify `src/App.jsx` and `src/index.css` for visual changes.

---

## 📋 Development Checklist

Before deploying:

- [ ] Knowledge base PDFs added and ingested
- [ ] Emergency keywords tested (simulate "blood clot" message)
- [ ] Branding matches hippreservation.org
- [ ] Mobile responsive
- [ ] Disclaimer visible in chat
- [ ] Wix integration working (if applicable)

---

## 🆘 Questions?

- **Framework questions**: Check `packages/core/README.md`
- **Architecture questions**: Ask the PulseMed team
- **Hip Preservation specific**: Contact the client's surgical team
