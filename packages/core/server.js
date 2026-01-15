/**
 * PulseMed Core Server
 * 
 * Configurable Express server that can be customized per client.
 * Handles API routing, static file serving, and middleware setup.
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * Create a configured Express application
 * @param {Object} config - Client configuration
 * @param {Object} options - Server options
 * @returns {Express.Application}
 */
export function createExpressApp(config, options = {}) {
  const app = express();
  
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
  
  // Attach config to request for handlers to access
  app.use((req, res, next) => {
    req.clientConfig = config;
    next();
  });
  
  // Request logging
  if (options.logging !== false) {
    app.use((req, res, next) => {
      console.log(`📥 ${req.method} ${req.path}`);
      next();
    });
  }
  
  return app;
}

/**
 * Wrap Vercel-style handlers for Express
 * @param {Function} handler - Async handler function
 * @returns {Function} Express middleware
 */
export function wrapHandler(handler) {
  return async (req, res) => {
    try {
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
      if (!res.headersSent) {
        res.status(500).json({
          error: error.message,
          path: req.path
        });
      }
    }
  };
}

/**
 * Create and start a server with the given configuration
 * @param {Object} config - Client configuration
 * @param {Object} handlers - Map of route handlers
 * @param {Object} options - Server options
 */
export async function createServer(config, handlers = {}, options = {}) {
  const app = createExpressApp(config, options);
  const PORT = options.port || process.env.PORT || 8080;
  const staticDir = options.staticDir || join(process.cwd(), 'dist');
  
  console.log(`📦 Loading ${config.clientName} API handlers...`);
  
  // Mount provided handlers
  for (const [route, handler] of Object.entries(handlers)) {
    const [method, path] = route.split(' ');
    const expressMethod = method.toLowerCase();
    
    if (app[expressMethod]) {
      app[expressMethod](path, wrapHandler(handler));
      console.log(`  ✓ ${method} ${path}`);
    }
  }
  
  console.log('✅ API handlers loaded');
  
  // Serve static files
  app.use(express.static(staticDir));
  
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(join(staticDir, 'index.html'));
  });
  
  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ${config.clientName} running on http://0.0.0.0:${PORT}`);
    console.log(`📁 Static: ${staticDir}`);
    console.log(`🔌 API: /api/*`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  });
  
  return app;
}

export default { createServer, createExpressApp, wrapHandler };
