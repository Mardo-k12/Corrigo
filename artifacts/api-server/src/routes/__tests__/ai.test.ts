import { OcrRequestSchema, GradeRequestSchema } from "../../lib/schemas";

describe("AI Routes Validation", () => {
  describe("OCR Request Schema", () => {
    it("should validate valid OCR request", () => {
      const validRequest = {
        imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        mimeType: "image/jpeg",
      };

      const result = OcrRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should reject missing imageBase64", () => {
      const invalidRequest = {
        mimeType: "image/jpeg",
      };

      const result = OcrRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject invalid MIME type", () => {
      const invalidRequest = {
        imageBase64: "some-base64",
        mimeType: "video/mp4",
      };

      const result = OcrRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe("Grade Request Schema", () => {
    it("should validate valid grade request", () => {
      const validRequest = {
        examContent: "Student answers",
        examContext: "Math Exam - Algebra",
      };

      const result = GradeRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should reject missing examContent", () => {
      const invalidRequest = {
        examContext: "Math Exam",
      };

      const result = GradeRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject missing examContext", () => {
      const invalidRequest = {
        examContent: "Student answers",
      };

      const result = GradeRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});
