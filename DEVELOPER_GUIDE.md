# PulseMed Developer & Deployment Guide

**Single Source of Truth** for developing and deploying PulseMed clients.

---

## 📁 Repository Structure

PulseMed is an **npm workspaces monorepo**:

```
PulseMed/
├── packages/
│   └── core/                    # 🔧 SHARED FRAMEWORK (@pulsemed/core)
│       ├── api/                 # AI chat engine, server utilities
│       ├── server.js            # Express server setup
│       ├── config.js            # Configuration loading
│       └── types/                # Type definitions
│
├── clients/
│   ├── nayacare/                # 👶 NAYACARE (PRODUCTION - separate repo)
│   │   └── ...                  # Deployed from separate GitHub repo
│   │
│   └── hippreservation/         # 🦴 HIP PRESERVATION (IN DEVELOPMENT)
│       ├── config.json          # Client configuration
│       ├── knowledge-base/      # PDF documents
│       ├── prompts/             # System prompt customizations
│       ├── overrides/           # Client-specific code
│       ├── src/                  # React frontend
│       ├── server.js             # Express server entry point
│       ├── railway.toml          # Railway deployment config
│       └── package.json          # Dependencies (uses workspace:*)
│
├── web/                         # 🌐 Marketing website (Next.js)
│
└── package.json                 # Workspace root configuration
```

---

## ⚠️ Important Rules

### 1. DO NOT MODIFY `/clients/nayacare`
NayaCare is a **production application** deployed from a separate repository. It uses HubSpot and has completely different features. Leave it alone.

### 2. Client Code Goes in `/clients/{client-name}/`
Each client gets their own folder. All work for that client stays in their folder:
- Configuration → `config.json`
- Knowledge base → `knowledge-base/`
- UI customizations → `src/`
- Custom features → `overrides/`

### 3. Core Changes Require Discussion
If you think something should be added to `packages/core/`, discuss it first. Core changes affect ALL future clients.

---

## 🚀 Local Development

### Setup

```bash
# From monorepo root
cd /Volumes/Coderbase/Projects/PulseMed

# Install all dependencies (resolves workspace dependencies)
npm install

# Run client locally
npm run dev:hip
# Or: npm run dev --workspace=clients/hippreservation
```

### Development Commands

```bash
# From monorepo root
npm run dev:hip              # Start hippreservation dev server
npm run build:all            # Build all clients
npm run start:hip            # Start hippreservation production server

# From client directory
cd clients/hippreservation
npm run dev                  # Start Vite dev server
npm run build                # Build for production
npm run kb:ingest            # Process knowledge base PDFs
```

---

## 🚂 Railway Deployment (Current Setup)

**PulseMed uses Railway to deploy clients from the monorepo.**

### How It Works

1. Railway connects to the `PulseMed` GitHub repository
2. Each client is deployed as a separate service in the same Railway project
3. Services use workspace commands to build/start from monorepo root
4. Root directory is set to `.` (monorepo root) so workspace dependencies resolve

### Step-by-Step: Deploying a New Client

#### 1. Create Service in Railway

- Go to your Railway project (e.g., "PulseMedWeb")
- Click **"+ Create"** → **"GitHub Repo"**
- Select `cmanfre7/PulseMed`
- Railway will create a service (may have random name)

#### 2. Rename Service (Optional)

- Click on the service → Settings → General
- Rename to: `hippreservation` or `client-hippreservation`

#### 3. Configure Source

**Settings → Source:**
- **Root Directory**: `.` (just a dot - monorepo root)
- **Branch**: `main`
- **Wait for CI**: Off (unless you use GitHub Actions)

#### 4. Configure Build

**Settings → Build:**
- **Builder**: Ensure "Nixpacks" or "Railpack" is selected (NOT Dockerfile)
- **Custom Build Command**: `npm install && npm run build --workspace=@pulsemed/client-hippreservation`
  - This installs from root (resolves workspace deps) then builds the client

**IMPORTANT**: If Railway detects a Dockerfile, delete it. Client deployments must use Nixpacks.

#### 5. Configure Deploy

