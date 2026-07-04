import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { courses } from "./courses";

export type ExamQuestionRecord = {
  type: "qcm" | "ouvert";
  statement: string;
  points: number;
  options?: string[];
  answer?: string;
};

export const exams = pgTable("exams", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  instructions: text("instructions").notNull(),
  totalPoints: integer("total_points").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  difficulty: text("difficulty").notNull(),
  type: text("type").notNull(),
  questions: jsonb("questions").$type<ExamQuestionRecord[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertExamSchema = createInsertSchema(exams).omit({
  createdAt: true,
});

export type Exam = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;