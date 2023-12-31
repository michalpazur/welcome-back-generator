declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV: "development" | "production";
      PWD: string;
      POSTGRES_HOST: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DB: string;
      USER_AGENT_EMAIL: string;
      ADMIN_LOGIN: string;
      ADMIN_PASSWORD: string;
      TRUSTED_PROXIES: string;
      LOG_LEVEL: "debug" | "info" | "warn" | "error"
      ALLOWED_ORIGIN: string;
    }
  }
}

export {}