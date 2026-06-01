import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn(
      { statusCode: err.statusCode, message: err.message, details: err.details },
      "Application error"
    );
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
      requestId: req.id,
    });
  } else if (err instanceof Error) {
    logger.error(
      { message: err.message, stack: err.stack },
      "Unhandled error"
    );
    res.status(500).json({
      error: "Internal server error",
      requestId: req.id,
    });
  } else {
    logger.error({ error: err }, "Unknown error");
    res.status(500).json({
      error: "Internal server error",
      requestId: req.id,
    });
  }
};
