import { z } from "zod";

export const DifficultySchema = z.enum(["facile", "moyen", "difficile"]);
export const ExamTypeSchema = z.enum(["qcm", "ouvert", "mixte"]);
export const QuestionTypeSchema = z.enum(["qcm", "ouvert"]);
export const UserRoleSchema = z.enum(["teacher", "admin"]);

export const ExamQuestionSchema = z.object({
  type: QuestionTypeSchema,
  statement: z.string().min(1),
  points: z.number().positive(),
  options: z.array(z.string().min(1)).optional(),
  answer: z.string().optional(),
});

export const UserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  institution: z.string().min(1).nullable().optional(),
  role: UserRoleSchema,
  createdAt: z.string().datetime(),
});

export const CourseSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),
  subject: z.string().min(1),
  semester: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  summary: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const StudentSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  matricule: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const ExamSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  title: z.string().min(1),
  instructions: z.string().min(1),
  totalPoints: z.number().positive(),
  durationMinutes: z.number().int().positive(),
  difficulty: DifficultySchema,
  type: ExamTypeSchema,
  questions: z.array(ExamQuestionSchema),
  createdAt: z.string().datetime(),
});

export const GradeSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  studentId: z.string().min(1).nullable().optional(),
  examId: z.string().min(1).nullable().optional(),
  scannedText: z.string().min(1),
  imageUri: z.string().min(1).nullable().optional(),
  score: z.number().min(0),
  maxScore: z.number().positive(),
  appreciation: z.string().min(1),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestion: z.string().min(1),
  validated: z.boolean(),
  createdAt: z.string().datetime(),
});

export const CreateUserInputSchema = UserSchema.omit({
  id: true,
  createdAt: true,
}).extend({
  institution: z.string().min(1).optional(),
  role: UserRoleSchema.default("teacher"),
});

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  institution: z.string().min(1).optional(),
});

export const UpdateUserProfileInputSchema = z.object({
  name: z.string().min(1).optional(),
  institution: z.string().min(1).optional(),
});

export const CreateCourseInputSchema = CourseSchema.omit({
  id: true,
  createdAt: true,
}).extend({
  summary: z.string().min(1).optional(),
});

export const UpdateCourseInputSchema = CreateCourseInputSchema.partial();

export const CreateStudentInputSchema = StudentSchema.omit({
  id: true,
  createdAt: true,
});

export const UpdateStudentInputSchema = CreateStudentInputSchema.partial();

export const CreateExamInputSchema = ExamSchema.omit({
  id: true,
  createdAt: true,
});

export const UpdateExamInputSchema = CreateExamInputSchema.partial();

export const CreateGradeInputSchema = GradeSchema.omit({
  id: true,
  createdAt: true,
}).extend({
  studentId: z.string().min(1).optional(),
  examId: z.string().min(1).optional(),
  imageUri: z.string().min(1).optional(),
  validated: z.boolean().default(false),
});

export const UpdateGradeInputSchema = CreateGradeInputSchema.partial();

export type ExamQuestionDto = z.infer<typeof ExamQuestionSchema>;
export type UserDto = z.infer<typeof UserSchema>;
export type CourseDto = z.infer<typeof CourseSchema>;
export type StudentDto = z.infer<typeof StudentSchema>;
export type ExamDto = z.infer<typeof ExamSchema>;
export type GradeDto = z.infer<typeof GradeSchema>;
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type CreateCourseInput = z.infer<typeof CreateCourseInputSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseInputSchema>;
export type CreateStudentInput = z.infer<typeof CreateStudentInputSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentInputSchema>;
export type CreateExamInput = z.infer<typeof CreateExamInputSchema>;
export type UpdateExamInput = z.infer<typeof UpdateExamInputSchema>;
export type CreateGradeInput = z.infer<typeof CreateGradeInputSchema>;
export type UpdateGradeInput = z.infer<typeof UpdateGradeInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileInputSchema>;