**Settings → Deploy:**
- **Custom Start Command**: `node clients/hippreservation/server.js`
  - Uses direct path (workspace commands don't work in start phase)

#### 6. Add Environment Variables

**Variables tab:**
- `USE_VENDOR_LLM=true`
- `VENDOR_API_KEY=sk-ant-...` (Anthropic API key)
- `NODE_ENV=production`
- Any other client-specific variables

#### 7. Deploy

- Click **"Deploy"** button
- Railway will:
  1. Run `npm install` from monorepo root (resolves `workspace:*` dependencies)
  2. Run build command (builds the client)
  3. Run start command (starts the client)

### Railway Configuration File

Each client has a `railway.toml` in their directory (optional):

```toml
[build]
builder = "nixpacks"
buildCommand = "npm install && npm run build --workspace=@pulsemed/client-hippreservation"

[deploy]
startCommand = "node clients/hippreservation/server.js"
```

**Note**: Railway dashboard settings override `railway.toml`. Use dashboard settings for most reliable deployment.

### Watch Paths (Optional)

**Settings → Build → Watch Paths:**
- Add: `/clients/hippreservation/**`
- This triggers redeploy only when client files change

---

## 🎨 Client Configuration

### config.json Structure

Each client has a `config.json` file:

```json
{
  "clientId": "hippreservation",
  "clientName": "Hip Preservation Orthopedic Surgery",
  "displayName": "HipGuide",
  "specialty": "orthopedics",
  "platform": "wix",
  
  "branding": {
    "primaryColor": "#4a1c7c",
    "accentColor": "#c9a227",
    "chatbotName": "HipGuide",
    "welcomeMessage": "Hi! I'm HipGuide..."
  },
  
  "features": {
    "chat": true,
    "imageAnalysis": false,
    "patientLogging": false,
    "adminDashboard": true
  },
  
  "ai": {
    "model": "claude-sonnet-4-5-20250929",
    "systemPromptAdditions": [
      "You specialize in hip preservation surgery recovery..."
    ]
  },
  
  "triage": {
    "emergencyKeywords": ["blood clot", "DVT", "severe pain"]
  }
}
```

### Key Configuration Areas

- **Branding**: Colors, logo, chatbot name, welcome message
- **AI**: Model selection, system prompt additions, temperature
- **Triage**: Emergency keywords, escalation messages
- **Features**: Enable/disable features per client

---

## 📦 Workspace Dependencies

Clients reference the core framework via workspace protocol:

```json
{
  "dependencies": {
    "@pulsemed/core": "workspace:*"
  }
}
```

This means:
- `npm install` from monorepo root resolves `@pulsemed/core` from `packages/core/`
- No need to publish core separately for monorepo development
- All clients share the same core version during development

---

## 🔧 Adding a New Client

### 1. Create Client Directory

```bash
mkdir clients/new-client-name
cd clients/new-client-name
```

### 2. Copy Template Structure

Copy from `clients/hippreservation/`:
- `config.json` (update with client details)
- `package.json` (update name, keep `workspace:*` dependency)
- `src/` directory structure
- `railway.toml` (update workspace path)

### 3. Configure Client

- Edit `config.json` with client branding, AI prompts, triage rules
- Add knowledge base PDFs to `knowledge-base/`
- Customize UI in `src/`

### 4. Add to Root package.json

```json
{
  "scripts": {
    "dev:new-client": "npm run dev --workspace=clients/new-client-name",
    "start:new-client": "npm run start --workspace=clients/new-client-name"
  }
}
```

### 5. Deploy to Railway

Follow the Railway deployment steps above.

---

## 🐛 Troubleshooting

### "Unsupported URL Type workspace:*"

**Problem**: Railway trying to install from client directory instead of root.

**Solution**: 
- Set Root Directory to `.` (monorepo root) in Railway Settings → Source
- Ensure build command includes `npm install` at the start
- Use workspace package name: `@pulsemed/client-hippreservation`

### Railway Using Dockerfile Instead of Nixpacks

**Problem**: Railway detects a Dockerfile and ignores nixpacks configuration.

**Solution**:
- Delete or rename any Dockerfile in the repository root
- Railway will automatically fall back to Nixpacks
- Check build logs to confirm "Using Nixpacks" or "Railpack"

### "Cannot find module '/app/web/clients/...'"

**Problem**: Railway is using Dockerfile which sets WORKDIR to `/app/web`.

**Solution**:
- Delete the Dockerfile from the repository
- Use start command: `node clients/hippreservation/server.js` (direct path)
- Root directory must be `.` (monorepo root)

### Build Succeeds but Start Fails

**Problem**: Workspace commands don't work in the start phase.

**Solution**:
- Use direct path in start command: `node clients/hippreservation/server.js`
- Don't use `npm run start --workspace=...` in Railway start command

### Service Has Random Name

**Problem**: Railway auto-generates service names.

**Solution**: 
- Settings → General → Rename service to `hippreservation` or `client-hippreservation`

---

## 📋 Deployment Checklist

Before deploying a client:

- [ ] Root Directory set to `.` in Railway
- [ ] Build command includes `npm install && npm run build --workspace=clients/{name}`
- [ ] Start command is `npm run start --workspace=clients/{name}`
- [ ] Environment variables configured
- [ ] Knowledge base PDFs added and ingested
- [ ] `config.json` configured with client details
- [ ] Tested locally: `npm run dev:hip` works
- [ ] Tested build: `npm run build --workspace=clients/hippreservation` works

---

## 🆘 Support

- **Framework questions**: Check `packages/core/README.md`
- **Railway issues**: Check Railway logs and settings
- **Client-specific**: Check client's `README.md` in their directory

---

## 📚 Quick Reference

### Monorepo Commands

```bash
# Install all dependencies
npm install

# Run client dev server
npm run dev:hip

# Build client
npm run build --workspace=clients/hippreservation

# Start client production server
npm run start --workspace=clients/hippreservation

# Build all clients
npm run build:all
```

### Railway Settings Summary

- **Root Directory**: `.` (monorepo root)
- **Builder**: Nixpacks (NOT Dockerfile)
- **Build Command**: `npm install && npm run build --workspace=@pulsemed/client-hippreservation`
- **Start Command**: `node clients/hippreservation/server.js`
- **Watch Paths**: `/clients/hippreservation/**` (optional - only redeploy when client changes)

---

**Last Updated**: January 2025  
**Maintained by**: PulseMed Development Team
