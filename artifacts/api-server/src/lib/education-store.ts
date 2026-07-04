import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import {
  type CourseDto,
  type CreateCourseInput,
  type CreateExamInput,
  type CreateGradeInput,
  type CreateStudentInput,
  type CreateUserInput,
  type ExamDto,
  type GradeDto,
  type LoginInput,
  type RegisterInput,
  type StudentDto,
  type UpdateCourseInput,
  type UpdateGradeInput,
  type UpdateStudentInput,
  type UpdateExamInput,
  type UpdateUserProfileInput,
  type UserDto,
} from "@workspace/api-zod";
import {
  courses,
  db,
  exams,
  grades,
  hasDatabaseConfig,
  seedData,
  students,
  users,
} from "@workspace/db";

type GradeFilters = {
  courseId?: string;
  studentId?: string;
  examId?: string;
};

type ExamFilters = {
  courseId?: string;
};

type UserRecord = {
  id: string;
  email: string;
  name: string;
  institution: string | null;
  role: string;
  passwordHash: string;
  salt: string;
  createdAt: Date | string;
};

type CourseRecord = {
  id: string;
  userId: string;
  title: string;
  subject: string;
  semester: string;
  description: string;
  content: string;
  summary?: string | null;
  createdAt: Date | string;
};

type StudentRecord = {
  id: string;
  courseId: string;
  firstName: string;
  lastName: string;
  matricule: string;
  createdAt: Date | string;
};

type ExamRecord = {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  totalPoints: number;
  durationMinutes: number;
  difficulty: string;
  type: string;
  questions: ExamDto["questions"];
  createdAt: Date | string;
};

type GradeRecord = {
  id: string;
  courseId: string;
  studentId?: string | null;
  examId?: string | null;
  scannedText: string;
  imageUri?: string | null;
  score: number;
  maxScore: number;
  appreciation: string;
  strengths: string[];
  weaknesses: string[];
  suggestion: string;
  validated: boolean;
  createdAt: Date | string;
};

const memoryState = {
  users: [...seedData.users] as UserRecord[],
  courses: [...seedData.courses] as CourseRecord[],
  students: [...seedData.students] as StudentRecord[],
  exams: [...seedData.exams] as ExamRecord[],
  grades: [...seedData.grades] as GradeRecord[],
};

function toIsoDate(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toUserDto(record: UserRecord): UserDto {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    institution: record.institution ?? null,
    role: record.role === "admin" ? "admin" : "teacher",
    createdAt: toIsoDate(record.createdAt),
  };
}

