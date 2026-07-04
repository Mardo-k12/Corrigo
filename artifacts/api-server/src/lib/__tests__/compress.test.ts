// Mock sharp to avoid ESM issues in Jest
jest.mock("sharp", () => {
  const transformer: any = {};
  transformer.resize = jest.fn(() => transformer);
  transformer.jpeg = jest.fn(() => transformer);
  transformer.webp = jest.fn(() => transformer);
  transformer.png = jest.fn(() => transformer);
  transformer.toBuffer = jest.fn(async () => Buffer.from("compressed"));

  return jest.fn(() => transformer);
});

describe("Image Compression", () => {
  it("should export compression functions", async () => {
    const { compressImage, compressImageBase64 } = await import("../compress");
    expect(typeof compressImage).toBe("function");
    expect(typeof compressImageBase64).toBe("function");
  });

  it("should have correct compression options interface", async () => {
    const { compressImage } = await import("../compress");
    // Just verify function exists and accepts parameters
    expect(compressImage).toBeDefined();
  });
});
