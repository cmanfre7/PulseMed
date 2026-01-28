# AGENTS.md — PulseMed

## Overview
PulseMed is a **white-label healthcare AI platform** that provides physician-controlled chatbots to medical practices. Unlike general AI (ChatGPT), our chatbots use **only physician-approved content** with zero hallucination risk. Production-proven with 12 core innovations deployed in live healthcare environments.

## Tech Stack
- **Monorepo**: npm workspaces
- **Core Framework**: Node.js + Express (`packages/core/`)
- **Frontend**: React + Vite (per-client in `clients/*/src/`)
- **Marketing Website**: Next.js 16 + React 19 + Tailwind 4 (`web/`)
- **AI**: Claude (Anthropic) via API
- **Deployment**: Railway (Nixpacks, NOT Dockerfile)
- **Platform**: Multi-tenant white-label architecture

## Repository Structure
```
PulseMed/
├── packages/core/          # 🔧 Shared framework (@pulsemed/core)
│   ├── api/chat.js         # AI chat engine
│   ├── server.js           # Express server setup
│   └── config.js           # Configuration loading
│
├── clients/
│   ├── nayacare/           # 🚫 PRODUCTION - DO NOT MODIFY (separate repo)
│   └── hippreservation/    # 🦴 Hip Preservation (in development)
│       ├── config.json     # Client configuration
│       ├── prompts/        # System prompt customizations
│       ├── overrides/      # Client-specific code
│       └── server.js       # Express entry point
│
├── web/                    # 🌐 Marketing website (Next.js)
│   └── src/app/            # App router pages
│
├── Markdowns/              # 📄 Business documentation
│   ├── PULSEMED_OVERVIEW.md
│   └── PulseMed Technical Framework.md
│
└── DEVELOPER_GUIDE.md      # 📚 Deployment & development guide
```

## ⚠️ Critical Rules

### 1. NEVER MODIFY `/clients/nayacare`
NayaCare is **production** and deployed from a **separate repository**. It uses HubSpot and has completely different features. Leave it alone.

### 2. Client Code Isolation
Each client gets their own folder. All work for that client stays in their folder:
- Configuration → `config.json`
- Knowledge base → `knowledge-base/`
- UI customizations → `src/`
- Custom features → `overrides/`

### 3. Core Changes Need Discussion
Changes to `packages/core/` affect ALL future clients. Discuss before modifying.

## Key Files
| Path | Purpose |
|------|---------|
| `packages/core/api/chat.js` | AI chat engine, RAG pipeline |
| `packages/core/server.js` | Express server setup |
| `clients/*/config.json` | Client-specific configuration |
| `clients/*/prompts/system-prompt.md` | Custom system prompts |
| `web/src/app/page.tsx` | Marketing site homepage |
| `DEVELOPER_GUIDE.md` | Full deployment guide |
| `railway.toml` | Railway deployment config |

## Conventions
- **Package names**: `@pulsemed/core`, `@pulsemed/client-{name}`
- **Workspace deps**: Use `workspace:*` in client package.json
- **Config-driven**: Client behavior controlled by `config.json`, not code changes
- **Railway root**: Always set to `.` (monorepo root)
- **No Dockerfile**: Use Nixpacks for client deployments

## Common Commands
```bash
# Install all dependencies (from monorepo root)
npm install

# Run Hip Preservation client locally
npm run dev:hip

# Run marketing website
npm run dev:web

# Build specific client
npm run build --workspace=clients/hippreservation

# Build all clients
npm run build:all

# Start production server
npm run start:hip
```

## Railway Deployment
```bash
# Root Directory: .
# Build Command: npm install && npm run build --workspace=@pulsemed/client-hippreservation
# Start Command: node clients/hippreservation/server.js

# Required Environment Variables:
# - USE_VENDOR_LLM=true
# - VENDOR_API_KEY=sk-ant-... (Anthropic)
# - NODE_ENV=production
```

## Client Configuration (config.json)
```json
{
  "clientId": "hippreservation",
  "clientName": "Hip Preservation Orthopedic Surgery",
  "displayName": "HipGuide",
  "branding": {
    "primaryColor": "#4a1c7c",
    "chatbotName": "HipGuide"
  },
  "features": {
    "chat": true,
    "imageAnalysis": false,
    "adminDashboard": true
  },
  "ai": {
    "model": "claude-sonnet-4-5-20250929"
  }
}
```

## Adding a New Client
1. `mkdir clients/new-client-name`
2. Copy template from `clients/hippreservation/`
3. Update `config.json` with client details
4. Add to root `package.json` scripts
5. Deploy to Railway as new service

## Troubleshooting
| Issue | Fix |
|-------|-----|
| "workspace:* unsupported" | Set Railway Root Directory to `.` |
| Railway uses Dockerfile | Delete Dockerfile, use Nixpacks |
| Start fails after build | Use direct path: `node clients/*/server.js` |

## Business Context
- **Target**: Medical practices (orthopedics, pediatrics, etc.)
- **Value Prop**: Zero hallucination AI (curated knowledge only)
- **Pricing**: $2,500-$12,000/month tiers
- **Key Feature**: Physician-controlled, HIPAA compliant, full audit trail

---
*Last Updated: January 2025*
