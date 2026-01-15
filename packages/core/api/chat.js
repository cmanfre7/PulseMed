/**
 * PulseMed Core Chat Handler
 * 
 * Platform-agnostic AI chat handler.
 * Adapts to client-specific settings via config and injected adapters.
 */

const VENDOR_API_KEY = process.env.VENDOR_API_KEY || process.env.ANTHROPIC_API_KEY || '';

/**
 * Create a chat handler configured for a specific client
 * @param {Object} config - Client configuration from config.json
 * @param {Object} adapters - Client-provided adapters
 * @param {Function} adapters.loadKnowledgeBase - Async function to load KB records
 * @param {Function} adapters.logConversation - Async function to log conversations (optional)
 * @returns {Function} Express handler
 */
export function createChatHandler(config, adapters = {}) {
  const { loadKnowledgeBase, logConversation } = adapters;
  
  return async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const { message, history, context, sessionId, image = null } = req.body || {};
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required and must be a string' });
      }

      const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const startTime = Date.now();

      // De-identify PHI
      const deIdentifiedMessage = deIdentifyText(message);

      // Emergency detection using client-specific keywords
      const emergencyKeywords = config.triage?.emergencyKeywords || [];
      
      if (checkForEmergency(deIdentifiedMessage, emergencyKeywords)) {
        const escalationMessage = config.triage?.escalationMessage || 
          '🚨 EMERGENCY 🚨\n\nThis sounds like a medical emergency. Please call 911 or contact your healthcare provider immediately.';
        
        return res.status(200).json({
          answer: escalationMessage,
          sources: ['Emergency Protocol'],
          confidence: 1.0,
          isEmergency: true
        });
      }

      // Check AI configuration
      if (!VENDOR_API_KEY) {
        console.error('No AI API key configured');
        return res.status(200).json({
          answer: `Thank you for your question. Please contact ${config.clientName || 'the practice'} directly for assistance.`,
          sources: ['Fallback - AI not configured'],
          confidence: 0.6
        });
      }

      // Build system prompt from config
      const systemPrompt = buildSystemPrompt(config, context);
      
      // Load knowledge base if client provided a loader
      let kbRecords = [];
      if (loadKnowledgeBase && config.knowledgeBase?.enabled) {
        try {
          kbRecords = await loadKnowledgeBase(deIdentifiedMessage, config);
        } catch (err) {
          console.error('KB load error:', err);
        }
      }

      // Build conversation context
      const historyMessages = formatHistory(history);
      const contextBlock = buildContextBlock(kbRecords, config);

      // Build user message (text or multimodal)
      const userMessageContent = image?.data
        ? buildMultimodalMessage(deIdentifiedMessage, image)
        : deIdentifiedMessage;

      // Call AI
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': VENDOR_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.ai?.model || 'claude-sonnet-4-5-20250929',
          max_tokens: config.ai?.maxTokens || 1000,
          temperature: config.ai?.temperature || 0.9,
          system: contextBlock ? `${systemPrompt}\n\n${contextBlock}` : systemPrompt,
          messages: [
            ...historyMessages,
            { role: 'user', content: userMessageContent }
          ]
        })
      });

      if (!anthropicRes.ok) {
        const errorText = await anthropicRes.text();
        console.error('AI error:', anthropicRes.status, errorText);
        return res.status(200).json({
          answer: `I'm having trouble connecting right now. Please try again or contact ${config.clientName || 'the practice'} directly.`,
          sources: ['Fallback'],
          confidence: 0.6
        });
      }

      const data = await anthropicRes.json();
      const answer = data?.content?.[0]?.text || 
        `I'm here to help. What can I assist you with?`;

      const responseTime = Date.now() - startTime;

      // Log conversation if client provided a logger
      if (logConversation) {
        logConversation({
          sessionId: currentSessionId,
          message: deIdentifiedMessage,
          response: answer,
          responseTime,
          kbUsed: kbRecords.length > 0
        }).catch(err => console.error('Log error:', err));
      }

      return res.status(200).json({
        answer,
        sources: kbRecords.length > 0 ? ['Knowledge Base', 'AI'] : ['AI'],
        confidence: kbRecords.length > 0 ? 0.9 : 0.75
      });

    } catch (err) {
      console.error('Chat API error:', err);
      return res.status(200).json({
        answer: "I'm having technical difficulties. Please try again shortly.",
        sources: ['Error fallback'],
        confidence: 0.4
      });
    }
  };
}

