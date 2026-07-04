import type { Course, Exam, Grade, Student, User } from "@/lib/types";

const explicitApiBase = process.env.EXPO_PUBLIC_API_BASE?.trim();
const domain = process.env.EXPO_PUBLIC_DOMAIN?.trim();

function normalizeApiBase(): string {
  if (explicitApiBase) {
    return explicitApiBase.replace(/\/+$/, "");
  }

  if (!domain) {
    return "/api";
  }

  if (/^https?:\/\//i.test(domain)) {
    return `${domain.replace(/\/+$/, "")}/api`;
  }

  const isLocalHost = /^localhost(?::\d+)?$/i.test(domain) || /^127\.0\.0\.1(?::\d+)?$/.test(domain);
  const protocol = isLocalHost ? "http" : "https";
  return `${protocol}://${domain}/api`;
}

const API_BASE = normalizeApiBase();

type JsonMethod = "GET" | "POST" | "PATCH" | "DELETE";

type UserDto = {
  id: string;
  email: string;
  name: string;
  institution?: string | null;
  createdAt: string;
};

type CourseDto = {
  id: string;
  userId: string;
  title: string;
  subject: string;
  semester: string;
  description: string;
  content: string;
  summary?: string | null;
  createdAt: string;
};

type StudentDto = {
  id: string;
  courseId: string;
  firstName: string;
  lastName: string;
  matricule: string;
  createdAt: string;
};

type ExamDto = {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  totalPoints: number;
  durationMinutes: number;
  difficulty: Exam["difficulty"];
  type: Exam["type"];
  questions: Exam["questions"];
  createdAt: string;
};

type GradeDto = {
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
  createdAt: string;
};

function toTimestamp(value: string): number {
  return new Date(value).getTime();
}

function mapUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    institution: dto.institution ?? undefined,
    createdAt: toTimestamp(dto.createdAt),
  };
}

function mapCourse(dto: CourseDto): Course {
  return {
    id: dto.id,
    userId: dto.userId,
    title: dto.title,
    subject: dto.subject,
    semester: dto.semester,
    description: dto.description,
    content: dto.content,
    summary: dto.summary ?? undefined,
    createdAt: toTimestamp(dto.createdAt),
  };
}

function mapStudent(dto: StudentDto): Student {
  return {
    id: dto.id,
    courseId: dto.courseId,
    firstName: dto.firstName,
    lastName: dto.lastName,
    matricule: dto.matricule,
    createdAt: toTimestamp(dto.createdAt),
  };
}

function mapExam(dto: ExamDto): Exam {
  return {
    id: dto.id,
    courseId: dto.courseId,
    title: dto.title,
    instructions: dto.instructions,
    totalPoints: dto.totalPoints,
    durationMinutes: dto.durationMinutes,
    difficulty: dto.difficulty,
    type: dto.type,
    questions: dto.questions,
    createdAt: toTimestamp(dto.createdAt),
  };
}

function mapGrade(dto: GradeDto): Grade {
  return {
    id: dto.id,
    courseId: dto.courseId,
    studentId: dto.studentId ?? undefined,
    examId: dto.examId ?? undefined,
    scannedText: dto.scannedText,
    imageUri: dto.imageUri ?? undefined,
    score: dto.score,
    maxScore: dto.maxScore,
    appreciation: dto.appreciation,
    strengths: dto.strengths,
    weaknesses: dto.weaknesses,
    suggestion: dto.suggestion,
    validated: dto.validated,
    createdAt: toTimestamp(dto.createdAt),
  };
}

