/**
 * Hip Preservation Client Server
 * Uses @pulsemed/core to create the server
 */

import { createServer } from '@pulsemed/core/server';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load client config
const configPath = join(__dirname, 'config.json');
const config = JSON.parse(readFileSync(configPath, 'utf-8'));

// Simple health check and chat handlers
const handlers = {
  'GET /api/health': {
    default: async (req, res) => {
      res.json({ status: 'ok', client: config.clientName });
    }
  },
  'POST /api/chat': {
    default: async (req, res) => {
      // Basic chat endpoint - will be enhanced later
      const { message } = req.body;
      res.json({ 
        response: `Hip Preservation AI is online. Received: ${message}`,
        client: config.clientName 
      });
    }
  }
};

// Start the server
createServer(config, handlers, {
  port: process.env.PORT || 3000,
  staticDir: join(__dirname, 'dist')
});
