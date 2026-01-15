# @pulsemed/core

**Platform-Agnostic Medical AI Framework**

This is the shared infrastructure for building medical AI assistants. It makes **no assumptions** about:
- CRM platform (HubSpot, Wix, Salesforce, custom, etc.)
- Medical specialty (pediatrics, orthopedics, cardiology, etc.)
- Feature set (what each client needs)

## What Core Provides

| Component | Description |
|-----------|-------------|
| **Server** | Express server setup, routing, middleware |
| **Chat Engine** | AI chat handler with configurable system prompts |
| **KB Loader** | Abstract knowledge base interface (clients implement their own) |
| **Admin Framework** | Base admin dashboard components |
| **Auth Flow** | Authentication patterns (clients implement storage) |
| **Triage Engine** | Emergency detection with configurable keywords |
| **Config System** | Client configuration loading and validation |

## What Clients Provide

Each client (`clients/hippreservation/`, etc.) provides:

| Component | Description |
|-----------|-------------|
| **config.json** | Branding, features, AI behavior, triage rules |
| **CRM Adapter** | Integration with their CRM (Wix, HubSpot, etc.) |
| **Knowledge Base** | PDFs and content for their specialty |
| **System Prompts** | Specialty-specific AI instructions |
| **Custom Features** | Client-specific functionality |

## Usage

```javascript
// In a client's server.js
import { createServer, loadConfig } from '@pulsemed/core';
import { WixAdapter } from './adapters/wix.js';  // Client provides this

const config = loadConfig('./config.json');

const server = await createServer(config, {
  crmAdapter: new WixAdapter(),  // Client's CRM
  knowledgeBaseLoader: async () => {
    // Client implements their own KB loading
    return loadLocalPDFs('./knowledge-base/');
  }
});
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATION                    │
│  (hippreservation, future-client-x, etc.)               │
├─────────────────────────────────────────────────────────┤
│  config.json │ CRM Adapter │ KB Content │ Custom Code   │
└──────────────┴─────────────┴────────────┴───────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    @pulsemed/core                        │
├─────────────────────────────────────────────────────────┤
│  Server │ Chat Engine │ Admin │ Auth │ Triage │ Config  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    External Services                     │
├─────────────────────────────────────────────────────────┤
│  Anthropic API │ Client's CRM │ Client's Hosting        │
└─────────────────────────────────────────────────────────┘
```

## No Assumptions

The core does NOT assume:
- ❌ HubSpot (or any specific CRM)
- ❌ Pediatrics (or any specific specialty)
- ❌ Specific features (baby tracking, surgery logs, etc.)
- ❌ Specific branding or UI

Everything is configurable through the client's `config.json` and custom adapters.
