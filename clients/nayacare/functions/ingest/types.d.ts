// Type declarations for Node.js environment
declare global {
  var process: {
    env: {
      [key: string]: string | undefined;
      HUBSPOT_ACCESS_TOKEN?: string;
      HUBSPOT_PORTAL_ID?: string;
      HUBSPOT_TABLE_ID?: string;
      VERCEL_URL?: string;
      NODE_ENV?: string;
    };
  };
  
  var console: {
    log: (...args: any[]) => void;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
  };
}

export {};
