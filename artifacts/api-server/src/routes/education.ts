import { Router, type IRouter } from "express";
import {
  CreateCourseInputSchema,
  CreateExamInputSchema,
  CreateGradeInputSchema,
  CreateStudentInputSchema,
  CreateUserInputSchema,
  LoginInputSchema,
  RegisterInputSchema,
  UpdateCourseInputSchema,
  UpdateGradeInputSchema,
  UpdateStudentInputSchema,
  UpdateExamInputSchema,
  UpdateUserProfileInputSchema,
} from "@workspace/api-zod";
import { z } from "zod";
import { educationStore } from "../lib/education-store";
import { validate, validateQuery } from "../middlewares/validate";

const router: IRouter = Router();

const listCoursesQuerySchema = z.object({
  userId: z.string().min(1).optional(),
});

const listExamsQuerySchema = z.object({
  courseId: z.string().min(1).optional(),
});

const listGradesQuerySchema = z.object({
  courseId: z.string().min(1).optional(),
  studentId: z.string().min(1).optional(),
  examId: z.string().min(1).optional(),
});

const courseIdBodySchema = CreateStudentInputSchema.omit({ courseId: true });

router.get("/users", async (_req, res, next) => {
  try {
    res.json(await educationStore.listUsers());
  } catch (error) {
    next(error);
  }
});

router.get("/users/:userId", async (req, res, next) => {
  try {
    const user = await educationStore.getUserById(String(req.params.userId ?? ""));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post("/auth/register", validate(RegisterInputSchema), async (req, res, next) => {
  try {
    const created = await educationStore.registerUser(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.post("/auth/login", validate(LoginInputSchema), async (req, res, next) => {
  try {
    const user = await educationStore.loginUser(req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:userId", validate(UpdateUserProfileInputSchema), async (req, res, next) => {
  try {
    const updated = await educationStore.updateUserProfile(String(req.params.userId ?? ""), req.body);
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.post("/users", validate(CreateUserInputSchema), async (req, res, next) => {
  try {
    const created = await educationStore.createUser(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.get("/courses", validateQuery(listCoursesQuerySchema), async (req, res, next) => {
  try {
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    res.json(await educationStore.listCourses(userId));
  } catch (error) {
    next(error);
  }
});

router.post("/courses", validate(CreateCourseInputSchema), async (req, res, next) => {
  try {
    const created = await educationStore.createCourse(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.patch("/courses/:courseId", validate(UpdateCourseInputSchema), async (req, res, next) => {
  try {
    const updated = await educationStore.updateCourse(String(req.params.courseId ?? ""), req.body);
    if (!updated) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/courses/:courseId", async (req, res, next) => {
  try {
    const ok = await educationStore.deleteCourse(String(req.params.courseId ?? ""));
    if (!ok) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/courses/:courseId/students", async (req, res, next) => {
  try {
    res.json(await educationStore.listStudents(req.params.courseId));
  } catch (error) {
    next(error);
  }
});

router.post("/courses/:courseId/students", validate(courseIdBodySchema), async (req, res, next) => {
  try {
    const created = await educationStore.createStudent({
      courseId: req.params.courseId,
      ...req.body,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.patch("/students/:studentId", validate(UpdateStudentInputSchema), async (req, res, next) => {
  try {
    const updated = await educationStore.updateStudent(String(req.params.studentId ?? ""), req.body);
    if (!updated) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/students/:studentId", async (req, res, next) => {
  try {
    const ok = await educationStore.deleteStudent(String(req.params.studentId ?? ""));
    if (!ok) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/courses/:courseId/exams", async (req, res, next) => {
  try {
    res.json(await educationStore.listExams({ courseId: req.params.courseId }));
  } catch (error) {
    next(error);
  }
});

router.get("/exams", validateQuery(listExamsQuerySchema), async (req, res, next) => {
  try {
    const courseId = typeof req.query.courseId === "string" ? req.query.courseId : undefined;
    res.json(await educationStore.listExams({ courseId }));
  } catch (error) {
    next(error);
  }
});

router.post("/exams", validate(CreateExamInputSchema), async (req, res, next) => {
  try {
    const created = await educationStore.createExam(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.patch("/exams/:examId", validate(UpdateExamInputSchema), async (req, res, next) => {
  try {
    const updated = await educationStore.updateExam(String(req.params.examId ?? ""), req.body);
    if (!updated) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/exams/:examId", async (req, res, next) => {
  try {
    const ok = await educationStore.deleteExam(String(req.params.examId ?? ""));
    if (!ok) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/grades", validateQuery(listGradesQuerySchema), async (req, res, next) => {
  try {
    const filters = {
      courseId: typeof req.query.courseId === "string" ? req.query.courseId : undefined,
      studentId: typeof req.query.studentId === "string" ? req.query.studentId : undefined,
      examId: typeof req.query.examId === "string" ? req.query.examId : undefined,
    };
    res.json(await educationStore.listGrades(filters));
  } catch (error) {
    next(error);
  }
});

router.post("/grades", validate(CreateGradeInputSchema), async (req, res, next) => {
  try {
    const created = await educationStore.createGrade(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.patch("/grades/:gradeId", validate(UpdateGradeInputSchema), async (req, res, next) => {
  try {
    const gradeId = String(req.params.gradeId ?? "");
    const updated = await educationStore.updateGrade(gradeId, req.body);
    if (!updated) {
      res.status(404).json({ error: "Grade not found" });
      return;
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/grades/:gradeId", async (req, res, next) => {
  try {
    const ok = await educationStore.deleteGrade(String(req.params.gradeId ?? ""));
    if (!ok) {
      res.status(404).json({ error: "Grade not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;