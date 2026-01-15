/**
 * @pulsemed/core
 * 
 * PulseMed Core Framework
 * White-label Healthcare AI Platform
 * 
 * This package provides the shared infrastructure for all PulseMed client applications:
 * - Configurable Express server with API routing
 * - AI chat handler with physician-curated knowledge base integration
 * - HubSpot CRM integration for patient data and analytics
 * - Authentication and consent management
 * - Emergency detection and triage protocols
 */

export { createServer, createExpressApp } from './server.js';
export { createChatHandler } from './api/chat.js';
export { loadConfig, validateConfig } from './config.js';

// Re-export types
export * from './types/index.js';
