import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// Pre-load all TypeScript API handlers at startup
console.log('📦 Loading API handlers...');

const chatHandler = await import('./api/chat.ts');
const knowledgeBaseHandler = await import('./api/admin/knowledge-base.ts');
const uploadPdfHandler = await import('./api/admin/upload-pdf.ts');
const uploadResourcePdfHandler = await import('./api/admin/upload-resource-pdf.ts');
const resourcesHandler = await import('./api/admin/resources.ts');
const videosHandler = await import('./api/admin/videos.ts');
const checkLimitsHandler = await import('./api/admin/check-limits.ts');
const diagnosticHandler = await import('./api/admin/diagnostic.ts');
const fixHubSpotSchemaHandler = await import('./api/admin/fix-hubspot-schema.ts');

// Auth handlers
const checkEmailHandler = await import('./api/auth/check-email.ts');
const loginHandler = await import('./api/auth/login.ts');
const registerHandler = await import('./api/auth/register.ts');

// Consent handlers (NAY-9)
const consentStatusHandler = await import('./api/consent/status.ts');
const consentAcceptHandler = await import('./api/consent/accept.ts');

// User handlers
const updateProfileHandler = await import('./api/user/update-profile.ts');

// Survey handlers
const surveySubmitHandler = await import('./api/survey/submit.ts');
const surveySkipHandler = await import('./api/survey/skip.ts');
const surveyAnalyticsHandler = await import('./api/admin/survey-analytics.ts');

// Chat analytics handler
const chatAnalyticsHandler = await import('./api/admin/chat-analytics.ts');

console.log('✅ All API handlers loaded');

// Helper to wrap Vercel-style handlers for Express
function wrapHandler(handler) {
  return async (req, res) => {
    try {
      console.log(`📥 ${req.method} ${req.path}`);
      if (!handler || !handler.default) {
        console.error(`❌ Handler not found or invalid for ${req.path}`);
        return res.status(500).json({
          error: 'Handler not properly loaded',
          path: req.path
        });
      }
      await handler.default(req, res);
      console.log(`✅ ${req.method} ${req.path} completed`);
    } catch (error) {
      console.error(`❌ Handler error for ${req.method} ${req.path}:`, error);
      console.error('Stack:', error.stack);
      if (!res.headersSent) {
        res.status(500).json({
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          path: req.path
        });
      }
    }
  };
}

// Mount all API routes

// Auth endpoints
app.post('/api/auth/check-email', wrapHandler(checkEmailHandler));
app.post('/api/auth/login', wrapHandler(loginHandler));
app.post('/api/auth/register', wrapHandler(registerHandler));

// Consent endpoints (NAY-9)
app.get('/api/consent/status', wrapHandler(consentStatusHandler));
app.post('/api/consent/accept', wrapHandler(consentAcceptHandler));

// User endpoints
app.post('/api/user/update-profile', wrapHandler(updateProfileHandler));

// Survey endpoints
app.post('/api/survey/submit', wrapHandler(surveySubmitHandler));
app.post('/api/survey/skip', wrapHandler(surveySkipHandler));

// Chat
app.post('/api/chat', wrapHandler(chatHandler));

// Admin endpoints
app.get('/api/admin/knowledge-base', wrapHandler(knowledgeBaseHandler));
app.delete('/api/admin/knowledge-base', wrapHandler(knowledgeBaseHandler));
app.post('/api/admin/upload-pdf', wrapHandler(uploadPdfHandler));
app.post('/api/admin/upload-resource-pdf', wrapHandler(uploadResourcePdfHandler));
app.get('/api/admin/resources', wrapHandler(resourcesHandler));
app.post('/api/admin/resources', wrapHandler(resourcesHandler));
app.put('/api/admin/resources', wrapHandler(resourcesHandler));
app.delete('/api/admin/resources', wrapHandler(resourcesHandler));
app.get('/api/admin/videos', wrapHandler(videosHandler));
app.post('/api/admin/videos', wrapHandler(videosHandler));
app.put('/api/admin/videos', wrapHandler(videosHandler));
app.delete('/api/admin/videos', wrapHandler(videosHandler));
app.get('/api/admin/check-limits', wrapHandler(checkLimitsHandler));
app.get('/api/admin/diagnostic', wrapHandler(diagnosticHandler));
app.get('/api/admin/fix-hubspot-schema', wrapHandler(fixHubSpotSchemaHandler));
app.get('/api/admin/survey-analytics', wrapHandler(surveyAnalyticsHandler));
app.get('/api/admin/chat-analytics', wrapHandler(chatAnalyticsHandler));

// Serve static files
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NayaCare running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Static: ${join(__dirname, 'dist')}`);
  console.log(`🔌 API: /api/*`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
});
