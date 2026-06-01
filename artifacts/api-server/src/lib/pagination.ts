import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { logger } from "./logger";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function getPaginationParams(req: Request): { offset: number; limit: number; page: number } {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
  const offset = (page - 1) * limit;

  return { offset, limit, page };
}

export function buildPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
  };
}

export async function withPagination<T>(
  req: Request,
  res: Response,
  next: NextFunction,
  handler: (offset: number, limit: number) => Promise<{ data: T[]; total: number }>
) {
  try {
    const { offset, limit, page } = getPaginationParams(req);
    const { data, total } = await handler(offset, limit);
    const response = buildPaginatedResponse(data, page, limit, total);

    res.json(response);
  } catch (error) {
    logger.error({ error }, "Pagination error");
    next(error);
  }
}
