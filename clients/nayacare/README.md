# 🤖 AI INSTRUCTION: READ THIS FIRST
**This is the PRIMARY and COMPLETE documentation for the NayaCare project. All AIs should reference this file FIRST before making any changes or suggestions.**

---

## 🎯 **CURRENT PRIORITIES**

### **✅ COMPLETED - Profile Relations & Telehealth Booking (v1.11.0 - November 23, 2025)**

**Status**: ✅ **FULLY IMPLEMENTED AND WORKING**

**What Was Completed**:
- **Profile Relation Support**: Users now specify their relationship to baby (Mother, Father, Other)
- **Prenatal Support**: Added "Baby not born yet" option with expected due date tracking
- **Age Calculation Bug Fix**: Fixed incorrect "2916 weeks" display for unborn babies
- **Telehealth Booking**: Added prominent "Book Telehealth" button with coming soon placeholder
- **Personalized Welcome Messages**: Tailored greetings based on relation and pregnancy status

**Implementation Details**:
- **Files Modified**: [src/App.jsx](src/App.jsx) (profile setup, age calculations), [src/index.css](src/index.css) (animations)
- **New Features**: Custom relation input, dynamic birth/due date fields, pregnancy timeline display
- **Bug Fix**: Created getBabyAgeOrPregnancy helper to handle both born and unborn babies
- **Result**: App now fully supports expecting parents and various caregiver relationships

---

### **✅ COMPLETED - Post-Auth Consent Modal (NAY-9) (v1.10.0 - November 8, 2025)**

**Status**: ✅ **FULLY IMPLEMENTED AND WORKING**

**What Was Completed**:
- Moved consent modal from pre-authentication to post-authentication
- New flow: Email → PIN → Consent Check → Consent Modal (if needed) → Baby Profile → Chat
- Created 5 HubSpot consent properties with version tracking
- Built consent status and acceptance APIs with HIPAA audit trail
- Fixed "User not authenticated" bug during new registration
- Eliminated UI lag (new users: instant, existing users: brief spinner)
- Added consent data to survey analytics CSV export for IRB research
- Updated emergency triage protocol and AI language for inclusivity

**Implementation Details**:
- **Files Created**: [api/consent/status.ts](api/consent/status.ts), [api/consent/accept.ts](api/consent/accept.ts), [scripts/add-consent-properties.js](scripts/add-consent-properties.js)
- **Files Modified**: [api/auth/register.ts](api/auth/register.ts), [src/App.jsx](src/App.jsx), [api/chat.ts](api/chat.ts), [server.js](server.js)
- **Result**: HIPAA-compliant consent tracking with seamless user experience

---

### **✅ COMPLETED - Chat Timestamp Awareness (v1.9.9 - October 27, 2025)**

**Status**: ✅ **FULLY IMPLEMENTED AND WORKING**

**What Was Fixed**:
- AI no longer repeats suggestions it just made moments ago
- Added temporal awareness to conversation context
- Implemented explicit "DO NOT repeat recent advice" instructions in system prompt
- Last 10-12 messages with timestamps now passed to AI for context