function hashPassword(password: string, salt: string): string {
  const input = `${salt}::${password}::sg-upc`;
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let h2 = 0xcbf29ce4;
  for (let i = input.length - 1; i >= 0; i--) {
    h2 ^= input.charCodeAt(i);
    h2 = Math.imul(h2, 0x100000001b3) >>> 0;
  }
  return h.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

function toCourseDto(record: CourseRecord): CourseDto {
  return {
    id: record.id,
    userId: record.userId,
    title: record.title,
    subject: record.subject,
    semester: record.semester,
    description: record.description,
    content: record.content,
    summary: record.summary ?? null,
    createdAt: toIsoDate(record.createdAt),
  };
}

function toStudentDto(record: StudentRecord): StudentDto {
  return {
    id: record.id,
    courseId: record.courseId,
    firstName: record.firstName,
    lastName: record.lastName,
    matricule: record.matricule,
    createdAt: toIsoDate(record.createdAt),
  };
}

function toExamDto(record: ExamRecord): ExamDto {
  return {
    id: record.id,
    courseId: record.courseId,
    title: record.title,
    instructions: record.instructions,
    totalPoints: record.totalPoints,
    durationMinutes: record.durationMinutes,
    difficulty:
      record.difficulty === "facile" || record.difficulty === "difficile"
        ? record.difficulty
        : "moyen",
    type:
      record.type === "qcm" || record.type === "ouvert"
        ? record.type
        : "mixte",
    questions: record.questions,
    createdAt: toIsoDate(record.createdAt),
  };
}

function toGradeDto(record: GradeRecord): GradeDto {
  return {
    id: record.id,
    courseId: record.courseId,
    studentId: record.studentId ?? null,
    examId: record.examId ?? null,
    scannedText: record.scannedText,
    imageUri: record.imageUri ?? null,
    score: record.score,
    maxScore: record.maxScore,
    appreciation: record.appreciation,
    strengths: record.strengths,
    weaknesses: record.weaknesses,
    suggestion: record.suggestion,
    validated: record.validated,
    createdAt: toIsoDate(record.createdAt),
  };
}

export const educationStore = {
  async getUserById(id: string): Promise<UserDto | null> {
    if (hasDatabaseConfig && db) {
      const [row] = await db.select().from(users).where(eq(users.id, id));
      return row ? toUserDto(row) : null;
    }
    const row = memoryState.users.find((user) => user.id === id);
    return row ? toUserDto(row) : null;
  },

  async registerUser(input: RegisterInput): Promise<UserDto> {
    const cleanEmail = input.email.trim().toLowerCase();
    const salt = randomUUID();
    const record = {
      id: randomUUID(),
      email: cleanEmail,
      name: input.name.trim(),
      institution: input.institution?.trim() || "UPC - Université Protestante au Congo",
      role: "teacher",
      passwordHash: hashPassword(input.password, salt),
      salt,
      createdAt: new Date(),
    };

    if (hasDatabaseConfig && db) {
      const existing = await db.select().from(users).where(eq(users.email, cleanEmail));
      if (existing.length > 0) {
        throw new Error("Un compte existe déjà pour cet email");
      }
      const [inserted] = await db.insert(users).values(record).returning();
      return toUserDto(inserted);
    }

    if (memoryState.users.some((user) => user.email === cleanEmail)) {
      throw new Error("Un compte existe déjà pour cet email");
    }
    memoryState.users.unshift(record);
    return toUserDto(record);
  },

  async loginUser(input: LoginInput): Promise<UserDto> {
    const cleanEmail = input.email.trim().toLowerCase();
    const rows = hasDatabaseConfig && db
      ? await db.select().from(users).where(eq(users.email, cleanEmail))
      : memoryState.users.filter((user) => user.email === cleanEmail);
    const found = rows[0];
    if (!found) {
      throw new Error("Aucun compte trouvé pour cet email");
    }
    if (found.passwordHash !== hashPassword(input.password, found.salt)) {
      throw new Error("Mot de passe incorrect");
    }
    return toUserDto(found);
  },

  async listUsers(): Promise<UserDto[]> {
    if (hasDatabaseConfig && db) {
      const rows = await db.select().from(users).orderBy(desc(users.createdAt));
      return rows.map(toUserDto);
    }
    return memoryState.users.map(toUserDto);
  },

  async createUser(input: CreateUserInput): Promise<UserDto> {
    const record = {
      id: randomUUID(),
      email: input.email,
      name: input.name,
      institution: input.institution ?? null,
      role: input.role,
      passwordHash: hashPassword(randomUUID(), randomUUID()),
      salt: randomUUID(),
      createdAt: new Date(),
    };

    if (hasDatabaseConfig && db) {
      const [inserted] = await db.insert(users).values(record).returning();
      return toUserDto(inserted);
    }

    memoryState.users.unshift(record);
    return toUserDto(record);
  },

  async listCourses(userId?: string): Promise<CourseDto[]> {
    if (hasDatabaseConfig && db) {
      const query = db.select().from(courses);
      const rows = userId
        ? await query.where(eq(courses.userId, userId)).orderBy(desc(courses.createdAt))
        : await query.orderBy(desc(courses.createdAt));
      return rows.map(toCourseDto);
    }

    return memoryState.courses
      .filter((course) => (userId ? course.userId === userId : true))
      .map(toCourseDto);
  },

  async createCourse(input: CreateCourseInput): Promise<CourseDto> {
    const record = {
      id: randomUUID(),
      userId: input.userId,
      title: input.title,
      subject: input.subject,
      semester: input.semester,
      description: input.description,
      content: input.content,
      summary: input.summary ?? null,
      createdAt: new Date(),
    };

    if (hasDatabaseConfig && db) {
      const [inserted] = await db.insert(courses).values(record).returning();
      return toCourseDto(inserted);
    }

    memoryState.courses.unshift(record);
    return toCourseDto(record);
  },

  async updateCourse(id: string, patch: UpdateCourseInput): Promise<CourseDto | null> {
    if (hasDatabaseConfig && db) {
      const [updated] = await db.update(courses).set(patch).where(eq(courses.id, id)).returning();
      return updated ? toCourseDto(updated) : null;
    }
    const index = memoryState.courses.findIndex((course) => course.id === id);
    if (index === -1) return null;
    const next = { ...memoryState.courses[index], ...patch };
    memoryState.courses[index] = next;
    return toCourseDto(next);
  },

  async deleteCourse(id: string): Promise<boolean> {
    if (hasDatabaseConfig && db) {
      const deleted = await db.delete(courses).where(eq(courses.id, id)).returning({ id: courses.id });
      return deleted.length > 0;
    }
    const before = memoryState.courses.length;
    memoryState.courses = memoryState.courses.filter((course) => course.id !== id);
    memoryState.students = memoryState.students.filter((student) => student.courseId !== id);
    memoryState.exams = memoryState.exams.filter((exam) => exam.courseId !== id);
    memoryState.grades = memoryState.grades.filter((grade) => grade.courseId !== id);
    return memoryState.courses.length !== before;
  },

  async listStudents(courseId: string): Promise<StudentDto[]> {
    if (hasDatabaseConfig && db) {
      const rows = await db
        .select()
        .from(students)
        .where(eq(students.courseId, courseId))
        .orderBy(students.lastName, students.firstName);
      return rows.map(toStudentDto);
    }

    return memoryState.students
      .filter((student) => student.courseId === courseId)
      .map(toStudentDto);
  },

  async createStudent(input: CreateStudentInput): Promise<StudentDto> {
    const record = {
      id: randomUUID(),
      courseId: input.courseId,
      firstName: input.firstName,
      lastName: input.lastName,
      matricule: input.matricule,
      createdAt: new Date(),
    };

    if (hasDatabaseConfig && db) {
      const [inserted] = await db.insert(students).values(record).returning();
      return toStudentDto(inserted);
    }

    memoryState.students.push(record);
    return toStudentDto(record);
  },

  async updateStudent(id: string, patch: UpdateStudentInput): Promise<StudentDto | null> {
    if (hasDatabaseConfig && db) {
      const [updated] = await db.update(students).set(patch).where(eq(students.id, id)).returning();
      return updated ? toStudentDto(updated) : null;
    }
    const index = memoryState.students.findIndex((student) => student.id === id);
    if (index === -1) return null;
    const next = { ...memoryState.students[index], ...patch };
    memoryState.students[index] = next;
    return toStudentDto(next);
  },

  async deleteStudent(id: string): Promise<boolean> {
    if (hasDatabaseConfig && db) {
      const deleted = await db.delete(students).where(eq(students.id, id)).returning({ id: students.id });
      return deleted.length > 0;
    }
    const before = memoryState.students.length;
    memoryState.students = memoryState.students.filter((student) => student.id !== id);
    memoryState.grades = memoryState.grades.map((grade) =>
      grade.studentId === id ? { ...grade, studentId: null } : grade,
    );
    return memoryState.students.length !== before;
  },

  async listExams(filters: ExamFilters = {}): Promise<ExamDto[]> {
    if (hasDatabaseConfig && db) {
      const query = db.select().from(exams);
      const rows = filters.courseId
        ? await query.where(eq(exams.courseId, filters.courseId)).orderBy(desc(exams.createdAt))
        : await query.orderBy(desc(exams.createdAt));
      return rows.map(toExamDto);
    }

    return memoryState.exams
      .filter((exam) => (filters.courseId ? exam.courseId === filters.courseId : true))
      .map(toExamDto);
  },

  async createExam(input: CreateExamInput): Promise<ExamDto> {
    const record = {
      id: randomUUID(),
      courseId: input.courseId,
      title: input.title,
      instructions: input.instructions,
      totalPoints: input.totalPoints,
      durationMinutes: input.durationMinutes,
      difficulty: input.difficulty,
      type: input.type,
      questions: input.questions,
      createdAt: new Date(),
    };

    if (hasDatabaseConfig && db) {
      const [inserted] = await db.insert(exams).values(record).returning();
      return toExamDto(inserted);
    }

    memoryState.exams.unshift(record);
    return toExamDto(record);
  },

  async updateExam(id: string, patch: UpdateExamInput): Promise<ExamDto | null> {
    if (hasDatabaseConfig && db) {
      const [updated] = await db.update(exams).set(patch).where(eq(exams.id, id)).returning();
      return updated ? toExamDto(updated) : null;
    }
    const index = memoryState.exams.findIndex((exam) => exam.id === id);
    if (index === -1) return null;
    const next = { ...memoryState.exams[index], ...patch };
    memoryState.exams[index] = next;
    return toExamDto(next);
  },

  async deleteExam(id: string): Promise<boolean> {
    if (hasDatabaseConfig && db) {
      const deleted = await db.delete(exams).where(eq(exams.id, id)).returning({ id: exams.id });
      return deleted.length > 0;
    }
    const before = memoryState.exams.length;
    memoryState.exams = memoryState.exams.filter((exam) => exam.id !== id);
    memoryState.grades = memoryState.grades.map((grade) =>
      grade.examId === id ? { ...grade, examId: null } : grade,
    );
    return memoryState.exams.length !== before;
  },

  async listGrades(filters: GradeFilters = {}): Promise<GradeDto[]> {
    if (hasDatabaseConfig && db) {
      const conditions = [
        filters.courseId ? eq(grades.courseId, filters.courseId) : undefined,
        filters.studentId ? eq(grades.studentId, filters.studentId) : undefined,
        filters.examId ? eq(grades.examId, filters.examId) : undefined,
      ].filter(Boolean);

      const query = db.select().from(grades);
      const whereClause =
        conditions.length === 0
          ? undefined
          : conditions.length === 1
            ? conditions[0]
            : and(...conditions);

      const rows = whereClause
        ? await query.where(whereClause).orderBy(desc(grades.createdAt))
        : await query.orderBy(desc(grades.createdAt));
      return rows.map(toGradeDto);
    }

    return memoryState.grades
      .filter((grade) => {
        if (filters.courseId && grade.courseId !== filters.courseId) return false;
        if (filters.studentId && grade.studentId !== filters.studentId) return false;
        if (filters.examId && grade.examId !== filters.examId) return false;
        return true;
      })
      .map(toGradeDto);
  },

  async createGrade(input: CreateGradeInput): Promise<GradeDto> {
    const record = {
      id: randomUUID(),
      courseId: input.courseId,
      studentId: input.studentId ?? null,
      examId: input.examId ?? null,
      scannedText: input.scannedText,
      imageUri: input.imageUri ?? null,
      score: input.score,
      maxScore: input.maxScore,
      appreciation: input.appreciation,
      strengths: input.strengths,
      weaknesses: input.weaknesses,
      suggestion: input.suggestion,
      validated: input.validated ?? false,
      createdAt: new Date(),
    };

    if (hasDatabaseConfig && db) {
      const [inserted] = await db.insert(grades).values(record).returning();
      return toGradeDto(inserted);
    }

    memoryState.grades.unshift(record);
    return toGradeDto(record);
  },

  async updateGrade(id: string, patch: UpdateGradeInput): Promise<GradeDto | null> {
    if (hasDatabaseConfig && db) {
      const [updated] = await db
        .update(grades)
        .set({
          ...patch,
          studentId: patch.studentId ?? undefined,
          examId: patch.examId ?? undefined,
          imageUri: patch.imageUri ?? undefined,
        })
        .where(eq(grades.id, id))
        .returning();

      return updated ? toGradeDto(updated) : null;
    }

    const index = memoryState.grades.findIndex((grade) => grade.id === id);
    if (index === -1) {
      return null;
    }

    const current = memoryState.grades[index];
    const next = {
      ...current,
      ...patch,
      studentId: patch.studentId ?? current.studentId,
      examId: patch.examId ?? current.examId,
      imageUri: patch.imageUri ?? current.imageUri,
    };
    memoryState.grades[index] = next;
    return toGradeDto(next);
  },

  async deleteGrade(id: string): Promise<boolean> {
    if (hasDatabaseConfig && db) {
      const deleted = await db.delete(grades).where(eq(grades.id, id)).returning({ id: grades.id });
      return deleted.length > 0;
    }
    const before = memoryState.grades.length;
    memoryState.grades = memoryState.grades.filter((grade) => grade.id !== id);
    return memoryState.grades.length !== before;
  },

  async updateUserProfile(id: string, patch: UpdateUserProfileInput): Promise<UserDto | null> {
    if (hasDatabaseConfig && db) {
      const [updated] = await db.update(users).set(patch).where(eq(users.id, id)).returning();
      return updated ? toUserDto(updated) : null;
    }
    const index = memoryState.users.findIndex((user) => user.id === id);
    if (index === -1) return null;
    const next = { ...memoryState.users[index], ...patch };
    memoryState.users[index] = next;
    return toUserDto(next);
  },
};