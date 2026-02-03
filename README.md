# PulseMed LLC

**Built by Physicians, For Physicians**

PulseMed provides white-label, physician-controlled AI healthcare chatbots to medical practices.

---

## 📁 Project Structure

```
PulseMed/
├── clients/               # Client applications (nayacare, hippreservation)
├── packages/core/          # Shared framework (@pulsemed/core)
├── web/                    # PulseMed Marketing Website
└── Markdowns/              # Business Documentation
```

---

## 🏥 Client Projects

### NayaCare (Pediatrics)
Dr. Sonal Patel's postpartum care chatbot for new parents.

```bash
cd clients/nayacare
npm install
npm start
```
- **Status**: ✅ Production (deployed on Railway)
- **Features**: Chat, Triage, Photo Analysis, Growth Charts, Patient Logging

### Hip Preservation (Orthopedics)
Hip preservation surgery patient education chatbot.

```bash
cd clients/hippreservation
npm install
npm start
```
- **Status**: 🔄 Onboarding
- **Features**: Chat, PDF Resources (Triage disabled)
- **Docs**: All Hip Preservation–specific documentation (AGENTS.md, CHANGELOG.md, README) lives in `clients/hippreservation/`.

---

## 🌐 Marketing Website

```bash
cd web
npm install
npm run dev
```

---

## 📚 Documentation

- [Business Framework](Markdowns/PulseMed%20Business%20Framework.md)
- [Technical Framework](Markdowns/PulseMed%20Technical%20Framework.md)
- [Overview](Markdowns/PULSEMED_OVERVIEW.md)
- [Business Plan Review](Markdowns/BUSINESS_PLAN_REVIEW.md)
- [Developer Guide](DEVELOPER_GUIDE.md)

---

## 🔑 Environment Variables

Each project needs its own `.env` file:

```bash
USE_VENDOR_LLM=true
VENDOR_API_KEY=sk-ant-...  # Anthropic API key

# HubSpot (optional, per client)
HUBSPOT_ACCESS_TOKEN=...
HUBSPOT_PORTAL_ID=...
```

---

**PulseMed LLC** - Colorado, USA  
*Proprietary & Confidential*
