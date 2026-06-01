import { describe, it, expect } from "@jest/globals";
import { buildPaginatedResponse, getPaginationParams } from "../../lib/pagination";
import { Request } from "express";

describe("Pagination Utilities", () => {
  it("should build paginated response correctly", () => {
    const data = [1, 2, 3];
    const response = buildPaginatedResponse(data, 1, 20, 45);

    expect(response.data).toEqual(data);
    expect(response.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 45,
      totalPages: 3,
      hasMore: true,
    });
  });

  it("should return correct hasMore flag", () => {
    const data = [];

    // Last page
    const lastPageResponse = buildPaginatedResponse(data, 3, 20, 45);
    expect(lastPageResponse.pagination.hasMore).toBe(false);

    // Not last page
    const firstPageResponse = buildPaginatedResponse(data, 1, 20, 45);
    expect(firstPageResponse.pagination.hasMore).toBe(true);
  });

  it("should parse pagination params from request", () => {
    const mockReq = {
      query: { page: "2", limit: "50" },
    } as unknown as Request;

    const { offset, limit, page } = getPaginationParams(mockReq);

    expect(page).toBe(2);
    expect(limit).toBe(50);
    expect(offset).toBe(50);
  });

  it("should default pagination params", () => {
    const mockReq = {
      query: {},
    } as unknown as Request;

    const { offset, limit, page } = getPaginationParams(mockReq);

    expect(page).toBe(1);
    expect(limit).toBe(20);
    expect(offset).toBe(0);
  });

  it("should cap limit to 100", () => {
    const mockReq = {
      query: { limit: "500" },
    } as unknown as Request;

    const { limit } = getPaginationParams(mockReq);
    expect(limit).toBe(100);
  });
});
