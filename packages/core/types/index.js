/**
 * PulseMed Core Types
 * 
 * JSDoc type definitions for the PulseMed framework.
 * These provide IDE autocompletion and documentation.
 */

/**
 * @typedef {Object} ClientConfig
 * @property {string} clientId - Unique identifier for the client
 * @property {string} clientName - Display name of the practice/client
 * @property {string} displayName - Name shown in UI
 * @property {string} specialty - Medical specialty (e.g., 'pediatrics', 'orthopedics')
 * @property {BrandingConfig} branding - UI branding configuration
 * @property {FeaturesConfig} features - Enabled features
 * @property {AIConfig} ai - AI model configuration
 * @property {TriageConfig} triage - Emergency/triage settings
 * @property {KnowledgeBaseConfig} knowledgeBase - Knowledge base settings
 * @property {ContactConfig} contact - Practice contact information
 * @property {LegalConfig} legal - Legal/compliance settings
 */

/**
 * @typedef {Object} BrandingConfig
 * @property {string} primaryColor - Primary brand color (hex)
 * @property {string} secondaryColor - Secondary brand color (hex)
 * @property {string} accentColor - Accent color (hex)
 * @property {string} backgroundColor - Background color (hex)
 * @property {string} fontFamily - CSS font family
 * @property {string|null} logo - URL to logo image
 * @property {string} chatbotName - Name of the chatbot assistant
 * @property {string} welcomeMessage - Initial welcome message
 */

/**
 * @typedef {Object} FeaturesConfig
 * @property {boolean} chat - Enable chat functionality
 * @property {boolean} imageAnalysis - Enable image/photo analysis
 * @property {boolean} patientLogging - Enable patient activity logging
 * @property {boolean} adminDashboard - Enable admin dashboard
 * @property {boolean} surveySystem - Enable patient surveys
 * @property {boolean} pdfGeneration - Enable PDF generation
 * @property {boolean} consentTracking - Enable consent management
 */

/**
 * @typedef {Object} AIConfig
 * @property {string} model - AI model identifier
 * @property {number} maxTokens - Maximum tokens per response
 * @property {number} temperature - AI temperature (0-1)
 * @property {string[]} systemPromptAdditions - Additional system prompt instructions
 */

/**
 * @typedef {Object} TriageConfig
 * @property {string[]} emergencyKeywords - Keywords that trigger emergency protocol
 * @property {string[]} urgentKeywords - Keywords that trigger urgent care advice
 * @property {string} escalationMessage - Message shown for emergencies
 */

/**
 * @typedef {Object} KnowledgeBaseConfig
 * @property {boolean} enabled - Whether KB is enabled
 * @property {number} maxDocuments - Maximum number of documents
 * @property {number} maxFileSizeMB - Maximum file size in MB
 * @property {string[]} categories - Document categories
 * @property {string[]} medicalTopics - Topics that trigger KB lookup
 */

/**
 * @typedef {Object} ContactConfig
 * @property {string|null} practiceName - Name of the medical practice
 * @property {string|null} phoneNumber - Contact phone number
 * @property {string} emergencyInstructions - Instructions for emergencies
 */

/**
 * @typedef {Object} LegalConfig
 * @property {string} tosVersion - Terms of Service version
 * @property {string} privacyPolicyVersion - Privacy Policy version
 * @property {string} disclaimer - Medical disclaimer text
 */

export const ClientConfigSchema = {
  description: 'Schema for client configuration files'
};

export default { ClientConfigSchema };
