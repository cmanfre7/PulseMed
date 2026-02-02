/**
 * Hip Preservation Client Server
 * Knowledge-base powered chat with content API
 */

import express from 'express';
import { createChatHandler } from '@pulsemed/core/chat';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load client config
const configPath = join(__dirname, 'config.json');
const config = JSON.parse(readFileSync(configPath, 'utf-8'));

// Load knowledge base
const kbDir = join(__dirname, 'knowledge-base');
const indexPath = join(kbDir, 'index.json');
let kbIndex = { documents: [] };
if (existsSync(indexPath)) {
  kbIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));
}

// Pre-load KB documents
const kbDocuments = [];
for (const doc of kbIndex.documents) {
  const filePath = join(kbDir, doc.path);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8');
    kbDocuments.push({ ...doc, content, searchText: content.toLowerCase() });
  }
}
console.log(`📚 Loaded ${kbDocuments.length} knowledge base documents`);

/**
 * Search knowledge base
 */
function searchKnowledgeBase(query, limit = 4) {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const scored = kbDocuments.map(doc => {
    let score = 0;
    for (const term of terms) {
      if (doc.searchText.includes(term)) {
        score += 1;
        if (doc.title.toLowerCase().includes(term)) score += 3;
      }
    }
    if (terms.some(t => ['surgery', 'procedure', 'operation'].includes(t)) && doc.category === 'procedures') score += 2;
    if (terms.some(t => ['doctor', 'surgeon', 'dr'].includes(t)) && doc.category === 'providers') score += 2;
    return { ...doc, score };
  });
  return scored.filter(d => d.score > 0).sort((a, b) => b.score - a.score).slice(0, limit)
    .map(d => ({ title: d.title, content: d.content, category: d.category }));
}

/**
 * Markdown to HTML
 */
function markdownToHtml(md) {
  return md
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^([^<\n])/gm, '<p>$1')
    .replace(/([^>])$/gm, '$1</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[hulo])/g, '$1')
    .replace(/(<\/[hulo].*>)<\/p>/g, '$1');
}

/**
 * Get content by type and id
 */
function getContent(type, id) {
  const folderMap = { 'blog': 'blog', 'resource': 'conditions', 'procedure': 'procedures' };
  const possiblePaths = [
    join(kbDir, folderMap[type] || type, `${id}.md`),
    join(kbDir, 'procedures', `${id}.md`),
    join(kbDir, 'conditions', `${id}.md`),
    join(kbDir, `${id}.md`)
  ];
  for (const filePath of possiblePaths) {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      const cleanContent = content.replace(/^---[\s\S]*?---\n*/m, '');
      return { found: true, content: cleanContent, html: markdownToHtml(cleanContent) };
    }
  }
  return { found: false };
}

// Create Express app
const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    client: config.clientName,
    chatbot: config.branding.chatbotName,
    kbDocs: kbDocuments.length
  });
});

// Content endpoint
app.get('/api/content/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const result = getContent(type, id);
  if (result.found) {
    res.json({ title: id, html: result.html });
  } else {
    res.status(404).json({ error: 'Content not found', type, id });
  }
});

// Chat endpoint
const chatHandler = createChatHandler(config, { loadKnowledgeBase: async (q) => searchKnowledgeBase(q, 4) });
app.post('/api/chat', async (req, res) => {
  req.clientConfig = config;
  await chatHandler(req, res);
});

// Static files (serve from public/)
app.use(express.static(join(__dirname, 'public')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ${config.clientName} running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Static: ${join(__dirname, 'dist')}`);
  console.log(`🔌 API: /api/*`);
});
