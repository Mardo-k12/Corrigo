import pinoHttp, { type Options } from "pino-http";
import type { RequestHandler } from "express";
import { logger } from "./logger";
import { trackRequestMetrics } from "./datadog";

const httpLoggerOptions: Options = {
  logger,
  serializers: {
    req(req) {
      const userAgentHeader =
        typeof (req as { get?: (name: string) => string | undefined }).get === "function"
          ? (req as { get: (name: string) => string | undefined }).get("user-agent")
          : req.headers?.["user-agent"];

      return {
        id: req.id,
        method: req.method,
        url: req.url?.split("?")[0],
        ip: req.ip,
        userAgent: Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
};

export function createHttpLogger(): RequestHandler {
  const httpLogger = pinoHttp(httpLoggerOptions);

  return (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      trackRequestMetrics(req.method, req.path, res.statusCode, duration);
    });

    httpLogger(req, res, next);
  };
}
