// Type declarations for Vercel serverless functions

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VERCEL_URL?: string;
      NODE_ENV?: string;
      USE_VENDOR_LLM?: string;
      VENDOR_API_KEY?: string;
      HUBSPOT_ACCESS_TOKEN?: string;
      HUBSPOT_PORTAL_ID?: string;
      HUBSPOT_TABLE_ID?: string;
      OPENAI_API_KEY?: string;
    }
  }
}

export {};