/**
 * Build the system prompt from client configuration
 */
function buildSystemPrompt(config, context) {
  const chatbotName = config.branding?.chatbotName || 'Assistant';
  const clientName = config.clientName || 'the practice';
  
  const parts = [
    `You are ${chatbotName}, a knowledgeable and supportive assistant for ${clientName}.`,
    
    `\n\n🎯 KNOWLEDGE BASE PRIORITY:`,
    `1. Prioritize information from the curated resources when available.`,
    `2. Attribute information properly when referencing the knowledge base.`,
    `3. If a topic isn't covered, use general knowledge but note the limitation.`,
    
    `\n\n💬 COMMUNICATION STYLE:`,
    `- Be concise: 2-4 sentences when possible`,
    `- Front-load important information`,
    `- Use bullet points for lists`,
    `- Be empathetic and supportive`,
    
    `\n\n⚕️ MEDICAL BOUNDARIES:`,
    `- Do NOT diagnose or prescribe`,
    `- For emergencies, direct to ER/911`,
    `- Recommend contacting the care team for specific medical advice`,
    
    `\n\n${config.legal?.disclaimer || 'This assistant provides educational information only.'}`,
  ];
  
  // Add client-specific AI instructions
  if (config.ai?.systemPromptAdditions?.length > 0) {
    parts.push(`\n\n📋 SPECIALTY INSTRUCTIONS:`);
    config.ai.systemPromptAdditions.forEach(instruction => {
      parts.push(`- ${instruction}`);
    });
  }
  
  // Add context if available
  if (context?.patientName) {
    parts.push(`\n\nCONTEXT: Speaking with ${context.patientName}.`);
  }
  
  return parts.join('\n');
}

/**
 * Check if message contains emergency keywords
 */
function checkForEmergency(message, keywords) {
  if (!keywords.length) return false;
  
  const normalized = message.toLowerCase();
  const nonEmergencyPhrases = ['blueprint', 'plan', 'guide', 'schedule'];
  
  if (nonEmergencyPhrases.some(phrase => normalized.includes(phrase))) {
    return false;
  }
  
  return keywords.some(keyword => normalized.includes(keyword.toLowerCase()));
}

/**
 * De-identify PHI from text
 */
function deIdentifyText(text) {
  return text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
    .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[DATE]');
}

/**
 * Format conversation history for AI
 */
function formatHistory(history) {
  if (!Array.isArray(history) || history.length === 0) return [];
  
  return history
    .slice(-12)
    .filter(h => h?.content?.trim?.())
    .map(h => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: deIdentifyText(String(h.content).trim())
    }));
}

/**
 * Build context block from knowledge base records
 */
function buildContextBlock(kbRecords, config) {
  if (!kbRecords || kbRecords.length === 0) return '';
  
  const clientName = config.clientName || 'the practice';
  
  return `\n\n📚 REFERENCE MATERIAL FROM ${clientName.toUpperCase()}:\n` +
    kbRecords.slice(0, 6).map((r, i) => {
      const content = (r.content || r.text || '').slice(0, 5000);
      return `[Reference ${i + 1}: "${r.title}"]\n${content}`;
    }).join('\n\n---\n\n');
}

/**
 * Build multimodal message with image
 */
function buildMultimodalMessage(text, image) {
  const base64Data = image.data.includes(',') ? image.data.split(',')[1] : image.data;
  return [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: image.mediaType || 'image/jpeg',
        data: base64Data
      }
    },
    { type: 'text', text }
  ];
}

export default { createChatHandler };