**Implementation Details**:
- **File**: [api/chat.ts:191-193](api/chat.ts#L191-L193) - Added TEMPORAL AWARENESS system prompt section
- **File**: [src/App.jsx:594-598](src/App.jsx#L594-L598) - Ensured timestamps passed in recentMessages array
- **Result**: AI now maintains coherent conversation without redundant suggestions

---

### **Growth Charts - Remaining Enhancements (v1.9.3 continuation)**

**PRIORITY 2 - AFTER AI FIX**

**Location**: `src/components/GrowthMeasurementModal.jsx` and `src/components/GrowthCharts.jsx`

**Tasks**:
1. **Group Measurements by Entry Time** - Require all 3 measurements (weight, length, head circumference) to be entered together
   - **Current**: Modal allows entering one measurement at a time (weight OR length OR head circ)
   - **Goal**: Refactor modal to accept all 3 values in a single form submission
   - **UI Change**: When clicking "Track Growth Measurement", show 3 input fields side-by-side
   - **Data Structure**: Store measurements with shared timestamp/group ID

2. **Group Recent Measurements Display** - Show measurements grouped by entry time
   - **Current**: Each measurement displays separately in Recent Measurements list
   - **Goal**: Group measurements by timestamp (e.g., "Oct 22, 2025 at 2:45 PM: Weight 5 lbs, Length 62.5 cm, Head 40.5 cm")
   - **Clickable**: Each group should be clickable to view historical growth chart position

3. **Historical Chart View** - Click any past measurement group to see where baby was on growth curve at that time
   - **Goal**: When clicking a measurement group, highlight that specific point on all 3 growth charts
   - **UI**: Show a modal or expand section with side-by-side mini charts showing the 3 measurements

4. **Verify Percentile Calculation** - Ensure percentile is displaying correctly in "Latest Measurement" section
   - **Current**: Shows percentile but may not be calculating correctly
   - **Goal**: Double-check calculation logic against WHO growth standards

**Why This Matters**: Users want to track all 3 measurements together (like at a doctor's visit) and see how their baby's growth compares across all metrics at specific points in time.

---

# NayaCare Project - Comprehensive Development Guide
## Educational Postpartum Tutor Chatbot for New Parents (0-12+ weeks)

---

## 📋 **PROJECT OVERVIEW**

**NayaCare** is an educational postpartum tutor chatbot designed to support new parents during their first 12+ weeks postpartum. The project focuses on providing **educational guidance only** and does **not replace medical care**. The chatbot triages between education vs. seek-care-now messaging and includes robust safety guardrails.

### **Core Mission**
- Provide 24/7 educational support for new parents
- Triage between educational guidance and urgent care recommendations
- Maintain HIPAA compliance and data security
- Integrate seamlessly with Dr. Sonal Patel's medical practice

### **Target Users**
- New parents (0-12+ weeks postpartum)
- Pregnant women seeking postpartum preparation
- Healthcare providers seeking patient support tools

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Frontend Stack**
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Markdown Rendering**: ReactMarkdown with remark-gfm
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

### **Backend & AI**
- **AI Provider**: Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **Model Performance**: 5-10 second response time (masked with 12-second typing indicator)
- **API Cost**: ~$2-3 per million tokens (prioritizes medical accuracy over speed)
- **Why Sonnet?**: Medical accuracy critical - Haiku 4.5 was too conservative (refused to cite loaded PDFs)
- **Knowledge Base**: HubSpot File Manager + Custom Objects
- **Knowledge Base Priority System**:
  - **Primary Source**: Dr. Patel's uploaded PDFs (6 snippets, 5000 chars each = ~30K total, 50+ medical topics)
  - **Fallback Source**: External medical guidelines (AAP, UpToDate, WHO) with explicit disclosure
  - **Citation Requirement**: AI naturally cites which guide it's referencing
- **PDF Storage**: HubSpot File Manager (300MB limit, bypasses Vercel 4.5MB limit)
- **PDF Processing**: pdf-parse library + Tesseract.js OCR for scanned documents
- **Text Chunking**: Custom implementation for medical documents
- **Supported Topics**: Breastfeeding, sleep, feeding, baby care, health concerns, development, postpartum recovery

### **Deployment & Hosting**
- **Primary Deployment**: Railway.app (Traditional Node.js server with Express)
- **Production URL**: nayacare.up.railway.app
- **Previous Deployment**: Vercel (Serverless Functions) - Migrated due to 4.5MB body size limit
- **Git Repository**: GitHub (cmanfre7/nayacare)
- **Environment Variables**: Managed via Railway dashboard
- **Cost**: $5/month (Railway Hobby plan)

### **Third-Party Integrations**
- **HubSpot CRM**: Contact management and conversation logging
- **HubSpot File Manager**: PDF storage (v1.6.0 - NEW!)
- **HubSpot Custom Objects**: Knowledge base document metadata
- **HubSpot Design Manager**: Website integration
- **Linear**: Issue tracking and project management (optional)
- **Video Management**: YouTube video embedding and management

---

## 🌐 **IMPORTANT URLS & LINKS**

### **Live Applications**
- **Main App**: https://nayacare.up.railway.app
- **Previous URL**: https://nayacare.vercel.app (deprecated - use Railway URL)
- **Dr. Patel's Website**: https://nayacare.org
- **Embed Script**: https://nayacare.up.railway.app/embed.js
- **GitHub Repository**: https://github.com/cmanfre7/nayacare

### **HubSpot Resources**
- **Portal ID**: 243074330
- **Design Manager**: HubSpot → Content → Design Manager
- **Site Footer HTML**: HubSpot → Settings → Website → Site Footer HTML
- **Private Apps**: HubSpot → Settings → Integrations → Private Apps

### **Development Resources**
- **Railway Dashboard**: https://railway.app/dashboard
- **Previous: Vercel Dashboard**: https://vercel.com/dashboard (deprecated)
- **GitHub Actions**: https://github.com/cmanfre7/nayacare/actions
- **Environment Variables**: Railway → Project Settings → Variables

---

## 📁 **PROJECT STRUCTURE**

```
nayacare/
├── .github/
│   └── workflows/
│       └── claude.yml           # GitHub Actions workflow for Claude AI
├── public/
│   ├── embed.js                 # HubSpot integration script
│   └── pregnant-woman-silhouette.png
├── src/
│   ├── components/
│   │   ├── ConsolidatedAdminDashboard.jsx
│   │   ├── GrowthCharts.jsx
│   │   └── AgeTimeline.jsx
│   ├── utils/
│   │   └── memoryManager.js
│   ├── App.jsx                  # Main application component
│   ├── App.css
│   └── index.css
├── functions/
│   ├── chat/
│   │   └── index.ts            # Chat API endpoint
│   ├── admin/
│   │   ├── pdf-processor.ts    # PDF processing
│   │   └── resource-manager.ts # Resource CRUD operations
│   └── upload/
│       └── index.ts            # File upload handling
├── AI Intellect Pool/
│   └── Breastfeeding Resources/
│       └── [Dr. Patel's PDFs]
├── CLAUDE.md                    # AI coding standards and project context
├── AI_INSTRUCTIONS.md           # Critical AI instructions
├── README.md                    # This file - comprehensive documentation
├── package.json
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

---

## 🔧 **ENVIRONMENT VARIABLES**

### **Required Environment Variables (Railway)**
```bash
# AI Configuration
USE_VENDOR_LLM=true
VENDOR_API_KEY=your_anthropic_claude_key

# HubSpot Integration
HUBSPOT_ACCESS_TOKEN=your_hubspot_private_app_token
HUBSPOT_PORTAL_ID=243074330

# Linear Integration (Optional - for issue tracking)
LINEAR_API_KEY=lin_api_your_linear_api_key
LINEAR_TEAM_KEY=NAY

# Application Settings
NODE_ENV=production
```

### **Environment Setup**
1. **Railway Dashboard** → Project Settings → Variables
2. **Add all variables** listed above
3. **Redeploy** application after adding variables (automatic on Railway)

---

## 🚀 **DEPLOYMENT PROCESS**

### **Railway Deployment (CURRENT)**

#### **Automatic Deployment**
- **Trigger**: Push to `main` branch on GitHub
- **Platform**: Railway.app automatically builds and deploys
- **URL**: https://nayacare.up.railway.app
- **Build Command**: `npm run build` (builds Vite frontend)
- **Start Command**: `npm start` (runs `tsx server.js`)
- **Cost**: $5/month (Hobby plan)

#### **Railway Configuration**
Railway uses `railway.toml` for configuration:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
```

#### **Server Architecture**
Unlike Vercel's serverless functions, Railway runs a traditional Express server:
- `server.js` - Express server that bridges Vercel-style API routes
- Pre-loads all TypeScript API handlers at startup using `tsx`
- Serves static files from `dist/` folder
- Supports 100MB file uploads (no 4.5MB Vercel limit)

#### **Manual Deployment Steps**
```bash
# 1. Commit changes
git add .
git commit -m "Your commit message"
git push origin main

# 2. Wait for Railway deployment (2-3 minutes)
# 3. Verify deployment at https://nayacare.up.railway.app
```

### **Deployment Verification**
- ✅ Application loads without errors
- ✅ Chatbot widget appears in bottom right
- ✅ Admin dashboard accessible via Ctrl+Shift+A
- ✅ PDF processing functions work (up to 100MB files)
- ✅ HubSpot integration active
- ✅ Check Railway logs for: `🚀 NayaCare running on http://0.0.0.0:8080`

### **Previous Deployment (Vercel) - DEPRECATED**
**Why we migrated from Vercel:**
- ❌ Vercel Hobby plan has hard 4.5MB body size limit (HTTP 413 error)
- ❌ Cannot be configured even on Vercel Pro plan
- ❌ Prevented uploading PDFs larger than 4.5MB
- ❌ More expensive ($20/month for Pro vs $5/month Railway Hobby)

**Migration completed:** October 14, 2025

---

## 📚 **HUBSPOT FILE MANAGER INTEGRATION (v1.6.0)**

### **Overview**
The PDF knowledge base now uses **HubSpot File Manager** for storage instead of Vercel serverless storage. This solves the HTTP 413 error caused by Vercel's 4.5MB body size limit.

### **Architecture**

**Storage Flow**:
1. User uploads PDF via admin dashboard
2. PDF is parsed locally using `pdf-parse`
3. File is uploaded to **HubSpot File Manager** (300MB limit)
4. Metadata is stored in **HubSpot Custom Object** (`knowledge_base_documents`)
5. Text content is indexed for AI retrieval

**Key Components**:
- `api/hubspot/file-manager.ts` - HubSpot File Manager API integration
- `api/admin/upload-pdf.ts` - PDF upload handler (uses HubSpot)
- `api/admin/knowledge-base.ts` - Knowledge base CRUD operations
- `api/chat.ts` - AI knowledge retrieval from HubSpot

### **Setup Instructions**

**Step 1: Create HubSpot Custom Object**

Run the setup script:
```bash
export HUBSPOT_ACCESS_TOKEN=your_token
node scripts/create-hubspot-schema.js
```

Or create manually in HubSpot:
1. Settings → Data Management → Objects → Custom Objects
2. Create object: `knowledge_base_documents`
3. Add properties (see `HUBSPOT_SETUP.md` for complete list)

**Step 2: Configure HubSpot Private App**

Required scopes:
- `crm.objects.custom.read` - Read custom objects
- `crm.objects.custom.write` - Write custom objects
- `files` - Upload and manage files
- `files.ui_hidden.read` - Read hidden files

**Step 3: Add Environment Variables**

Vercel environment variables:
```bash
HUBSPOT_ACCESS_TOKEN=your_private_app_token
HUBSPOT_PORTAL_ID=243074330
```

### **Features**

✅ **Large File Support**: Upload PDFs up to 300MB (HubSpot limit)
✅ **Real PDF Parsing**: Extracts text using `pdf-parse` library
✅ **Smart Text Chunking**: Paragraph and sentence-aware chunking
✅ **Category Organization**: 8 organized categories for medical content
✅ **AI Integration**: Chatbot retrieves knowledge from HubSpot
✅ **Metadata Storage**: File info, page count, chunks, upload date
✅ **Search Functionality**: Query documents by category or text

### **File Size Limits**

| Platform | Limit | Status | Notes |
|----------|-------|--------|-------|
| Vercel Hobby (Body Size) | 4.5MB | ⚠️ **HARD LIMIT** | Cannot be bypassed on Hobby plan |
| Vercel Pro (Body Size) | 100MB | ✅ Available | $20/month upgrade |
| HubSpot File Manager | 300MB | ✅ Ready | Requires Vercel Pro for uploads >4.5MB |
| Local Processing | 100MB | ⚙️ Configurable | Set in upload-pdf.ts |

⚠️ **IMPORTANT**: To upload PDFs >4.5MB through the admin dashboard, you need **Vercel Pro** ($20/month). See [VERCEL_LIMITATIONS.md](./VERCEL_LIMITATIONS.md) for alternatives.

### **Categories**

The system supports 8 categories:
- 🤱 Breastfeeding
- 👶 Newborn Care
- 💝 Postpartum Recovery
- 😴 Sleep Guidance
- 🍼 Feeding & Nutrition
- 📈 Development
- 🚨 Safety & Emergency
- 📚 Other Resources

### **Troubleshooting**

**Error: "Custom object not found"**
- Verify object name is exactly `knowledge_base_documents`
- Check Private App has `crm.objects.custom.read/write` scopes

**Error: "Files upload failed"**
- Verify Private App has `files` scope
- Check file size is under 300MB
- Ensure `HUBSPOT_ACCESS_TOKEN` is set in Vercel

**PDF upload shows HTTP 413 (Payload Too Large)**
- **On Vercel Hobby plan**: This is a hard 4.5MB limit - upgrade to Vercel Pro ($20/month) for 100MB limit
- **Workaround for Hobby plan**: Use PDFs <4.5MB or upload directly to HubSpot File Manager
- Verify `HUBSPOT_ACCESS_TOKEN` is set in Vercel environment variables

**HubSpot Custom Object Setup (One-Time)**
```bash
export HUBSPOT_ACCESS_TOKEN=your_token
node scripts/create-hubspot-schema.js
```

Or create manually in HubSpot: Settings → Data Management → Objects → Custom Objects → Create `knowledge_base_documents`

---

## 🎯 **CURRENT FEATURES**

### **Core Chatbot Functionality**
- **Conversational AI**: Powered by Anthropic Claude
- **Medical Knowledge Base**: Dr. Patel's vetted PDFs (90% preference)
- **Fallback Sources**: UpToDate, AMBOSS, medical references
- **Safety Guardrails**: Red-flag detection and escalation
- **Session Management**: Persistent conversation tracking

### **Admin Dashboard**
- **Knowledge Base Management**: Upload/edit/delete medical documents
- **Resource Management**: PDF downloads, video embeds
- **Analytics**: Conversation tracking and user engagement
- **Content Moderation**: Review and approve AI responses

### **User Interface**
- **Responsive Design**: Mobile and desktop optimized
- **Accessibility**: WCAG 2.1 AA compliant
- **Multi-tab Interface**: Chat, Log, Development, Education, Triage, Resources
- **Quick Topics**: Breastfeeding, Sleep, Feeding, Jaundice, Fever, Diaper changes

### **Integration Features**
- **HubSpot Widget**: Floating button integration
- **PDF Generation**: Dynamic report creation
- **Video Embedding**: YouTube video management
- **Session Tracking**: User journey analytics

---

## ⚠️ **CURRENT ISSUES & CHALLENGES**

### **Critical Issues (HIGH PRIORITY)**

#### **1. Growth Tracking UI**
**Status**: 🟡 **IN PROGRESS - API COMPLETE, UI PENDING**

**Completed**:
- ✅ HubSpot properties created (weight_logs, length_logs, head_circ_logs)
- ✅ API endpoints ready to save/load growth measurements
- ✅ WHO percentile data integrated in GrowthCharts component

**Remaining Work**:
- Input modal for entering measurements (weight, length, head circ)
- Date picker for historical measurements
- Chart visualization component to plot against WHO standards
- Profile-specific measurement filtering
- Gender selection for appropriate WHO curves

**Estimated Completion**: 3-4 hours

#### **2. HubSpot Widget Integration - RESOLVED ✅ (v1.4.0)**
**Status**: ✅ **COMPLETED (October 6, 2025)**

**Solution**:
- ✅ Widget button styling matches design exactly
- ✅ Embed mode (`?embed=true`) fully functional
- ✅ Modal opens full chatbot interface
- ✅ Message passing system for iframe communication
- ✅ Close functionality returns to website properly
- ✅ Legal modal and consent flow working correctly

#### **3. User Authentication & Data Persistence - RESOLVED ✅ (v1.7.0)**
**Status**: ✅ **COMPLETED (October 13, 2025)**

**Solution**:
- ✅ Email + PIN authentication system implemented
- ✅ HubSpot Custom Object for user data
- ✅ Profile Manager modal for multiple babies
- ✅ All data persistence working (profiles, logs, chat history)
- ✅ HubSpot API caching issue resolved
- ✅ AI context awareness (chatbot knows baby's age/name)

### **Moderate Issues (MEDIUM PRIORITY)**

#### **3. PDF Processing - RESOLVED ✅ (v1.6.0 - v1.7.2)**
**Status**: ✅ **RESOLVED - Complete OCR Implementation**

**Solution**:
- ✅ Large PDFs now uploaded to HubSpot File Manager (300MB limit)
- ✅ Migrated to Railway to bypass Vercel 4.5MB body size limit (HTTP 413 error fixed)
- ✅ Real PDF text extraction using pdf-parse
- ✅ **OCR for scanned PDFs** using pdf2pic + Tesseract.js (v1.7.2)
- ✅ Smart text chunking implemented
- ✅ Metadata stored in HubSpot Custom Objects
- ✅ AI retrieval integrated with chat API
- ✅ **Verified end-to-end**: AI successfully quotes PDF content in responses
- ✅ Fixed HubSpot `text_content` property to be writable
- ✅ Achieved 91.8% OCR confidence on test documents

**Remaining Improvements**:
- Search relevance scoring could be enhanced
- Vector embeddings for semantic search (future enhancement)

#### **4. Admin Dashboard UX**
**Status**: 🟡 **NEEDS ATTENTION**

**Issues**:
- Admin dashboard clipping at top (partially fixed)
- Resource management interface could be more intuitive
- Video management needs better error handling
- Bulk operations not available

### **Minor Issues (LOW PRIORITY)**

#### **5. Performance Optimization**
**Status**: 🟢 **ONGOING**

**Areas for Improvement**:
- Chat response latency (target: P95 ≤3s)
- PDF rendering speed (target: <5s)
- Widget load time optimization
- Memory usage optimization

---

## 📋 **RUNNING TODO LIST**

### **✅ COMPLETED - HubSpot Widget Integration (2025-10-06)**

#### **Widget Embed Script**
The NayaCare chatbot can be embedded on any website using this simple script:

```html
<!-- Add this to your website's footer or before </body> tag -->
<script src="https://nayacare.vercel.app/embed.js"></script>
```

**What This Does:**
- Creates a floating pink button in the bottom-right corner
- Opens fullscreen chatbot interface when clicked
- Handles consent modal, profile setup, and chat functionality
- Each session starts fresh (no stored data for HIPAA compliance)
- ESC key or X button closes and returns to your website

**Implementation Details:**
- ✅ Button styling matches Vercel design exactly
- ✅ Embed mode (`?embed=true`) auto-opens chat in iframe
- ✅ Consent modal and baby profile setup flow working
- ✅ Chat history cleared on each new session (privacy/HIPAA)
- ✅ Close button returns to website (no white screen)
- ✅ Pregnant woman silhouette visible and positioned correctly
- ✅ Blinking green status indicator in top-right
- ✅ Message passing system between iframe and parent window
- ✅ Proper iframe sizing (100vw/100vh fullscreen)

**Currently Deployed:** Removed from nayacare.org for continued local development

---

### **🔴 CRITICAL - EMBED MODE ARCHITECTURE**

**⚠️ IMPORTANT: How Embed Mode Works**

The embed system has two parts:

1. **`public/embed.js`** (Simple script - rarely needs changes)
   - Creates floating button
   - Creates iframe pointing to `https://nayacare.vercel.app?embed=true`
   - Handles show/hide behavior
   - Listens for close messages

2. **`src/App.jsx`** (Main app - where all functionality lives)
   - Detects `?embed=true` URL parameter
   - Auto-opens when in embed mode
   - Shows consent modal → profile setup → chat
   - Clears storage for privacy
   - Sends close message to parent window

**🚨 CRITICAL: When Making Changes**

✅ **Safe Changes (automatically work in embed mode):**
- Adding new features to chatbot
- Backend API changes
- UI/UX improvements
- New tabs/sections
- Database/HubSpot integration updates

❌ **Breaking Changes (require testing embed mode):**
- Changing `?embed=true` parameter name or detection logic
- Modifying `window.parent.postMessage` close handling
- Changing `isEmbedMode` state or behavior
- Adding new URL parameters that conflict
- Modifying auto-open logic in embed mode

**Testing Protocol:**
After ANY change to App.jsx, ALWAYS test:
1. Direct URL: `https://nayacare.vercel.app` (normal mode)
2. Embed URL: `https://nayacare.vercel.app?embed=true` (embed mode)
3. Local test page with embed script

---

### **✅ COMPLETED - PDF Knowledge Management System (2025-10-07)**

#### **Organized Folder Structure**
Created 8 category-based folders in `AI Intellect Pool/`:
- 🤱 **Breastfeeding**
- 👶 **Newborn Care**
- 💝 **Postpartum Recovery**
- 😴 **Sleep Guidance**
- 🍼 **Feeding & Nutrition**
- 📈 **Development**
- 🚨 **Safety & Emergency**
- 📚 **Other Resources**

#### **Real PDF Processing**
- ✅ Full text extraction using `pdf-parse` library
- ✅ Smart text chunking (respects paragraphs and sentences)
- ✅ Automatic category-based folder storage
- ✅ Auto-generated descriptions from PDF content
- ✅ File validation and error handling

#### **Enhanced Admin Dashboard**
- ✅ Category selector dropdown for uploads
- ✅ Detailed document cards showing:
  - Title, file name, description
  - Page count, chunk count, file size
  - Upload date with formatting
  - Category badge with emoji icon
  - Active status indicator
- ✅ Category filtering buttons
- ✅ Summary statistics panel (total docs, pages, chunks)
- ✅ Beautiful hover effects and responsive design

#### **⚠️ Current Limitation - Vercel File Size**
**Issue:** Vercel Hobby plan has a **4.5MB request body limit** (HTTP 413 error)
**Impact:** PDFs larger than 4.5MB cannot be uploaded via serverless function
**Solutions:**
1. **Short-term:** Compress PDFs or split into smaller files
2. **Recommended:** Integrate with HubSpot File Manager (no size limits)
3. **Alternative:** Upgrade to Vercel Pro ($20/month, 100MB limit)

**Next Step:** Implement HubSpot File Manager integration for production use

#### **User Documentation**
See **"Dr. Patel's User Guide"** section below for complete instructions.

---

### **🔴 CRITICAL PRIORITY (DO NEXT)**

#### **HubSpot File Manager Integration for PDF Storage**
**Priority:** CRITICAL - Required for production PDF uploads
**Reason:** Vercel Hobby plan has 4.5MB body size limit (HTTP 413 error)

**Current Issue:**
- ✅ Admin dashboard UI complete
- ✅ PDF processing logic ready
- ❌ Cannot upload files >4.5MB on Vercel free plan
- ❌ Serverless functions are stateless (no persistent storage)

**Solution: HubSpot File Manager Integration**

**Why HubSpot:**
- ✅ FREE (already have HubSpot account)
- ✅ 300MB file size limit (vs Vercel Pro's 100MB)
- ✅ Persistent storage (not stateless)
- ✅ Built-in file manager UI
- ✅ Already integrated with HubSpot API
- ✅ Dr. Patel can manage files in HubSpot directly
- ✅ Automatic backups

**Implementation Plan:**
1. **Upload Flow**:
   - User uploads PDF in NayaCare admin dashboard
   - Send PDF to HubSpot File Manager API
   - Get file URL from HubSpot response

2. **Metadata Storage**:
   - Create HubSpot Custom Object: "Knowledge Base Documents"
   - Properties: title, fileName, category, fileUrl, uploadDate, pages, chunks
   - Store extracted text chunks as associated records or properties

3. **Text Extraction**:
   - Download PDF from HubSpot URL when needed
   - Extract text with pdf-parse library
   - Store chunks in HubSpot for AI retrieval

4. **AI Integration**:
   - Chat API queries HubSpot for relevant documents
   - Retrieve text chunks based on category/topic
   - Use Dr. Patel's vetted content in responses

**API Endpoints to Modify:**
- `api/admin/upload-pdf.ts` - Upload to HubSpot instead of local
- `api/admin/knowledge-base.ts` - Query HubSpot Custom Objects
- `api/chat.ts` - Retrieve knowledge from HubSpot

**Estimated Time:** 2-3 hours
**Testing Required:** Upload, retrieval, AI query integration

---

### **🟡 MEDIUM PRIORITY (DO SECOND)**

#### **PDF Processing Optimization**
- [ ] **Improve large PDF handling**
  - [ ] Increase timeout limits
  - [ ] Implement chunked processing
  - [ ] Add progress indicators
- [ ] **Enhance text chunking**
  - [ ] Better semantic boundaries
  - [ ] Preserve medical context
  - [ ] Improve search relevance
- [ ] **Metadata extraction improvements**
  - [ ] Better document classification
  - [ ] Enhanced tagging system
  - [ ] Version control for documents

#### **Admin Dashboard UX**
- [ ] **Fix clipping issues**
  - [ ] Proper z-index management
  - [ ] Responsive layout fixes
  - [ ] Mobile optimization
- [ ] **Improve resource management**
  - [ ] Better file upload interface
  - [ ] Bulk operations
  - [ ] Search and filtering
- [ ] **Enhanced video management**
  - [ ] Better error handling
  - [ ] Thumbnail generation
  - [ ] Playlist management

### **🟢 LOW PRIORITY (DO LATER)**

#### **Performance Optimization**
- [ ] **Chat response optimization**
  - [ ] Implement response caching
  - [ ] Optimize API calls
  - [ ] Reduce latency to <3s P95
- [ ] **PDF rendering optimization**
  - [ ] Lazy loading
  - [ ] Compression
  - [ ] Reduce render time to <5s
- [ ] **Widget load time**
  - [ ] Minimize JavaScript bundle
  - [ ] Optimize CSS delivery
  - [ ] Implement progressive loading

#### **Feature Enhancements**
- [ ] **Advanced analytics**
  - [ ] User engagement metrics
  - [ ] Conversation quality scoring
  - [ ] Medical accuracy validation
- [ ] **Multi-language support**
  - [ ] Spanish translation
  - [ ] Dynamic language switching
  - [ ] Cultural adaptation
- [ ] **Voice interaction**
  - [ ] Speech-to-text integration
  - [ ] Text-to-speech responses
  - [ ] Voice command support

---

## 🔐 **SECURITY & COMPLIANCE**

### **HIPAA Compliance**
- **Data Minimization**: No PHI unless user opts in
- **Encryption**: TLS in transit, AES-256 at rest
- **Access Control**: RBAC implementation
- **Audit Logging**: All actions logged
- **Retention Policy**: Configurable (default ≤7 days)
- **BAA Agreements**: Required with all vendors

### **Security Measures**
- **Environment Variables**: Secure storage in Vercel
- **API Keys**: Rotated regularly
- **Input Validation**: All user inputs sanitized
- **CORS Configuration**: Proper cross-origin setup
- **Content Security Policy**: XSS protection

### **Privacy Features**
- **Consent Management**: TOS and Privacy Policy acceptance
- **Data Export**: User data portability
- **Deletion Rights**: Complete data removal
- **Anonymization**: De-identified transcripts by default

---

## 📊 **ANALYTICS & MONITORING**

### **Key Performance Indicators**
- **Uptime**: Target ≥99.5% monthly
- **Response Time**: P95 end-to-first-token ≤3s
- **Hallucination Rate**: <2% on curated review set
- **Citation Coverage**: ≥80% answers cite vetted KB
- **User Engagement**: Session duration and completion rates

### **Monitoring Tools**
- **Vercel Analytics**: Deployment and performance metrics
- **HubSpot Analytics**: User engagement and conversion
- **Custom Logging**: Conversation quality and safety triggers
- **Error Tracking**: Application errors and exceptions

### **Reporting**
- **Weekly Reports**: Performance and usage metrics
- **Monthly Reviews**: User feedback and improvement areas
- **Quarterly Assessments**: Feature usage and optimization opportunities

---

## 🛠️ **DEVELOPMENT WORKFLOW**

### **Git Workflow**
```bash
# Feature Development
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create Pull Request on GitHub

# Main Branch Updates
git checkout main
git pull origin main
```

### **Linear Issue Tracking Integration**

**Status**: ✅ **ACTIVE** (Integrated January 2025)

NayaCare uses Linear for issue tracking and project management. Issues are automatically synced to CLAUDE.md for AI visibility.

#### **How It Works**
1. **Create issues in Linear**: Use https://linear.app/nayacare workspace (Team: NAY)
2. **Sync to documentation**: Run `node scripts/linear-integration.cjs sync`
3. **AI reads issues**: CLAUDE.md "LINEAR ISSUES TO IMPLEMENT" section updated automatically
4. **Work on issues**: AI references Linear issues by ID (e.g., "Work on NAY-8")
5. **Mark complete in Linear**: Update issue status in Linear when done

#### **Setup Requirements**
```bash
# Environment Variables (already configured in Railway)
LINEAR_API_KEY=<your-linear-api-key>
LINEAR_TEAM_KEY=NAY

# For local development, add to .env file
echo "LINEAR_API_KEY=your-key-here" >> .env
echo "LINEAR_TEAM_KEY=NAY" >> .env
```

#### **Syncing Issues to CLAUDE.md**
```bash
# Test connection
export LINEAR_API_KEY=lin_api_...
export LINEAR_TEAM_KEY=NAY
node scripts/linear-integration.cjs test

# Sync issues (updates CLAUDE.md automatically)
node scripts/linear-integration.cjs sync

# View issues without syncing
node scripts/linear-integration.cjs fetch
```

#### **Workflow for AI Development**

**CRITICAL: Before starting ANY development work, ALWAYS:**

1. **Read BOTH documentation files thoroughly**:
   ```bash
   # These files MUST be read before making changes:
   - README.md (primary project documentation)
   - CLAUDE.md (AI-specific instructions + Linear issues)
   ```

2. **Sync Linear issues** (if working on Linear tasks):
   ```bash
   node scripts/linear-integration.cjs sync
   ```

3. **Understand the issue completely**:
   - Read the Linear issue description in CLAUDE.md
   - Check acceptance criteria
   - Review technical notes and file locations
   - Identify dependencies

4. **Use TodoWrite to track progress**:
   ```javascript
   // Create todos from Linear issue acceptance criteria
   TodoWrite([
     {content: "Task 1", activeForm: "Doing task 1", status: "in_progress"},
     {content: "Task 2", activeForm: "Doing task 2", status: "pending"}
   ])
   ```

5. **Reference issue in commits**:
   ```bash
   git commit -m "✨ NAY-8: Optimize AI response style

   - Updated system prompt for concise responses
   - Added bullet point formatting
   - Front-loaded critical information

   Closes NAY-8"
   ```

#### **Linear Issue Format in CLAUDE.md**

Issues are synced with the following information:
- **Issue ID**: NAY-XXX (Linear identifier)
- **Title**: Brief description
- **Priority**: 🔴 Urgent, 🟠 High, 🟡 Medium, ⚪ Low
- **Estimate**: Time estimate (hours)
- **Description**: Full issue details with acceptance criteria
- **Labels**: Tags from Linear (e.g., frontend, backend, security)
- **Linear URL**: Direct link to issue

#### **Issue Priority System**

When multiple Linear issues exist, work in this order:
1. **🔴 Urgent** - Critical bugs, security issues, production failures
2. **🟠 High** - Important features, HIPAA compliance, user-impacting issues
3. **🟡 Medium** - Feature enhancements, optimizations, refactoring
4. **⚪ Low** - Nice-to-have features, tech debt, documentation

#### **AI Development Best Practices**

**DO:**
- ✅ Read README.md AND CLAUDE.md before starting work
- ✅ Sync Linear issues before each session (`node scripts/linear-integration.cjs sync`)
- ✅ Use TodoWrite to track acceptance criteria
- ✅ Reference Linear issue ID in commits (e.g., "NAY-8: ...")
- ✅ Mark todos as completed immediately after finishing
- ✅ Update CLAUDE.md if issue details change during implementation
- ✅ Test changes thoroughly before committing

**DON'T:**
- ❌ Start work without reading both documentation files
- ❌ Skip syncing Linear issues (may be outdated)
- ❌ Work on issues without understanding full context
- ❌ Batch todo completions (mark completed immediately)
- ❌ Forget to close Linear issues in commit messages

#### **Example: Working on a Linear Issue**

```bash
# 1. Read documentation
cat README.md | head -200  # Read project overview
cat CLAUDE.md | grep "NAY-" # Find current Linear issues

# 2. Sync latest issues
export LINEAR_API_KEY=lin_api_...
node scripts/linear-integration.cjs sync

# 3. Start work (AI uses TodoWrite internally)
# Work on NAY-8: Optimize AI Response Style

# 4. Commit with Linear reference
git add api/chat.ts
git commit -m "✨ NAY-8: Optimize AI response style

- Updated CONVERSATIONAL STYLE system prompt
- Added concise response guidelines (2-4 sentences)
- Front-loaded critical information
- Added bullet point formatting for lists

Closes NAY-8"

# 5. Push changes
git push origin main
```

#### **Files**
- **Integration Script**: `scripts/linear-integration.cjs`
- **Documentation**: `CLAUDE.md` (auto-updated by sync)
- **Environment**: `.env` (local), Railway dashboard (production)

---

### **Code Standards**
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety where applicable
- **React Best Practices**: Component structure and hooks usage

### **Testing Requirements**
- **Unit Tests**: Critical functions (≥50 red-flag scenarios)
- **Integration Tests**: API endpoints and database operations
- **UI Tests**: Widget functionality and user flows
- **Performance Tests**: Response time and load testing

---

## 🎨 **DESIGN SYSTEM**

### **Color Palette**
```css
/* Primary Colors */
--pink-300: #f9a8d4
--pink-400: #f472b6
--pink-500: #ec4899
--pink-600: #db2777

/* Text Colors */
--text-primary: #ffffff
--text-secondary: #fce7f3
--text-tertiary: #fdf2f8
```

### **Typography**
- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif
- **Font Smoothing**: antialiased, grayscale

### **Component Styling**
- **Border Radius**: 12px (rounded-xl)
- **Shadows**: Multi-layer for depth
- **Animations**: gentle-bounce (3s ease-in-out infinite)
- **Transitions**: 0.3s ease for interactions

---

## 🔄 **INTEGRATION ARCHITECTURE**

### **HubSpot Integration Flow**
1. **Widget Embed**: Site Footer HTML script
2. **User Interaction**: Click widget button
3. **Modal Display**: Full chatbot interface
4. **Session Tracking**: HubSpot contact creation
5. **Conversation Logging**: Real-time data sync
6. **Analytics**: User engagement tracking

### **API Endpoints**
```
POST /api/chat          # Chat interactions
POST /api/admin/upload  # File uploads
GET  /api/resources     # Resource management
POST /api/analytics     # User tracking
```

### **Data Flow**
```
User Input → Chat API → AI Processing → Knowledge Base → Response Generation → HubSpot Logging
```

### **GitHub Actions Integration**

**Setup Status**: ✅ Configured (manual steps required)

**Workflow File**: `.github/workflows/claude.yml`

**Functionality**:
- Triggers on GitHub issues and pull request comments containing `@claude`
- Automated code review and assistance
- Issue triage and resolution
- Documentation updates

**Setup Requirements**:
1. **Install GitHub App**: https://github.com/apps/claude
2. **Add Repository Secret**: `ANTHROPIC_API_KEY` in Settings → Secrets and variables → Actions
3. **Grant Permissions**: Install app for `cmanfre7/nayacare` repository

**Usage**:
- Mention `@claude` in any issue or PR comment
- Claude will respond with code suggestions, bug fixes, or documentation
- Follows project standards defined in `CLAUDE.md`

**Configuration Files**:
- `.github/workflows/claude.yml` - GitHub Actions workflow
- `CLAUDE.md` - Project coding standards and context for AI

---

## 📈 **ROADMAP & FUTURE DEVELOPMENT**

### **Phase 1: Core Integration ✅ COMPLETED (October 4-13, 2025)**
- ✅ Basic chatbot functionality with context awareness
- ✅ Admin dashboard with PDF management
- ✅ PDF processing and knowledge base
- ✅ GitHub Actions integration
- ✅ HubSpot widget integration (embed mode complete)
- ✅ User authentication system (email + PIN)
- ✅ Data persistence (profiles, logs, chat history)
- ✅ Baby profile management with multiple children support

### **Phase 2: User Features & Data Tracking (CURRENT - Next 30 Days)**
- ✅ Growth tracking UI (weight, length, head circumference) - COMPLETED (October 19, 2025)
- ✅ WHO growth chart visualization (Recharts with percentile curves) - COMPLETED (October 20, 2025)
- ✅ Mobile optimization (authentication flow & keyboard fixes) - COMPLETED (October 21, 2025)
- [ ] Feeding pattern analysis and insights
- [ ] Sleep analysis and recommendations
- [ ] Advanced analytics dashboard
- [ ] PDF report generation for pediatrician visits
- [ ] Milestone tracking and reminders

### **Phase 3: Scale & Optimization (NEXT 90 DAYS)**
- [ ] Multi-practitioner support
- [ ] Advanced reporting
- [ ] Integration with EHR systems
- [ ] Machine learning improvements
- [ ] Enterprise features

### **Phase 4: Expansion (NEXT 6 MONTHS)**
- [ ] Additional medical specialties
- [ ] Telehealth integration
- [ ] Insurance billing integration
- [ ] Research data collection
- [ ] International expansion

---

## 🚨 **EMERGENCY PROCEDURES**

### **Critical Issue Response**
1. **Identify Issue**: Check Vercel logs and user reports
2. **Assess Impact**: Determine user and business impact
3. **Implement Fix**: Deploy hotfix if necessary
4. **Monitor**: Watch metrics and user feedback
5. **Document**: Update this guide with lessons learned

### **Rollback Procedures**
```bash
# Emergency rollback to previous deployment
git checkout main
git reset --hard HEAD~1
git push --force origin main
```

### **Contact Information**
- **Primary Developer**: [Your contact information]
- **Dr. Patel**: [Practice contact information]
- **Vercel Support**: support@vercel.com
- **HubSpot Support**: Available via HubSpot portal

---

## 📚 **DOCUMENTATION & RESOURCES**

### **Technical Documentation**
- **README.md**: This file - comprehensive project documentation (SINGLE SOURCE OF TRUTH)
- **CLAUDE.md**: AI coding standards and project context for GitHub Actions
- **AI_INSTRUCTIONS.md**: Critical AI-specific instructions
- **API Documentation**: `/docs/api.md`
- **Component Library**: `/docs/components.md`
- **Deployment Guide**: `/docs/deployment.md`
- **Troubleshooting**: `/docs/troubleshooting.md`

### **External Resources**
- **Anthropic Claude Docs**: https://docs.anthropic.com/
- **HubSpot Developer Docs**: https://developers.hubspot.com/
- **Vercel Documentation**: https://vercel.com/docs
- **React Documentation**: https://react.dev/

### **Training Materials**
- **User Manual**: For Dr. Patel and staff
- **Admin Guide**: Dashboard and content management
- **Technical Guide**: For developers and IT staff
- **Video Tutorials**: Screen recordings of key workflows

---

## 🔍 **TROUBLESHOOTING GUIDE**

### **Common Issues & Solutions**

#### **Widget Not Appearing on HubSpot Site**
**Symptoms**: No widget visible on nayacare.org
**Causes**: 
- Script not added to Site Footer HTML
- JavaScript errors blocking execution
- CSS conflicts with site styles

**Solutions**:
1. Verify script in HubSpot Site Footer HTML
2. Check browser console for errors
3. Test script in isolation
4. Clear browser cache

#### **Chatbot Not Loading in Modal**
**Symptoms**: White background appears instead of chatbot
**Causes**:
- Embed mode not properly implemented
- iframe src pointing to demo page
- Legal modal not bypassed

**Solutions**:
1. Verify `?embed=true` parameter
2. Check App.jsx embed mode logic
3. Test direct embed URL
4. Review modal implementation

#### **Admin Dashboard Access Issues**
**Symptoms**: Ctrl+Shift+A not working
**Causes**:
- Keyboard event listeners not attached
- Admin mode not properly enabled
- Session state issues

**Solutions**:
1. Check keyboard event binding
2. Verify admin mode detection
3. Test in different browsers
4. Review session management

### **Debug Tools**
- **Browser DevTools**: Console, Network, Elements tabs
- **Vercel Logs**: Function execution and errors
- **HubSpot Logs**: API calls and data sync
- **Custom Logging**: Application-specific debugging

---

## 📝 **CHANGE LOG**

### **Most Recent Changes**

#### **Session 12 - Profile Relations & Telehealth Booking (November 23, 2025) - v1.11.0 ✅ COMPLETED**
- **2025-11-23**: ✨ **Profile Relations & Prenatal Support** (v1.11.0):
  - **Relation Support**: Added dropdown for user's relationship to baby (Mother, Father, Other with custom input)
  - **Prenatal Features**: "Baby not born yet" checkbox with expected due date field
  - **Personalized Messages**: Dynamic welcome messages based on relation and pregnancy status
  - **Bug Fix**: Fixed "2916 weeks old" display for unborn babies with getBabyAgeOrPregnancy helper
  - **Header Updates**: Shows "Due in X weeks", "Due today!", or "X days overdue" for expecting parents
- **2025-11-23**: 📅 **Telehealth Booking Placeholder**:
  - **Quick Topics Button**: Added prominent pink "Book Telehealth" button with calendar icon
  - **Visual Design**: Pink gradient (from-pink-500 to-pink-600) with subtle pulse animation
  - **Coming Soon Modal**: Professional placeholder with instructions for interim care
  - **Future-Ready**: Structure ready for Dr. Patel's scheduling integration
- **2025-11-23**: 📝 **Legal Documents Export**:
  - Created LEGAL_DOCUMENTS_FOR_EDITING.txt with formatted TOS and Privacy Policy for review

#### **Session 11 - Post-Auth Consent Modal & Emergency Protocol (November 8, 2025) - v1.10.0 ✅ COMPLETED**
- **2025-11-08**: 🔐 **NAY-9: Post-Authentication Consent Modal** (v1.10.0):
  - **Complete Flow Restructure**: Moved consent modal from pre-auth to post-auth for HIPAA compliance
  - **New Flow**: Email → PIN → Consent Check → Consent Modal (if needed) → Baby Profile → Chat
  - **HubSpot Integration**:
    - Created 5 consent properties in Contacts: `consent_accepted`, `consent_accepted_date`, `consent_version_accepted`, `tos_version_accepted`, `privacy_policy_version_accepted`
    - Built `scripts/add-consent-properties.js` to create schema
    - Fixed boolean property requirements (options array needed)
  - **Backend APIs Created**:
    - `api/consent/status.ts` - checks if user needs consent (new user, version update, or already consented)
    - `api/consent/accept.ts` - records consent with HIPAA audit trail (IP, user agent, timestamp, adds note to timeline)
  - **Critical Bug Fixes**:
    - Fixed "User not authenticated" error for new registrations (register API wasn't returning email)
    - Eliminated UI lag by skipping consent API check for new users (always needs consent)
    - Fixed brief chat flash after PIN entry (reordered state updates)
  - **Performance**: New user flow now instant (zero delay), existing users see brief spinner during API check

- **2025-11-08**: 📊 **Survey Analytics Enhancement**:
  - Added consent tracking to research data CSV export
  - 3 new columns: "Has Consented", "Consent Date", "Consent Version"
  - Backend joins consent data from HubSpot Contacts with survey responses
  - Enables IRB research: correlate consent acceptance with satisfaction ratings

- **2025-11-08**: 🚨 **Emergency Triage Protocol Update**:
  - Changed AI language: "Call Dr. Patel" → "Call your pediatrician (or Dr. Patel if she's your provider)"
  - Updated high fever response: ER first, then call pediatrician (not office call first)
  - New hierarchy: 911 → Emergency Room → Pediatrician notification
  - Added Dr. Patel's phone number to AI knowledge: (720) 815-5922

#### **Session 10 - Chat Timestamp Awareness Fix (October 27, 2025) - v1.9.9 ✅ COMPLETED**
- **2025-10-27**: 🤖 **AI Temporal Awareness Fix** (v1.9.9):
  - Fixed critical issue where AI repeated suggestions from moments ago
  - Added TEMPORAL AWARENESS section to AI system prompt (api/chat.ts:191-193)
  - AI now explicitly instructed: "DO NOT repeat suggestions or advice you gave in recent messages"
  - Last 10-12 messages with timestamps passed to Claude for full conversation context
  - Verified timestamps included in recentMessages array (src/App.jsx:594-598)
  - Result: AI maintains coherent conversation without redundant advice
  - User trust restored - AI no longer appears to have "amnesia"

#### **Session 9 - Chat Analytics, Feature Tracking & Embed Fixes (October 26, 2025) - v1.9.8 ✅ COMPLETED**

#### **Session 9 - Chat Analytics, Feature Tracking & Embed Fixes (October 26, 2025) - v1.9.6-1.9.8**
- **2025-10-26**: 📊 **Chat Analytics Admin Dashboard** (v1.9.6):
  - Created new "Chat Analytics" tab in Admin Dashboard
  - Built `/api/admin/chat-analytics` endpoint to fetch all chatbot users from HubSpot
  - Display scrollable list of patient emails with message counts and baby names
  - Click any email to view formatted chat history (pink bubbles for user, gray for AI)
  - Shows timestamps, baby profile info, and back navigation
  - Quality control feature for Dr. Patel to review conversations easily
  - Fixed endpoint registration in server.js (was returning HTML instead of JSON)

- **2025-10-26**: 📈 **Comprehensive Feature Usage Tracking** (v1.9.7):
  - Added feature usage tracking to correlate survey ratings with actual feature engagement
  - Tracks 8 data points per session:
    - Used Chat (always true for surveys since 2+ messages required)
    - Used Feeding Log, Sleep Log, Diaper Log
    - Used Growth Charts
    - Downloaded Resource (PDF)
    - Visited YouTube Channel
    - Resources Viewed List (specific PDF titles)
  - Frontend tracking in App.jsx using `featureUsageRef` with hooks in all feature interactions
  - Backend API updates to save feature usage as HubSpot boolean/text properties
  - Created HubSpot schema update script (`scripts/add-feature-usage-properties.js`)
  - Fixed boolean values (JavaScript `true/false` → HubSpot string `"true"`/`"false"`)
  - Updated Survey Analytics CSV export to include 8 feature usage columns
  - IRB research value: correlate satisfaction scores with feature engagement patterns

- **2025-10-26**: 🔗 **Embed Mode Download Fixes** (v1.9.8):
  - Fixed PDF downloads not working in embed widget on nayacare.org
  - Fixed CSV exports not working in embed widget on nayacare.org
  - Root cause: Browser security blocks `window.open()` and blob downloads in iframes
  - Solution: Use `postMessage` to communicate with parent window
  - Updated resource downloads to detect iframe mode and send OPEN_PDF message
  - Updated CSV export to detect iframe mode and send DOWNLOAD_CSV message
  - Enhanced `public/embed.js` with message handlers for PDF and CSV
  - Both features now work on direct Railway link AND embedded widget

- **2025-10-26**: 🐛 **CRITICAL FIX: Mobile Keyboard Closing Issue** (v1.9.5):
  - Fixed keyboard closing after EVERY keystroke on iPhone/Android
  - Root cause identified: `autoCorrect="on"` and `autoCapitalize="sentences"` causing keyboard interference
  - Changed `autoCorrect` from "on" to "off"
  - Changed `autoCapitalize` from "sentences" to "off"
  - Added `spellCheck="false"` for additional stability
  - Chatbot now fully usable on mobile devices
  - Previous attempts in Session 6 and 7 didn't disable autocorrect (this is the definitive fix)

- **2025-10-26**: 📚 **Documentation Updates** - Updated PROJECT_HOURS.md, README.md, CLAUDE.md

#### **Session 8 - Insights Dashboard & Critical Fixes (October 22, 2025) - v1.9.4**
- **2025-10-22**: 📊 **Insights Dashboard Complete** - Created comprehensive data visualization:
  - Hero cards showing today's stats (feedings, sleep hours, wet/dirty diapers)
  - 7-day trends chart (area chart with feeding, sleep, diaper patterns)
  - Pattern recognition (peak feeding time, longest sleep stretch)
  - Age-appropriate insights (expected ranges adjust by baby's age: 0-4, 4-12, 12+ weeks)
  - Status indicators (green checkmark = good, yellow = low, red = concerning)
- **2025-10-22**: 🍼 **Diaper Logging Added** - Wet, dirty, and both buttons with color-coding
- **2025-10-22**: ✨ **UX Overhaul** - Unified Quick Log box with visual feedback:
  - All logging buttons in one gradient box with section headers
  - "Logged!" confirmation (2-second animation with checkmark, color change, scale effect)
  - Data & Insights moved to top of Log tab
  - Recent Activity compacted into scrollable box (max-height 96)
- **2025-10-22**: 🐛 **Critical Bug Fixes**:
  - Fixed "NaN:00 - NaN:00" feeding pattern (added `timestamp` field to feeding logs)
  - Added Sleep Duration Modal (hours 0-24, minutes dropdown 0/15/30/45)
  - Fixed sleep modal button not working (scope issue - moved function to main component)
  - Fixed diaper logs not persisting (added diaperLogs loading on authentication)
- **2025-10-22**: 💾 **Data Persistence Verified** - All logs save to HubSpot and load on login

#### **Session 7 - AI Model, Knowledge Base & Growth Charts (October 22, 2025) - v1.9.3**
- **2025-10-22**: 📊 **Growth Charts UI Overhaul (Part 1)** - Completed 8 of 11 improvements:
  - Changed legend from "%ile" to "Percentile" for better readability
  - Color-matched tabs (pink=weight, blue=length, purple=head circ)
  - Data points dynamically match measurement type colors
  - Removed redundant Developmental Milestones sidebar
  - Expanded chart to full width for better viewing
  - Removed Growth Tips and Additional Resources sections
  - Fixed age calculation (shows baby's age at measurement time, not "how long ago")
  - Added missing Brain icon import
- **2025-10-22**: 🔄 **Growth Charts Remaining (Next Session Priority)**:
  - Group measurements by entry time (require all 3 together)
  - Group Recent Measurements display
  - Add historical chart view (clickable past measurements)
  - Verify percentile calculation
- **2025-10-22**: ⚡ **AI Model Decision** - Tried Haiku 4.5, but switched back to Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **2025-10-22**: ⚡ **Why Sonnet?** - Haiku refused to cite Dr. Patel's PDFs even when logs showed they were loading (14,771 chars)
- **2025-10-22**: ⚡ Medical accuracy prioritized over speed (5-10s vs 1-3s response time)
- **2025-10-22**: ⚡ Extended typing indicator from 3s to 12s to mask Sonnet's response time
- **2025-10-22**: 📚 **Enhanced Knowledge Base System** - Expanded from breastfeeding-only to ALL medical topics
- **2025-10-22**: 📚 Added 50+ medical keywords (sleep, feeding, jaundice, development, postpartum, etc.)
- **2025-10-22**: 📚 Increased context from 3 to 6 PDF snippets (5000 chars each = ~30K total)
- **2025-10-22**: 🎯 **Smart Document Filtering** - Relevance scoring ensures AI gets the RIGHT PDFs:
  - Category match (sleep/breastfeed/postpartum): +100 points
  - Title match (safe sleep/peripartum): +150 points
  - Generic keyword match: +50 points
  - Top 6 most relevant documents sent to AI (sorted by score)
  - Example: "safe sleep" query → Safe Sleep PDF scores 250 points, breastfeeding PDFs score 0
- **2025-10-22**: 🎯 **Explicit PDF-First Priority System** - 6-step hierarchy in AI prompts
- **2025-10-22**: 🎯 Required source citations: AI now naturally references which guide it's using
- **2025-10-22**: 🎯 Fallback transparency: AI explicitly states when using external sources vs Dr. Patel's PDFs
- **2025-10-22**: 🎯 **Major Breakthrough**: AI now confidently cites the correct Dr. Patel guides for each query
- **2025-10-22**: 🐛 **Mobile Keyboard Fix (REAL FIX)** - Added `isUserTypingRef` to prevent auto-scroll during typing
- **2025-10-22**: 🐛 Fixed keyboard closing after each keystroke on mobile devices
- **2025-10-22**: 🐛 Fixed viewport shifts and unwanted scrolling while typing

### **Previous Changes (Sessions 4-6 - October 19-21, 2025)**

#### **Session 6 - Mobile Optimization (October 21, 2025) - v1.8.0**
- **2025-10-21**: ✅ **CRITICAL FIX: Mobile Authentication Flow** - Mobile now requires email/PIN auth (was skipping straight to chat)
- **2025-10-21**: ✅ **CRITICAL FIX: Mobile Keyboard Issue** - Keyboard no longer closes after each keystroke on iOS/Android
- **2025-10-21**: ✅ Added MobileModal authentication flow (AuthModal, ProfileManager, ProfileSetup)
- **2025-10-21**: ✅ Added chatInputRef with focus management for mobile keyboards
- **2025-10-21**: ✅ Implemented onTouchStart handler to maintain input focus
- **2025-10-21**: ✅ Changed onKeyPress to onKeyDown for better mobile support
- **2025-10-21**: ✅ Added mobile-friendly input attributes (inputMode, autoCorrect, autoCapitalize)
- **2025-10-21**: ✅ Fixed HIPAA compliance on mobile (authentication now required)
- **2025-10-21**: 🐛 Fixed PDF upload corruption using native HTTPS module with FormData streams

#### **Session 5 - Growth Charts Enhancement (October 20, 2025)**
- **2025-10-20**: ✅ **Interactive WHO Growth Charts** - Recharts integration with 7 percentile curves (P3-P97)
- **2025-10-20**: ✅ Baby's measurements plotted as pink line with dots on growth curves
- **2025-10-20**: ✅ Interactive tooltips showing age, measurement value, and percentile
- **2025-10-20**: ✅ Automatic percentile calculation for baby's measurements
- **2025-10-20**: ✅ **Unit Conversion** - Changed weight from kg to lbs for US patients
- **2025-10-20**: ✅ Updated WHO weight data from kg to lbs (P3: 6.6 lbs to P97: 21.2 lbs at 12 weeks)
- **2025-10-20**: ✅ Updated validation ranges (weight: 2-33 lbs instead of 1-15 kg)
- **2025-10-20**: 🐛 Fixed white screen crash in Development tab with comprehensive error handling
- **2025-10-20**: ✅ Added safe array handling and null checks for growth logs
- **2025-10-20**: ✅ Added error boundary UI with refresh button

#### **Session 4 - Growth Tracking UI (October 19, 2025)**
- **2025-10-19**: ✅ **Growth Tracking UI Complete** - Full measurement input and history display
- **2025-10-19**: ✅ Created GrowthMeasurementModal component (weight, length, head circumference)
- **2025-10-19**: ✅ Added "Track Growth" button to Development tab
- **2025-10-19**: ✅ Implemented save functionality to HubSpot (weightLogs, lengthLogs, headCircLogs)
- **2025-10-19**: ✅ Display measurement history in chronological list (last 5 per type)
- **2025-10-19**: ✅ Color-coded UI (pink/blue/purple for different measurements)
- **2025-10-19**: ✅ Date/time picker for historical measurements
- **2025-10-19**: ✅ Measurement validation and error handling
- **2025-10-19**: ✅ Load growth logs on login, clear on logout
- **2025-10-19**: ✅ Filter measurements by active baby profile

### **Previous Changes (Session 3 - October 14, 2025)**
- **2025-10-14**: ✅ Migrated from Vercel to Railway.app to bypass 4.5MB body size limit
- **2025-10-14**: ✅ Created Express server (`server.js`) to bridge Vercel-style serverless functions
- **2025-10-14**: ✅ Added `tsx` runtime for TypeScript execution in Node.js
- **2025-10-14**: ✅ Updated file size limits from 4MB to 100MB throughout codebase
- **2025-10-14**: ✅ Successfully tested 10.4MB PDF upload (Safe Sleep for Your Baby)
- **2025-10-14**: ✅ Updated all documentation with Railway deployment info
- **2025-10-14**: 🐛 Fixed Railway `startCommand` to use `npm start` instead of `node server.js`
- **2025-10-14**: 🐛 Fixed TypeScript import issues by pre-loading API handlers at server startup
- **2025-10-14**: ✅ **OCR Implementation Complete** - pdf2pic + Tesseract.js for scanned PDFs
- **2025-10-14**: ✅ Fixed HubSpot property `text_content` configuration (formField: true)
- **2025-10-14**: ✅ Added auth endpoints to server.js (login, register, check-email, update-profile)
- **2025-10-14**: ✅ Created diagnostic tools (`/api/admin/diagnostic`, `/api/admin/fix-hubspot-schema`)
- **2025-10-14**: ✅ Verified AI can access and quote PDF content in responses
- **2025-10-14**: 🐛 Fixed authentication 404 errors after Railway migration
- **2025-10-14**: 📚 Updated README.md, CLAUDE.md, PROJECT_HOURS.md with complete session documentation

### **Previous Changes (Session 2 - October 13, 2025)**
- **2025-10-13**: ✅ Email + PIN authentication system fully implemented
- **2025-10-13**: ✅ HubSpot Custom Object `chatbot_users` created with all properties
- **2025-10-13**: ✅ Baby profile persistence and Profile Manager modal
- **2025-10-13**: ✅ Feeding & sleep log persistence (fixed HubSpot caching issue)
- **2025-10-13**: ✅ Chat history persistence across sessions
- **2025-10-13**: ✅ Fixed age calculation in Development tab (now shows correct age)
- **2025-10-13**: ✅ Growth tracking API foundation (properties + endpoints ready)
- **2025-10-13**: ✅ AI context awareness fix (chatbot now knows baby's age and name)
- **2025-10-13**: ✅ SHA-256 PIN hashing with account lockout security
- **2025-10-13**: ✅ Multiple baby profiles per user account support
- **2025-10-13**: 🐛 Fixed HubSpot API returning stale data (switched to direct GET)
- **2025-10-13**: 🐛 Fixed property name mismatch (recreated with correct names)
- **2025-10-13**: 🐛 Fixed missing API scopes for sensitive data
- **2025-10-13**: 📚 Comprehensive Session 2 documentation added to README

### **Previous Changes (October 4-7, 2025)**
- **2025-10-07**: ✅ Completed PDF admin dashboard UI and processing logic
- **2025-10-07**: ✅ Created 8 organized folders in AI Intellect Pool
- **2025-10-07**: ✅ Implemented real PDF text extraction with pdf-parse
- **2025-10-07**: ✅ Added smart text chunking (paragraph/sentence aware)
- **2025-10-07**: ✅ Enhanced admin dashboard with detailed document cards
- **2025-10-07**: ✅ Consolidated documentation into README.md
- **2025-10-06**: ✅ Fixed HubSpot widget button styling issues
- **2025-10-06**: ✅ Implemented message passing system for embed mode
- **2025-10-06**: ✅ Fixed pregnant woman silhouette visibility and positioning

### **Version History**
- **v1.0.0**: Initial chatbot implementation
- **v1.1.0**: Admin dashboard addition
- **v1.2.0**: PDF processing integration (basic)
- **v1.3.0**: HubSpot API integration
- **v1.4.0**: Widget embed implementation ✅
- **v1.4.1**: GitHub Actions integration for Claude AI ✅
- **v1.4.2**: Widget styling fixes and embed mode improvements ✅
- **v1.5.0**: PDF admin dashboard UI ✅
- **v1.6.0**: HubSpot File Manager integration ✅
- **v1.7.0**: User Authentication & Data Persistence ✅ COMPLETED (October 13, 2025)
- **v1.7.1**: Railway Migration & 100MB Upload Support ✅ COMPLETED (October 14, 2025)
- **v1.7.2**: OCR Implementation & Text Extraction ✅ COMPLETED (October 14, 2025)
- **v1.8.0**: Mobile Optimization & Growth Tracking Complete ✅ COMPLETED (October 21, 2025)
- **v1.9.0**: Knowledge Base Enhancement (Haiku 4.5 trial) ✅ COMPLETED (October 22, 2025)
- **v1.9.1**: AI Model Decision (Back to Sonnet 4.5 for medical accuracy) ✅ COMPLETED (October 22, 2025)
- **v1.9.2**: Smart Document Filtering (Relevance scoring for PDF matching) ✅ COMPLETED (October 22, 2025)
- **v1.9.3**: Growth Charts UI Overhaul (Part 1 - 8 of 11 improvements) ✅ COMPLETED (October 22, 2025)
- **v1.9.4**: Insights Dashboard & Critical Fixes (Diaper logging, UX overhaul) ✅ COMPLETED (October 22, 2025)
- **v1.9.5**: Mobile Keyboard Fix (autocorrect/autocapitalize disabled) ✅ COMPLETED (October 26, 2025)
- **v1.9.6**: Chat Analytics Admin Dashboard (Patient conversation review tool) ✅ COMPLETED (October 26, 2025)
- **v1.9.7**: Feature Usage Tracking (Correlate surveys with engagement) ✅ COMPLETED (October 26, 2025)
- **v1.9.8**: Embed Mode Download Fixes (PDF/CSV downloads in iframe) ✅ COMPLETED (October 26, 2025)
- **v1.9.9**: Chat Timestamp Awareness Fix (AI temporal context) ✅ COMPLETED (October 27, 2025)
- **v1.10.0**: Post-Auth Consent Modal (HIPAA compliance) ✅ COMPLETED (November 8, 2025)
- **v1.11.0**: Profile Relations & Telehealth Booking ✅ COMPLETED (November 23, 2025)

---

## 🎯 **SUCCESS METRICS**

### **Technical Success**
- ✅ Application deployed and accessible (Railway.app)
- ✅ Chatbot responds to queries with context awareness
- ✅ Admin dashboard functional
- ✅ GitHub Actions integration configured
- ✅ Widget integration working (embed mode complete)
- ✅ User authentication system fully operational
- ✅ Data persistence across sessions (profiles, logs, chat history)
- ✅ HubSpot Custom Objects integration complete
- ✅ PDF processing with OCR (pdf2pic + Tesseract.js)
- ✅ Text extraction from scanned PDFs (91.8% OCR confidence)
- ✅ AI knowledge retrieval verified (chatbot quotes PDF content)
- ✅ Growth tracking UI (weight, length, head circumference input and history)
- 🔄 HubSpot analytics active

### **Business Success**
- 📊 User engagement metrics
- 📊 Conversation quality scores
- 📊 Medical accuracy validation
- 📊 User satisfaction ratings
- 📊 Practice efficiency improvements

### **Compliance Success**
- ✅ HIPAA requirements met
- ✅ Data security implemented
- ✅ Audit logging active
- ✅ Consent management working
- ✅ Privacy controls functional

---

## 📞 **SUPPORT & MAINTENANCE**

### **Regular Maintenance Tasks**
- **Daily**: Monitor application health and user feedback
- **Weekly**: Review analytics and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Comprehensive security audit and compliance review

### **Backup Procedures**
- **Code**: GitHub repository (automatic)
- **Database**: HubSpot data (automatic)
- **Files**: Vercel deployment (automatic)
- **Configuration**: Environment variables (manual backup)

### **Update Procedures**
1. **Development**: Test changes in development environment
2. **Staging**: Deploy to staging for testing
3. **Production**: Deploy to production with monitoring
4. **Verification**: Confirm all systems operational
5. **Documentation**: Update this guide with changes

---

## 👩‍⚕️ **DR. PATEL'S USER GUIDE**

### **🔑 Accessing the Admin Dashboard**

**Keyboard Shortcut**: Press `Ctrl` + `Shift` + `A` while on the chatbot page

This opens the Admin Dashboard with three tabs:
- **Knowledge Base** - Upload and manage PDFs
- **Patient Resources** - Downloadable resources for parents
- **Educational Videos** - Video library management

---

### **📤 Uploading PDFs to Knowledge Base**

#### **Step 1: Select a Category**

Choose from the dropdown menu:
- 🤱 **Breastfeeding** - Lactation support, latch techniques, supply management
- 👶 **Newborn Care** - General newborn care, bathing, umbilical cord care
- 💝 **Postpartum Recovery** - Mother's recovery, healing, postpartum depression
- 😴 **Sleep Guidance** - Safe sleep practices, sleep training, SIDS prevention
- 🍼 **Feeding & Nutrition** - Formula feeding, solid foods, nutrition guidelines
- 📈 **Development** - Milestones, developmental delays, growth tracking
- 🚨 **Safety & Emergency** - Emergency procedures, red flags, when to call 911
- 📚 **Other Resources** - Miscellaneous documents

#### **Step 2: Upload Your PDF**

**Option A: Drag & Drop**
1. Select category from dropdown
2. Drag PDF file(s) into upload area
3. Drop when area highlights

**Option B: Browse Files**
1. Select category from dropdown
2. Click "Browse Files" button
3. Select PDF files from computer
4. Click "Open"

#### **Step 3: Automatic Processing**

The system automatically:
- ✅ Extracts all text from PDF
- ✅ Breaks into digestible "chunks" for AI
- ✅ Saves PDF to correct `AI Intellect Pool` folder
- ✅ Makes knowledge immediately available to chatbot

---

### **📋 Viewing Uploaded Documents**

#### **Document Cards Show**:
- 📄 **File Name** - Original PDF filename
- 📝 **Description** - Auto-generated from first sentences
- 📊 **Stats**: Pages, chunks, file size
- 📅 **Upload Date** - When document was added
- 🏷️ **Category Badge** - Which category it belongs to
- ✅ **Status** - Green dot = Active and available

#### **Filter by Category**:
- Click **All Documents** to see everything
- Click specific category to filter (🤱 Breastfeeding, 👶 Newborn Care, etc.)

#### **Summary Statistics**:
- **Total Documents** - How many PDFs uploaded
- **Total Pages** - Combined page count
- **Total Chunks** - Knowledge pieces AI can reference
- **In This Category** - Count for filtered category

---

### **🗑️ Deleting Documents**

1. Find the document card
2. Click trash icon (🗑️) in top-right corner
3. Confirm deletion

**Note**: Deleted documents are removed from AI's knowledge immediately.

---

### **🧠 How the AI Uses Your PDFs**

When a parent asks a question:
1. **Query Detection** - AI identifies topic
2. **Knowledge Retrieval** - Searches your uploaded PDFs
3. **Smart Response** - Combines PDF knowledge with training
4. **Source Priority** - Your PDFs prioritized at **90%**

**Example**: Parent asks "My baby isn't latching properly. What should I try?"
- AI detects breastfeeding question
- Searches "Breastfeeding" category PDFs
- Finds relevant chunks about latch techniques
- Provides answer based on YOUR vetted content

---

### **✅ Best Practices**

#### **1. Use Clear File Names**
- ✅ Good: `Breastfeeding-Latch-Techniques-2024.pdf`
- ❌ Avoid: `Document1.pdf` or `Untitled.pdf`

#### **2. Choose the Right Category**
- Select most specific category
- If PDF covers multiple topics, choose primary focus
- Use "Other Resources" only for miscellaneous content

#### **3. Keep Documents Updated**
- Delete outdated versions before uploading new ones
- Use version numbers or dates in file names

#### **4. Regular Audits**
- Periodically review uploaded documents
- Remove outdated/irrelevant content
- Check summary stats to understand knowledge base size

#### **5. File Size Management**
- Maximum: **25MB per PDF**
- If too large, split into topic-specific documents
- Smaller, focused documents work better for AI retrieval

---

### **🚨 Troubleshooting**

**"PDF processing failed"**
- Check file size (under 25MB)
- Verify format (only PDF supported)
- Try re-uploading

**"No documents showing"**
- Refresh page (F5)
- Check category filter ("All Documents")
- Verify upload success message

**"AI isn't using my PDFs"**
- Verify documents appear in dashboard
- Ensure PDF content matches question topic
- Currently optimized for breastfeeding queries (more topics coming)

---

### **📁 File Storage Location**

PDFs are organized in `AI Intellect Pool/` folder:
```
AI Intellect Pool/
├── Breastfeeding/
├── Newborn Care/
├── Postpartum Recovery/
├── Sleep Guidance/
├── Feeding & Nutrition/
├── Development/
├── Safety & Emergency/
└── Other Resources/
```

You can access these folders directly to:
- Review uploaded content
- Manually add PDFs
- Create backups

---

## 🏁 **CONCLUSION**

This comprehensive guide serves as the single source of truth for the NayaCare project. It contains all critical information needed for development, deployment, maintenance, and troubleshooting. Regular updates to this document ensure it remains current and useful for all team members and stakeholders.

**Remember**: This project has the potential to revolutionize healthcare and medicine by providing 24/7 educational support to new parents. Every detail matters, and quality should never be compromised for speed.

---

---

## 🎉 **SESSION 2 COMPLETED - USER AUTHENTICATION & DATA PERSISTENCE (2025-10-13)**

### **✅ Major Accomplishments**

#### **1. Email + PIN Authentication System - COMPLETED**
**Status**: ✅ **FULLY IMPLEMENTED & WORKING**

**What Was Built:**
- ✅ Complete user authentication flow (email + 4-digit PIN)
- ✅ HubSpot Custom Object `chatbot_users` (separate from Dr. Patel's contacts)
- ✅ SHA-256 PIN hashing for security
- ✅ Account lockout (3 failed attempts = 15-minute lockout)
- ✅ Profile Manager modal showing existing baby profiles
- ✅ "Add Another Profile" functionality for multiple children
- ✅ Session persistence across page refreshes

**API Endpoints Created:**
- `/api/auth/check-email.ts` - Check if email exists
- `/api/auth/register.ts` - Create new user account
- `/api/auth/login.ts` - Verify PIN and return user data
- `/api/user/update-profile.ts` - Update user data (profiles, logs, measurements)

**HubSpot Custom Object Properties:**
- `email` (Unique identifier)
- `pin_hash` (SHA-256 hashed PIN)
- `baby_profiles` (JSON array of baby profiles)
- `chat_history` (JSON array of messages)
- `feeding_logs` (JSON array of feeding timestamps)
- `sleep_logs` (JSON array of sleep timestamps)
- `weight_logs` (JSON array of weight measurements) - NEW!
- `length_logs` (JSON array of length measurements) - NEW!
- `head_circ_logs` (JSON array of head circumference) - NEW!
- `failed_login_attempts` (Lockout tracking)
- `lockout_until` (Timestamp)
- `created_at` (Registration timestamp)
- `last_login` (Last login timestamp)

**User Flow:**
1. User enters email → System checks if account exists
2. If new → Enter 4-digit PIN to create account
3. If existing → Enter PIN to login
4. After login → Profile Manager shows all saved baby profiles
5. Select profile to continue OR add another child
6. All data persists between sessions

**Security Features:**
- PIN hashing (SHA-256)
- Account lockout after 3 failed attempts
- 15-minute lockout period
- Attempts counter resets on successful login
- User-specific data isolation

#### **2. Feeding & Sleep Logs Persistence - COMPLETED**
**Status**: ✅ **FULLY WORKING**

**What Was Fixed:**
- ✅ Logs now save to HubSpot immediately when clicked
- ✅ Logs load automatically on login
- ✅ Persist across sessions and page refreshes
- ✅ Tied to specific baby profiles (babyId tracking)
- ✅ Fixed HubSpot API caching issue by using direct GET endpoint

**Technical Solution:**
- Changed from HubSpot Search API (cached) to direct GET endpoint (fresh data)
- Added automatic save to HubSpot after each log entry
- Load logs from HubSpot on login and populate UI

**User Experience:**
- Click "Log Feeding" → Immediately saved to HubSpot
- Click "Log Sleep" → Immediately saved to HubSpot
- Refresh page → Login → See all previous logs
- Recent Activity section displays logs with timestamps

#### **3. Chat History Persistence - COMPLETED**
**Status**: ✅ **FULLY WORKING**

**What Was Built:**
- ✅ Chat history saves after every message
- ✅ Loads automatically on login
- ✅ User-specific (tied to email + PIN, not baby profile)
- ✅ Preserves conversation context across sessions

**Architecture:**
- Chat history is USER-SPECIFIC (email/PIN)
- Baby profiles are USER-SPECIFIC
- Feeding/sleep logs are BABY-SPECIFIC (filtered by active baby)

#### **4. Baby Profile Persistence - COMPLETED**
**Status**: ✅ **FULLY WORKING**

**What Was Built:**
- ✅ Baby profiles save to HubSpot on creation
- ✅ Load automatically on login
- ✅ Profile Manager modal displays all saved profiles
- ✅ Select which baby profile to use for session
- ✅ Add multiple children to one account

**User Flow:**
1. Create first baby profile → Saved to HubSpot
2. Close app and reopen → Login
3. Profile Manager shows saved profile(s)
4. Click profile to select OR add another child
5. Never need to re-enter baby information

#### **5. Age Calculation Fix - COMPLETED**
**Status**: ✅ **FIXED**

**What Was Fixed:**
- ✅ Development tab now shows correct baby age
- ✅ Age-specific milestones display properly
- ✅ Timeline calculations accurate (e.g., "2 weeks 6 days old")
- ✅ All age-dependent content uses real birthdate

**Before:** Showed "0 days old"
**After:** Shows "2 weeks 6 days old" (calculated from birthDate)

#### **6. Growth Tracking Foundation - IN PROGRESS**
**Status**: 🟡 **API READY, UI PENDING**

**What Was Completed:**
- ✅ HubSpot properties created (`weight_logs`, `length_logs`, `head_circ_logs`)
- ✅ API endpoints updated to save/load growth measurements
- ✅ Register endpoint initializes growth logs as empty arrays
- ✅ Login endpoint fetches and returns growth measurements
- ✅ Update-profile endpoint accepts growth data

**What Was Completed (Sessions 4-5 - October 19-20, 2025):**
- ✅ Input UI for entering weight/length/head circumference
- ✅ GrowthMeasurementModal component with validation
- ✅ Profile-specific growth tracking (filtered by babyId)
- ✅ Date/time picker for historical measurements
- ✅ Measurement history view (last 5 per type, chronologically sorted)
- ✅ Color-coded display (pink/blue/purple)
- ✅ Integration with HubSpot save/load functionality
- ✅ Interactive WHO growth charts with Recharts library
- ✅ 7 WHO percentile curves plotted (P3, P10, P25, P50, P75, P90, P97)
- ✅ Baby's measurements plotted as pink line with dots
- ✅ Interactive tooltips showing age, value, and percentile
- ✅ Automatic percentile calculation
- ✅ Unit conversion (weight from kg to lbs for US patients)

**What Was Completed (Session 6 - October 21, 2025):**
- ✅ Mobile authentication flow (email/PIN required on mobile)
- ✅ Mobile keyboard issue fixed (no longer closes after each keystroke)
- ✅ Focus management with chatInputRef and touch handlers
- ✅ HIPAA compliance on mobile devices

**What Remains:**
- 🔄 Gender-specific WHO curves (currently using male data for all babies)
- 🔄 Export growth charts as PDF for pediatrician visits
- 🔄 Advanced analytics and growth pattern insights

**Technical Architecture:**
```javascript
// Growth measurement structure
{
  id: timestamp,
  value: number,          // Weight in kg, length/head circ in cm
  date: ISO timestamp,
  babyId: profileId,     // Tied to specific baby
  type: 'weight' | 'length' | 'headCirc'
}
```

**WHO Standards Integration:**
- Growth charts component has WHO percentile data (P3, P10, P25, P50, P75, P90, P97)
- Data for 0-6 months (male and female)
- Ready for plotting user measurements against standards

### **🐛 Bugs Fixed**

1. **HubSpot API Caching Issue**
   - Problem: Search API returned stale/cached data
   - Solution: Switched to direct GET endpoint for fresh data
   - Impact: Logs now load correctly on login

2. **Property Name Mismatch**
   - Problem: Properties created with capital letters (Failed_Login_Attempts)
   - Solution: Recreated with correct lowercase names (failed_login_attempts)
   - Impact: Authentication lockout working correctly

3. **Missing API Scopes**
   - Problem: HubSpot denied write access to sensitive properties
   - Solution: Added required scopes to Private App
   - Impact: All data now saves successfully

4. **Baby Age Showing 0 Days**
   - Problem: Development tab used non-existent `ageInDays` property
   - Solution: Calculate age from birthDate using calculateBabyAge()
   - Impact: Age-specific content now accurate

5. **Growth Tracking Removed from Data & Insights**
   - Problem: Mentioned in wrong tab
   - Solution: Moved to Development tab where growth charts live
   - Impact: Cleaner UI organization

### **📊 Project Hours Update**

**Previous Total:** [Insert previous hours]
**Today's Session (2025-10-13):** 12 hours
**New Total:** [Previous + 12 hours]

**Breakdown:**
- User authentication system: 4 hours
- Data persistence implementation: 3 hours
- Bug fixes and debugging: 2 hours
- Growth tracking foundation: 2 hours
- Testing and verification: 1 hour

### **🔜 Next Session - Growth Tracking UI**

**Priority 1: Growth Measurement Input System**

**Tasks:**
1. Create input modal for weight/length/head circumference
2. Add date picker for historical measurements
3. Implement save functionality to HubSpot
4. Display measurement history in chronological list

**Components to Build:**
- `GrowthMeasurementModal.jsx` - Input form with 3 fields
- Date/time picker for measurement timestamp
- Validation (reasonable ranges, required fields)
- Success/error feedback

**Priority 2: WHO Growth Chart Visualization**

**Tasks:**
1. Integrate charting library (Recharts or Chart.js)
2. Plot WHO percentile curves (P3-P97)
3. Overlay user measurements on chart
4. Add gender selection (male/female WHO standards differ)
5. Interactive tooltips showing percentile on hover

**Components to Build:**
- `WHOGrowthChart.jsx` - Chart component
- Gender selector
- Measurement type tabs (weight/length/head circ)
- Legend and axis labels

**Priority 3: Profile-Specific Tracking**

**Tasks:**
1. Filter growth measurements by active baby profile
2. Display measurements in Development tab
3. Add "Track Growth" button to initiate input
4. Show latest measurement summary card

**UI Enhancements:**
- Latest measurement summary: "Last measured: [date] - [value]"
- Quick comparison: "At 50th percentile for age"
- Growth trend indicator: "↗ Growing well"

**Estimated Completion:** 3-4 hours of development

### **🎯 Current System Status**

**✅ Fully Working:**
- User authentication (email + PIN)
- Baby profile creation and management
- Feeding log persistence
- Sleep log persistence
- Chat history persistence
- Profile Manager modal
- Age calculations
- Session management across page refreshes

**✅ Growth Tracking:**
- ✅ API complete (HubSpot properties + endpoints)
- ✅ UI complete (input modal + measurement history)
- ✅ Chart visualization complete (WHO percentile curves with Recharts)
- ✅ Interactive tooltips and percentile calculations
- ✅ Baby's measurements plotted against WHO standards

**📝 Architecture Notes:**

**Data Hierarchy:**
```
User (email + PIN)
├── Baby Profiles (array)
│   ├── Profile 1 (name, DOB, etc.)
│   ├── Profile 2
│   └── ...
├── Chat History (user-specific)
├── Feeding Logs (baby-specific, filtered by babyId)
├── Sleep Logs (baby-specific, filtered by babyId)
├── Weight Logs (baby-specific, filtered by babyId)
├── Length Logs (baby-specific, filtered by babyId)
└── Head Circ Logs (baby-specific, filtered by babyId)
```

**Key Design Decisions:**
- Chat history is USER-level (same conversation across all babies)
- All logs are BABY-level (each baby has independent tracking)
- Authentication is USER-level (one account, multiple babies)

---

*Last Updated: October 21, 2025 (End of Session 6)*
*Version: 1.8.0 (Mobile Optimization & Growth Tracking Complete)*
*Status: Production-Ready, Fully Mobile-Optimized*

---

## 🎉 **SESSION 3 COMPLETED - RAILWAY MIGRATION & OCR IMPLEMENTATION (2025-10-14)**

### **✅ Major Accomplishments**

#### **1. Railway Migration - COMPLETED**
**Status**: ✅ **FULLY MIGRATED FROM VERCEL**

**Why We Migrated:**
- ❌ Vercel Hobby plan has hard 4.5MB body size limit (HTTP 413 error)
- ❌ Cannot be configured even on Vercel Pro plan without upgrade
- ❌ Prevented uploading medical PDFs larger than 4.5MB
- ❌ More expensive ($20/month Pro vs $5/month Railway Hobby)

**What Was Migrated:**
- ✅ Express server architecture (`server.js`) replaces Vercel serverless
- ✅ All API endpoints adapted to work with Express middleware
- ✅ TypeScript handlers pre-loaded at startup using `tsx` runtime
- ✅ Static file serving from `dist/` folder
- ✅ Railway deployment via `railway.toml` configuration
- ✅ Environment variables migrated to Railway dashboard
- ✅ Updated file size limits from 4.5MB to 100MB throughout codebase

**Migration Results:**
- ✅ Successfully tested 10.4MB PDF upload ("Safe Sleep for Your Baby")
- ✅ Authentication system working correctly
- ✅ All features operational on Railway
- ✅ Cost reduced from potential $20/month to $5/month
- ✅ Production URL: `https://nayacare.up.railway.app`

**Technical Details:**
```javascript
// server.js architecture
const express = require('express');
const app = express();

// Pre-load TypeScript handlers at startup
const uploadPdfHandler = await import('./api/admin/upload-pdf.ts');
const chatHandler = await import('./api/chat.ts');
// ... other handlers

// Wrapper function for Vercel-style handlers
function wrapHandler(handler) {
  return (req, res) => {
    handler.default(req, res);
  };
}

// Mount endpoints
app.post('/api/admin/upload-pdf', wrapHandler(uploadPdfHandler));
app.post('/api/chat', wrapHandler(chatHandler));
```

**Dependencies Added:**
- `tsx` - TypeScript execution in Node.js
- `express` - Web server framework
- System packages via `nixpacks.toml`: Tesseract, GraphicsMagick, Ghostscript

#### **2. OCR Implementation - COMPLETED**
**Status**: ✅ **FULLY WORKING END-TO-END**

**Problem Solved:**
Many medical PDFs from Dr. Patel are scanned documents with text as images. Standard PDF text extraction returns empty strings, making the AI unable to access the content.

**Solution Implemented:**
- ✅ **pdf2pic + Tesseract.js** for OCR processing
- ✅ Hybrid approach: Try text extraction first, fall back to OCR
- ✅ Smart processing: Only OCR when text extraction yields <100 chars
- ✅ High accuracy: Achieved 91.8% OCR confidence on test documents
- ✅ Page-by-page processing with progress tracking

**Implementation Details:**
```typescript
// api/utils/pdf-ocr.ts
export async function extractTextFromPDF(
  pdfBuffer: Buffer,
  fileName: string
): Promise<PDFExtractionResult> {
  // Step 1: Try fast text extraction first
  const pdfParseFunc = await getPdfParse();
  const pdfData = await pdfParseFunc(pdfBuffer);
  const cleanText = pdfData.text.trim();

  if (cleanText.length > 100) {
    return {
      text: cleanText,
      pages: pdfData.numpages,
      method: 'text-extraction'
    };
  }

  // Step 2: Fall back to OCR for scanned PDFs
  return await extractTextWithOCR(pdfBuffer, fileName);
}

async function extractTextWithOCR(pdfBuffer: Buffer, fileName: string) {
  // Convert PDF pages to images using pdf2pic
  const convert = fromBuffer(pdfBuffer, options);

  // Process each page with Tesseract OCR
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await convert(pageNum);
    const { data: { text, confidence } } = await Tesseract.recognize(
      page.path,
      'eng',
      { logger: m => console.log(m) }
    );
    allText += text + '\n\n';
  }

  return { text: allText, pages: pageCount, method: 'ocr', confidence };
}
```

**System Dependencies (Railway):**
```toml
# nixpacks.toml
[phases.setup]
nixPkgs = [
  "nodejs_20",
  "tesseract",          # OCR engine
  "graphicsmagick",     # Image processing for pdf2pic
  "ghostscript"         # PDF rendering
]
```

**Test Results:**
- ✅ Tested on "ABM Clinical Protocol #7" (scanned medical PDF)
- ✅ Extracted 28,597 characters successfully
- ✅ OCR confidence: 91.8% accuracy
- ✅ AI successfully quoted exact excerpts in responses
- ✅ Example: "8-12 feeds per 24 hours" and "6-8 heavy wet diapers by day 5-7"

#### **3. HubSpot Property Fix - COMPLETED**
**Status**: ✅ **RESOLVED**

**Problem:**
OCR was extracting text perfectly (28,597 chars), and the upload endpoint was sending it to HubSpot, but `text_content` property always showed 0 characters when queried.

**Root Cause:**
HubSpot custom object property `text_content` had `formField: false` in its configuration, causing the API to silently ignore writes to this field.

**Solution:**
Created diagnostic endpoint `/api/admin/fix-hubspot-schema` to:
1. Check property configuration
2. Update property settings:
```json
{
  "formField": true,
  "hidden": false,
  "modificationMetadata": {
    "readOnlyValue": false,
    "readOnlyDefinition": false
  }
}
```

**Verification:**
- ✅ Uploaded new PDF after fix
- ✅ Logs showed: `✅ text_content WAS saved (28597 chars)`
- ✅ AI response included exact quotes from uploaded PDF
- ✅ Knowledge retrieval working end-to-end

#### **4. Authentication System Fix - COMPLETED**
**Status**: ✅ **RESOLVED**

**Problem:**
After Railway migration, login page showed "Network error. Please try again." with 404 errors on auth endpoints.

**Root Cause:**
Authentication endpoints were missing from `server.js` after migration. Only chat and PDF upload endpoints were ported initially.

**Solution:**
Added all missing auth and user endpoints to `server.js`:
```javascript
// Auth handlers
const checkEmailHandler = await import('./api/auth/check-email.ts');
const loginHandler = await import('./api/auth/login.ts');
const registerHandler = await import('./api/auth/register.ts');

// User handlers
const updateProfileHandler = await import('./api/user/update-profile.ts');

// Mount auth endpoints
app.post('/api/auth/check-email', wrapHandler(checkEmailHandler));
app.post('/api/auth/login', wrapHandler(loginHandler));
app.post('/api/auth/register', wrapHandler(registerHandler));
app.post('/api/user/update-profile', wrapHandler(updateProfileHandler));
```

**Result:**
- ✅ Login working correctly
- ✅ Registration working
- ✅ Profile updates working
- ✅ All auth flows operational

#### **5. Diagnostic Tools Created - COMPLETED**
**Status**: ✅ **DEPLOYED**

**Tools Built:**

1. **`/api/admin/diagnostic` - Knowledge Base Inspector**
   - Shows all uploaded documents with metadata
   - Displays text content length for each PDF
   - Helps verify what AI can access
   - Returns JSON with document details

2. **`/api/admin/fix-hubspot-schema` - Property Configuration Tool**
   - Checks HubSpot property settings
   - Identifies misconfigured properties
   - Fixes `formField` and `readOnlyValue` settings
   - Used to resolve text_content saving issue

**Usage Example:**
```bash
# Check what's stored in knowledge base
curl https://nayacare.up.railway.app/api/admin/diagnostic

# Fix HubSpot property configuration
curl -X POST https://nayacare.up.railway.app/api/admin/fix-hubspot-schema
```

### **🐛 Bugs Fixed**

1. **Git Authentication Failure**
   - Switched from HTTPS to SSH authentication
   - Command: `git remote set-url origin git@github.com:cmanfre7/nayacare.git`

2. **Chunks Display Showing 0**
   - Fixed in `ConsolidatedAdminDashboard.jsx` lines 678, 745
   - Changed `doc.chunks?.length` to `doc.chunks` (chunks is a number, not array)

3. **textContentLength Always 0**
   - Fixed HubSpot property `text_content` configuration
   - Set `formField: true` to make property writable via API

4. **pdf.js DOMMatrix Error (REVERTED)**
   - Attempted migration to pdf.js + canvas failed
   - Error: `ReferenceError: DOMMatrix is not defined`
   - Root cause: pdf.js requires browser DOM APIs not available in Node.js
   - Solution: Reverted to pdf2pic + Tesseract.js (which works in Node.js)

5. **Login Network Error (404)**
   - Added missing auth endpoints to `server.js`
   - Fixed authentication flow after Railway migration

6. **Railway Start Command**
   - Fixed `railway.toml` to use `npm start` instead of `node server.js`
   - Ensures `tsx` runtime is used for TypeScript execution

### **📊 Project Hours Update**

**Previous Total (Session 1-2):** 97 hours
**Today's Session (2025-10-14):** 8 hours (updated from 5 hours)
**New Total:** 105 hours

**Breakdown (Today):**
- Railway migration and Express server setup: 2 hours
- OCR implementation (pdf2pic + Tesseract.js): 3+ hours
- HubSpot property debugging and fix: 1 hour
- Authentication endpoints addition: 1 hour
- Diagnostic tools and verification: 1 hour

### **🔜 Next Session - Growth Tracking UI**

**Priority: Growth Measurement Input System**

Same as outlined in Session 2 documentation - estimated 3-4 hours.

### **🎯 Current System Status**

**✅ Fully Working:**
- User authentication (email + PIN)
- Baby profile creation and management
- Feeding log persistence
- Sleep log persistence
- Chat history persistence
- **PDF uploads up to 100MB** (Railway)
- **OCR text extraction** (scanned PDFs)
- **AI knowledge retrieval** (verified end-to-end)
- Profile Manager modal
- Age calculations
- Session management across page refreshes
- **Growth tracking UI** (weight, length, head circ input + history display)

**✅ Growth Tracking:**
- ✅ API complete (HubSpot properties + endpoints)
- ✅ UI complete (input modal + measurement history)
- ✅ Chart visualization complete (WHO percentile curves with Recharts)
- ✅ Interactive tooltips and percentile calculations
- ✅ Baby's measurements plotted against WHO standards

**📝 Key Technical Decisions:**

1. **Railway over Vercel Pro**
   - Cost: $5/month vs $20/month
   - Limit: 100MB vs 100MB (same)
   - Architecture: Traditional server vs Serverless
   - Winner: Railway (cheaper, more flexible)

2. **pdf2pic + Tesseract.js over pdf.js**
   - pdf.js requires browser DOM APIs (DOMMatrix, ImageData)
   - pdf2pic works in Node.js server environment
   - Tesseract.js provides high-accuracy OCR (91.8%)
   - Winner: pdf2pic + Tesseract.js

3. **Hybrid Text Extraction Approach**
   - Try pdf-parse first (fast, works for text-based PDFs)
   - Fall back to OCR if <100 chars extracted (slower, works for scanned PDFs)
   - Best of both worlds: speed + accuracy

---

*Last Updated: October 21, 2025 (End of Session 6)*
*Version: 1.8.0 (Mobile Optimization & Growth Tracking Complete)*
*Status: Production-Ready, Fully Mobile-Optimized*