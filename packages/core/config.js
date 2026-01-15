/**
 * PulseMed Core Configuration Loader
 * 
 * Loads and validates client-specific configuration files.
 * Each client has a config.json that defines their branding, features, and AI behavior.
 */

import fs from 'fs';
import path from 'path';

/**
 * Default configuration schema - clients can override any of these
 */
export const defaultConfig = {
  // Client identification
  clientId: 'default',
  clientName: 'PulseMed Client',
  displayName: 'Healthcare Assistant',
  specialty: 'general',
  
  // Branding
  branding: {
    primaryColor: '#6366f1',      // Indigo
    secondaryColor: '#8b5cf6',    // Purple
    accentColor: '#f59e0b',       // Amber
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, system-ui, sans-serif',
    logo: null,
    chatbotName: 'Assistant',
    welcomeMessage: 'Hello! How can I help you today?'
  },
  
  // Feature flags
  features: {
    chat: true,
    imageAnalysis: false,
    patientLogging: false,
    adminDashboard: true,
    surveySystem: false,
    pdfGeneration: false,
    consentTracking: true
  },
  
  // AI Configuration
  ai: {
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 1000,
    temperature: 0.9,
    systemPromptAdditions: []  // Client can add custom instructions
  },
  
  // Emergency/triage configuration
  triage: {
    emergencyKeywords: [
      'call 911', 'not breathing', 'stopped breathing',
      'turning blue', 'seizure', 'unconscious',
      'bleeding heavily', 'severe chest pain'
    ],
    urgentKeywords: [],
    escalationMessage: 'Please seek immediate medical attention or call 911.'
  },
  
  // Knowledge base configuration
  knowledgeBase: {
    enabled: true,
    maxDocuments: 50,
    maxFileSizeMB: 10,
    categories: []
  },
  
  // Contact information (for escalations)
  contact: {
    practiceName: null,
    phoneNumber: null,
    emergencyInstructions: 'Contact your healthcare provider or call 911 for emergencies.'
  },
  
  // Legal/compliance
  legal: {
    tosVersion: '1.0.0',
    privacyPolicyVersion: '1.0.0',
    disclaimer: 'This assistant provides educational information only and does not replace professional medical care.'
  }
};

/**
 * Load configuration from a client's config.json file
 * @param {string} configPath - Path to config.json
 * @returns {Object} Merged configuration with defaults
 */
export function loadConfig(configPath) {
  try {
    const configFile = fs.readFileSync(configPath, 'utf-8');
    const clientConfig = JSON.parse(configFile);
    
    // Deep merge with defaults
    return deepMerge(defaultConfig, clientConfig);
  } catch (error) {
    console.warn(`Could not load config from ${configPath}, using defaults:`, error.message);
    return { ...defaultConfig };
  }
}

/**
 * Validate configuration has required fields
 * @param {Object} config - Configuration object
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateConfig(config) {
  const errors = [];
  
  if (!config.clientId) errors.push('clientId is required');
  if (!config.clientName) errors.push('clientName is required');
  if (!config.branding?.chatbotName) errors.push('branding.chatbotName is required');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

export default { loadConfig, validateConfig, defaultConfig };
