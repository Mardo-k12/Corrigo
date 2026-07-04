import pinoHttp, { type Options } from "pino-http";
import type { RequestHandler } from "express";
import { logger } from "./logger";
import { trackRequestMetrics } from "./datadog";

const httpLoggerOptions: Options = {
  logger,
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url?.split("?")[0],
        ip: req.ip,
        userAgent: req.get("user-agent"),
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
