// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://461b480d2bc09b7f9d87449f6c481e5d@o4509864537030656.ingest.us.sentry.io/4510674385240064",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // 开启日志记录功能，用于记录应用程序的运行日志
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  // 开启 Vercel AI 集成，用于监控 AI 模型的调用
  integrations: [
    Sentry.vercelAIIntegration(),
    Sentry.consoleLoggingIntegration({
      levels: ["log", "info", "warn", "error"],
    }),
  ],
});
