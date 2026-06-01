import { pinoHttp } from "pino-http";
import { logger } from "./logger";
import { trackRequestMetrics } from "./datadog";

export function createHttpLogger() {
  return pinoHttp(
    {
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
    },
    (req, res) => {
      // Track metrics after response sent
      const start = Date.now();
      
      res.on("finish", () => {
        const duration = Date.now() - start;
        trackRequestMetrics(
          req.method,
          req.path,
          res.statusCode,
          duration
        );
      });
    }
  );
}
