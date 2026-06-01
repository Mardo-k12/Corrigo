import { z } from "zod";

// AI Routes Validation Schemas
export const OcrRequestSchema = z.object({
  imageBase64: z.string().min(1, "imageBase64 is required"),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|png|webp|gif)$/, "Invalid MIME type")
    .default("image/jpeg"),
});

export type OcrRequest = z.infer<typeof OcrRequestSchema>;

export const GradeRequestSchema = z.object({
  examContent: z.string().min(1, "examContent is required"),
  examContext: z.string().min(1, "examContext is required"),
  rubric: z.string().optional(),
  studentResponse: z.string().optional(),
});

export type GradeRequest = z.infer<typeof GradeRequestSchema>;

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;

// List responses with pagination
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.array(schema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasMore: z.boolean(),
    }),
  });

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;

// Exam Schemas
export const CreateExamSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  totalPoints: z.number().positive("Total points must be positive"),
  passingScore: z.number().min(0).max(100, "Passing score must be 0-100"),
});

export type CreateExamRequest = z.infer<typeof CreateExamSchema>;

// Course Schemas
export const CreateCourseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Course code is required"),
});

export type CreateCourseRequest = z.infer<typeof CreateCourseSchema>;
