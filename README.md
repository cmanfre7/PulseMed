# PulseMed LLC

**Built by Physicians, For Physicians**

PulseMed provides white-label, physician-controlled AI healthcare chatbots to medical practices.

---

## 📁 Project Structure

```
PulseMed/
├── nayacare/              # Dr. Patel's Pediatric Practice (LIVE)
├── hip-preservation/      # Hip Preservation Ortho Surgery (NEW CLIENT)
├── web/                   # PulseMed Marketing Website
└── Markdowns/             # Business Documentation
```

---

## 🏥 Client Projects

### NayaCare (Pediatrics)
Dr. Sonal Patel's postpartum care chatbot for new parents.

```bash
cd nayacare
npm install
npm start
```
- **Status**: ✅ Production (deployed on Railway)
- **Features**: Chat, Triage, Photo Analysis, Growth Charts, Patient Logging

### Hip Preservation (Orthopedics)  
Hip preservation surgery patient education chatbot.

```bash
cd hip-preservation
npm install
npm start
```
- **Status**: 🔄 Onboarding
- **Features**: Chat, PDF Resources (Triage disabled)

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

---

## 🔑 Environment Variables

Each project needs its own `.env` file:

```bash
USE_VENDOR_LLM=true
VENDOR_API_KEY=sk-ant-...  # Anthropic API key

# HubSpot (optional)
HUBSPOT_ACCESS_TOKEN=...
HUBSPOT_PORTAL_ID=...
```

---

**PulseMed LLC** - Colorado, USA  
*Proprietary & Confidential*
