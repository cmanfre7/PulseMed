## PulseMed Platform Layer

This directory contains the **core backend, AI orchestration, and infrastructure code** for PulseMed.

### Recommended structure

- `api/`  
  - HTTP/GraphQL APIs, authentication, routing
- `services/`  
  - Domain services (knowledge base, triage engine, de-identification, analytics)
- `workers/`  
  - Background jobs, queues, scheduled tasks
- `infra/`  
  - Infrastructure-as-code (Terraform, CDK, Pulumi, etc.), deployment configs
- `integrations/`  
  - External systems (LLMs, EHRs, HubSpot, email/SMS, storage)
- `tests/`  
  - Unit, integration, and end-to-end tests for the platform

### Responsibilities

- Knowledge base and document processing (PDF + OCR)
- AI model routing and safety guardrails
- Triage logic (when enabled for a practice)
- PHI de-identification and HIPAA-related safeguards
- Multi-tenancy, practice configuration, consent & audit logging
- Analytics, research data exports, and admin operations

All web/UX concerns live in the sibling `web` directory.
