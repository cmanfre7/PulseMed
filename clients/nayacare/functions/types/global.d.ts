// Global type declarations for Node.js environment

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HUBSPOT_ACCESS_TOKEN?: string;
      HUBSPOT_PORTAL_ID?: string;
      HUBSPOT_TABLE_ID?: string;
      VERCEL_URL?: string;
      NODE_ENV?: string;
      OPENAI_API_KEY?: string;
      USE_VENDOR_LLM?: string;
      VENDOR_API_KEY?: string;
    }
  }
}

export {};
