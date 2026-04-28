export type User = {
  id: string;
  email: string;
  name: string;
  institution?: string;
  createdAt: number;
};

export type Course = {
  id: string;
  userId: string;
  title: string;
  subject: string;
  semester: string;
  description: string;
  content: string;
  summary?: string;
  createdAt: number;
};

export type Student = {
  id: string;
  courseId: string;
  firstName: string;
  lastName: string;
  matricule: string;
  createdAt: number;
};

export type ExamQuestion = {
  type: "qcm" | "ouvert";
  statement: string;
  points: number;
  options?: string[];
  answer?: string;
};

export type Exam = {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  totalPoints: number;
  durationMinutes: number;
  difficulty: "facile" | "moyen" | "difficile";
  type: "qcm" | "ouvert" | "mixte";
  questions: ExamQuestion[];
  createdAt: number;
};

export type Grade = {
  id: string;
  courseId: string;
  studentId?: string;
  examId?: string;
  scannedText: string;
  imageUri?: string;
  score: number;
  maxScore: number;
  appreciation: string;
  strengths: string[];
  weaknesses: string[];
  suggestion: string;
  validated: boolean;
  createdAt: number;
};
