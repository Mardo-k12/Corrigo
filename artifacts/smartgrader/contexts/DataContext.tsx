import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, getJSON, newId, setJSON } from "@/lib/storage";
import type { Course, Exam, Grade, Student } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

type DataContextValue = {
  ready: boolean;

  courses: Course[];
  addCourse: (input: Omit<Course, "id" | "userId" | "createdAt">) => Promise<Course>;
  updateCourse: (id: string, patch: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  students: Student[];
  studentsByCourse: (courseId: string) => Student[];
  addStudent: (input: Omit<Student, "id" | "createdAt">) => Promise<Student>;
  addStudentsBulk: (courseId: string, items: { firstName: string; lastName: string; matricule: string }[]) => Promise<void>;
  updateStudent: (id: string, patch: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  exams: Exam[];
  examsByCourse: (courseId: string) => Exam[];
  addExam: (input: Omit<Exam, "id" | "createdAt">) => Promise<Exam>;
  deleteExam: (id: string) => Promise<void>;

  grades: Grade[];
  gradesByCourse: (courseId: string) => Grade[];
  gradesByStudent: (studentId: string) => Grade[];
  addGrade: (input: Omit<Grade, "id" | "createdAt">) => Promise<Grade>;
  updateGrade: (id: string, patch: Partial<Grade>) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
  getGrade: (id: string) => Grade | undefined;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [c, s, e, g] = await Promise.all([
        getJSON<Course[]>(STORAGE_KEYS.courses, []),
        getJSON<Student[]>(STORAGE_KEYS.students, []),
        getJSON<Exam[]>(STORAGE_KEYS.exams, []),
        getJSON<Grade[]>(STORAGE_KEYS.grades, []),
      ]);
      setAllCourses(c);
      setAllStudents(s);
      setAllExams(e);
      setAllGrades(g);
      setReady(true);
    })();
  }, []);

  const courses = useMemo(
    () => (userId ? allCourses.filter((c) => c.userId === userId) : []).sort((a, b) => b.createdAt - a.createdAt),
    [allCourses, userId],
  );

  const courseIds = useMemo(() => new Set(courses.map((c) => c.id)), [courses]);

  const students = useMemo(
    () => allStudents.filter((s) => courseIds.has(s.courseId)),
    [allStudents, courseIds],
  );

  const exams = useMemo(
    () => allExams.filter((e) => courseIds.has(e.courseId)).sort((a, b) => b.createdAt - a.createdAt),
    [allExams, courseIds],
  );

  const grades = useMemo(
    () => allGrades.filter((g) => courseIds.has(g.courseId)).sort((a, b) => b.createdAt - a.createdAt),
    [allGrades, courseIds],
  );

  const persistCourses = async (next: Course[]) => {
    setAllCourses(next);
    await setJSON(STORAGE_KEYS.courses, next);
  };
  const persistStudents = async (next: Student[]) => {
    setAllStudents(next);
    await setJSON(STORAGE_KEYS.students, next);
  };
  const persistExams = async (next: Exam[]) => {
    setAllExams(next);
    await setJSON(STORAGE_KEYS.exams, next);
  };
  const persistGrades = async (next: Grade[]) => {
    setAllGrades(next);
    await setJSON(STORAGE_KEYS.grades, next);
  };

  // Courses
  const addCourse = useCallback(
    async (input: Omit<Course, "id" | "userId" | "createdAt">) => {
      if (!userId) throw new Error("Non authentifié");
      const course: Course = { ...input, id: newId(), userId, createdAt: Date.now() };
      await persistCourses([course, ...allCourses]);
      return course;
    },
    [allCourses, userId],
  );

  const updateCourse = useCallback(
    async (id: string, patch: Partial<Course>) => {
      const next = allCourses.map((c) => (c.id === id ? { ...c, ...patch } : c));
      await persistCourses(next);
    },
    [allCourses],
  );

  const deleteCourse = useCallback(
    async (id: string) => {
      await persistCourses(allCourses.filter((c) => c.id !== id));
      await persistStudents(allStudents.filter((s) => s.courseId !== id));
      await persistExams(allExams.filter((e) => e.courseId !== id));
      await persistGrades(allGrades.filter((g) => g.courseId !== id));
    },
    [allCourses, allStudents, allExams, allGrades],
  );

  // Students
  const studentsByCourse = useCallback(
    (courseId: string) => students.filter((s) => s.courseId === courseId).sort((a, b) => a.lastName.localeCompare(b.lastName)),
    [students],
  );

  const addStudent = useCallback(
    async (input: Omit<Student, "id" | "createdAt">) => {
      const student: Student = { ...input, id: newId(), createdAt: Date.now() };
      await persistStudents([...allStudents, student]);
      return student;
    },
    [allStudents],
  );

  const addStudentsBulk = useCallback(
    async (courseId: string, items: { firstName: string; lastName: string; matricule: string }[]) => {
      const now = Date.now();
      const newOnes: Student[] = items.map((it, i) => ({
        ...it,
        courseId,
        id: newId(),
        createdAt: now + i,
      }));
      await persistStudents([...allStudents, ...newOnes]);
    },
    [allStudents],
  );

  const updateStudent = useCallback(
    async (id: string, patch: Partial<Student>) => {
      await persistStudents(allStudents.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    },
    [allStudents],
  );

  const deleteStudent = useCallback(
    async (id: string) => {
      await persistStudents(allStudents.filter((s) => s.id !== id));
    },
    [allStudents],
  );

  // Exams
  const examsByCourse = useCallback(
    (courseId: string) => exams.filter((e) => e.courseId === courseId),
    [exams],
  );

  const addExam = useCallback(
    async (input: Omit<Exam, "id" | "createdAt">) => {
      const exam: Exam = { ...input, id: newId(), createdAt: Date.now() };
      await persistExams([exam, ...allExams]);
      return exam;
    },
    [allExams],
  );

  const deleteExam = useCallback(
    async (id: string) => {
      await persistExams(allExams.filter((e) => e.id !== id));
    },
    [allExams],
  );

  // Grades
  const gradesByCourse = useCallback(
    (courseId: string) => grades.filter((g) => g.courseId === courseId),
    [grades],
  );

  const gradesByStudent = useCallback(
    (studentId: string) => grades.filter((g) => g.studentId === studentId),
    [grades],
  );

  const addGrade = useCallback(
    async (input: Omit<Grade, "id" | "createdAt">) => {
      const grade: Grade = { ...input, id: newId(), createdAt: Date.now() };
      await persistGrades([grade, ...allGrades]);
      return grade;
    },
    [allGrades],
  );

  const updateGrade = useCallback(
    async (id: string, patch: Partial<Grade>) => {
      await persistGrades(allGrades.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    },
    [allGrades],
  );

  const deleteGrade = useCallback(
    async (id: string) => {
      await persistGrades(allGrades.filter((g) => g.id !== id));
    },
    [allGrades],
  );

  const getGrade = useCallback((id: string) => allGrades.find((g) => g.id === id), [allGrades]);

  const value = useMemo<DataContextValue>(
    () => ({
      ready,
      courses,
      addCourse,
      updateCourse,
      deleteCourse,
      students,
      studentsByCourse,
      addStudent,
      addStudentsBulk,
      updateStudent,
      deleteStudent,
      exams,
      examsByCourse,
      addExam,
      deleteExam,
      grades,
      gradesByCourse,
      gradesByStudent,
      addGrade,
      updateGrade,
      deleteGrade,
      getGrade,
    }),
    [
      ready,
      courses,
      addCourse,
      updateCourse,
      deleteCourse,
      students,
      studentsByCourse,
      addStudent,
      addStudentsBulk,
      updateStudent,
      deleteStudent,
      exams,
      examsByCourse,
      addExam,
      deleteExam,
      grades,
      gradesByCourse,
      gradesByStudent,
      addGrade,
      updateGrade,
      deleteGrade,
      getGrade,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
