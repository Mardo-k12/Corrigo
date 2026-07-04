import { boolean, doublePrecision, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { courses } from "./courses";
import { exams } from "./exams";
import { students } from "./students";

export const grades = pgTable("grades", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  studentId: text("student_id").references(() => students.id, { onDelete: "set null" }),
  examId: text("exam_id").references(() => exams.id, { onDelete: "set null" }),
  scannedText: text("scanned_text").notNull(),
  imageUri: text("image_uri"),
  score: doublePrecision("score").notNull(),
  maxScore: doublePrecision("max_score").notNull(),
  appreciation: text("appreciation").notNull(),
  strengths: jsonb("strengths").$type<string[]>().notNull(),
  weaknesses: jsonb("weaknesses").$type<string[]>().notNull(),
  suggestion: text("suggestion").notNull(),
  validated: boolean("validated").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertGradeSchema = createInsertSchema(grades).omit({
  createdAt: true,
});

export type Grade = typeof grades.$inferSelect;
export type InsertGrade = z.infer<typeof insertGradeSchema>;