import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export const requestIdMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.id = req.get("X-Request-ID") || randomUUID();
  next();
};
