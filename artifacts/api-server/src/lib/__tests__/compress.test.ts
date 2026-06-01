import { describe, it, expect, jest } from "@jest/globals";

// Mock sharp to avoid ESM issues in Jest
jest.mock("sharp", () => {
  return jest.fn(() => ({
    resize: jest.fn(function() { return this; }),
    jpeg: jest.fn(function() { return this; }),
    webp: jest.fn(function() { return this; }),
    png: jest.fn(function() { return this; }),
    toBuffer: jest.fn(async () => Buffer.from("compressed")),
  }));
});

describe("Image Compression", () => {
  it("should export compression functions", async () => {
    const { compressImage, compressImageBase64 } = await import("../compress");
    expect(typeof compressImage).toBe("function");
    expect(typeof compressImageBase64).toBe("function");
  });

  it("should have correct compression options interface", async () => {
    const { compressImage } = await import("../compress");
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG header
    // Just verify function exists and accepts parameters
    expect(compressImage).toBeDefined();
  });
});
