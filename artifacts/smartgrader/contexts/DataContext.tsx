import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createCourse as createCourseRequest,
  createExam as createExamRequest,
  createGrade as createGradeRequest,
  createStudent as createStudentRequest,
  deleteCourse as deleteCourseRequest,
  deleteExam as deleteExamRequest,
  deleteGrade as deleteGradeRequest,
  deleteStudent as deleteStudentRequest,
  listCourses,
  listExams,
  listGrades,
  listStudents,
  updateCourse as updateCourseRequest,
  updateGrade as updateGradeRequest,
  updateStudent as updateStudentRequest,
} from "@/lib/api";
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
    let cancelled = false;

    async function syncOnUserChange() {
      if (!userId) {
        setAllCourses([]);
        setAllStudents([]);
        setAllExams([]);
        setAllGrades([]);
        setReady(true);
        return;
      }

      setReady(false);
      const coursesData = await listCourses(userId);
      const nested = await Promise.all(
        coursesData.map(async (course) => {
          const [courseStudents, courseExams, courseGrades] = await Promise.all([
            listStudents(course.id),
            listExams(course.id),
            listGrades({ courseId: course.id }),
          ]);
          return { courseStudents, courseExams, courseGrades };
        }),
      );

      if (cancelled) return;

      setAllCourses(coursesData);
      setAllStudents(nested.flatMap((item) => item.courseStudents));
      setAllExams(nested.flatMap((item) => item.courseExams));
      setAllGrades(nested.flatMap((item) => item.courseGrades));
      setReady(true);
    }

    void syncOnUserChange();

    return () => {
      cancelled = true;
    };
  }, [userId]);

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

  // Courses
  const addCourse = useCallback(
    async (input: Omit<Course, "id" | "userId" | "createdAt">) => {
      if (!userId) throw new Error("Non authentifié");
      const course = await createCourseRequest({ ...input, userId });
      setAllCourses((prev) => [course, ...prev]);
      return course;
    },
    [userId],
  );

  const updateCourse = useCallback(
    async (id: string, patch: Partial<Course>) => {
      const updated = await updateCourseRequest(id, patch);
      setAllCourses((prev) => prev.map((course) => (course.id === id ? updated : course)));
    },
    [],
  );

  const deleteCourse = useCallback(
    async (id: string) => {
      await deleteCourseRequest(id);
      setAllCourses((prev) => prev.filter((course) => course.id !== id));
      setAllStudents((prev) => prev.filter((student) => student.courseId !== id));
      setAllExams((prev) => prev.filter((exam) => exam.courseId !== id));
      setAllGrades((prev) => prev.filter((grade) => grade.courseId !== id));
    },
    [],
  );

  // Students
  const studentsByCourse = useCallback(
    (courseId: string) => students.filter((s) => s.courseId === courseId).sort((a, b) => a.lastName.localeCompare(b.lastName)),
    [students],
  );

  const addStudent = useCallback(
    async (input: Omit<Student, "id" | "createdAt">) => {
      const student = await createStudentRequest(input);
      setAllStudents((prev) => [...prev, student]);
      return student;
    },
    [],
  );

  const addStudentsBulk = useCallback(
    async (courseId: string, items: { firstName: string; lastName: string; matricule: string }[]) => {
      const created = await Promise.all(
        items.map((item) => createStudentRequest({ courseId, ...item })),
      );
      setAllStudents((prev) => [...prev, ...created]);
    },
    [],
  );

  const updateStudent = useCallback(
    async (id: string, patch: Partial<Student>) => {
      const updated = await updateStudentRequest(id, patch);
      setAllStudents((prev) => prev.map((student) => (student.id === id ? updated : student)));
    },
    [],
  );

  const deleteStudent = useCallback(
    async (id: string) => {
      await deleteStudentRequest(id);
      setAllStudents((prev) => prev.filter((student) => student.id !== id));
      setAllGrades((prev) => prev.map((grade) => (grade.studentId === id ? { ...grade, studentId: undefined } : grade)));
    },
    [],
  );

  // Exams
  const examsByCourse = useCallback(
    (courseId: string) => exams.filter((e) => e.courseId === courseId),
    [exams],
  );

  const addExam = useCallback(
    async (input: Omit<Exam, "id" | "createdAt">) => {
      const exam = await createExamRequest(input);
      setAllExams((prev) => [exam, ...prev]);
      return exam;
    },
    [],
  );

  const deleteExam = useCallback(
    async (id: string) => {
      await deleteExamRequest(id);
      setAllExams((prev) => prev.filter((exam) => exam.id !== id));
      setAllGrades((prev) => prev.map((grade) => (grade.examId === id ? { ...grade, examId: undefined } : grade)));
    },
    [],
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
      const grade = await createGradeRequest(input);
      setAllGrades((prev) => [grade, ...prev]);
      return grade;
    },
    [],
  );

  const updateGrade = useCallback(
    async (id: string, patch: Partial<Grade>) => {
      const updated = await updateGradeRequest(id, patch);
      setAllGrades((prev) => prev.map((grade) => (grade.id === id ? updated : grade)));
    },
    [],
  );

  const deleteGrade = useCallback(
    async (id: string) => {
      await deleteGradeRequest(id);
      setAllGrades((prev) => prev.filter((grade) => grade.id !== id));
    },
    [],
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