async function requestJSON<T>(path: string, method: JsonMethod, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = String(data.error);
      if (data?.details) message += `: ${data.details}`;
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

function getJSON<T>(path: string): Promise<T> {
  return requestJSON<T>(path, "GET");
}

function postJSON<T>(path: string, body: unknown): Promise<T> {
  return requestJSON<T>(path, "POST", body);
}

function patchJSON<T>(path: string, body: unknown): Promise<T> {
  return requestJSON<T>(path, "PATCH", body);
}

function deleteJSON(path: string): Promise<void> {
  return requestJSON<void>(path, "DELETE");
}

export async function authRegister(input: {
  email: string;
  password: string;
  name: string;
  institution?: string;
}): Promise<User> {
  const dto = await postJSON<UserDto>("/auth/register", input);
  return mapUser(dto);
}

export async function authLogin(input: { email: string; password: string }): Promise<User> {
  const dto = await postJSON<UserDto>("/auth/login", input);
  return mapUser(dto);
}

export async function getUser(userId: string): Promise<User> {
  const dto = await getJSON<UserDto>(`/users/${userId}`);
  return mapUser(dto);
}

export async function updateUserProfile(
  userId: string,
  patch: Partial<Pick<User, "name" | "institution">>,
): Promise<User> {
  const dto = await patchJSON<UserDto>(`/users/${userId}`, patch);
  return mapUser(dto);
}

export async function listCourses(userId: string): Promise<Course[]> {
  const data = await getJSON<CourseDto[]>(`/courses?userId=${encodeURIComponent(userId)}`);
  return data.map(mapCourse);
}

export async function createCourse(input: Omit<Course, "id" | "createdAt">): Promise<Course> {
  const dto = await postJSON<CourseDto>("/courses", input);
  return mapCourse(dto);
}

export async function updateCourse(
  id: string,
  patch: Partial<Omit<Course, "id" | "createdAt">>,
): Promise<Course> {
  const dto = await patchJSON<CourseDto>(`/courses/${id}`, patch);
  return mapCourse(dto);
}

export async function deleteCourse(id: string): Promise<void> {
  await deleteJSON(`/courses/${id}`);
}

export async function listStudents(courseId: string): Promise<Student[]> {
  const data = await getJSON<StudentDto[]>(`/courses/${courseId}/students`);
  return data.map(mapStudent);
}

export async function createStudent(input: Omit<Student, "id" | "createdAt">): Promise<Student> {
  const dto = await postJSON<StudentDto>(`/courses/${input.courseId}/students`, {
    firstName: input.firstName,
    lastName: input.lastName,
    matricule: input.matricule,
  });
  return mapStudent(dto);
}

export async function updateStudent(
  id: string,
  patch: Partial<Omit<Student, "id" | "createdAt">>,
): Promise<Student> {
  const dto = await patchJSON<StudentDto>(`/students/${id}`, patch);
  return mapStudent(dto);
}

export async function deleteStudent(id: string): Promise<void> {
  await deleteJSON(`/students/${id}`);
}

export async function listExams(courseId?: string): Promise<Exam[]> {
  const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
  const data = await getJSON<ExamDto[]>(`/exams${query}`);
  return data.map(mapExam);
}

export async function createExam(input: Omit<Exam, "id" | "createdAt">): Promise<Exam> {
  const dto = await postJSON<ExamDto>("/exams", input);
  return mapExam(dto);
}

export async function deleteExam(id: string): Promise<void> {
  await deleteJSON(`/exams/${id}`);
}

export async function listGrades(filters: { courseId?: string; studentId?: string; examId?: string } = {}): Promise<Grade[]> {
  const query = new URLSearchParams();
  if (filters.courseId) query.set("courseId", filters.courseId);
  if (filters.studentId) query.set("studentId", filters.studentId);
  if (filters.examId) query.set("examId", filters.examId);
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const data = await getJSON<GradeDto[]>(`/grades${suffix}`);
  return data.map(mapGrade);
}

export async function createGrade(input: Omit<Grade, "id" | "createdAt">): Promise<Grade> {
  const dto = await postJSON<GradeDto>("/grades", input);
  return mapGrade(dto);
}

export async function updateGrade(
  id: string,
  patch: Partial<Omit<Grade, "id" | "createdAt">>,
): Promise<Grade> {
  const dto = await patchJSON<GradeDto>(`/grades/${id}`, patch);
  return mapGrade(dto);
}

export async function deleteGrade(id: string): Promise<void> {
  await deleteJSON(`/grades/${id}`);
}

export async function aiOcr(imageBase64: string, mimeType = "image/jpeg"): Promise<string> {
  const data = await postJSON<{ text: string }>("/ai/ocr", { imageBase64, mimeType });
  return data.text ?? "";
}

export type GradeResult = {
  score: number;
  maxScore: number;
  appreciation: string;
  strengths: string[];
  weaknesses: string[];
  suggestion: string;
};

export async function aiGrade(input: {
  studentText: string;
  courseContent: string;
  courseTitle: string;
  maxScore: number;
  questionContext?: string;
}): Promise<GradeResult> {
  return postJSON<GradeResult>("/ai/grade", input);
}

export type GeneratedExam = {
  title: string;
  instructions: string;
  totalPoints: number;
  durationMinutes: number;
  questions: Array<{
    type: "qcm" | "ouvert";
    statement: string;
    points: number;
    options?: string[];
    answer?: string;
  }>;
};

export async function aiGenerateExam(input: {
  courseContent: string;
  courseTitle: string;
  numQuestions: number;
  difficulty: "facile" | "moyen" | "difficile";
  type: "qcm" | "ouvert" | "mixte";
}): Promise<GeneratedExam> {
  return postJSON<GeneratedExam>("/ai/generate-exam", input);
}

export async function aiSummarizeCourse(content: string, title: string): Promise<string> {
  const data = await postJSON<{ summary: string }>("/ai/summarize-course", { content, title });
  return data.summary ?? "";
}
