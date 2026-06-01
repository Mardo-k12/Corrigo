import * as Sentry from "@sentry/node";
import { logger } from "./logger";

export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    logger.warn("Sentry DSN not configured, error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
  });

  logger.info("Sentry initialized");
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
  logger.error({ error, context }, "Exception captured by Sentry");
}

export function captureMessage(message: string, level: "fatal" | "error" | "warning" | "info" = "info") {
  Sentry.captureMessage(message, level);
  logger.info({ message, level }, "Message captured by Sentry");
}
