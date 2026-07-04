// lib/db/src/fixtures.ts - Test fixtures for E2E tests

export const testFixtures = {
  validExamImage: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",

  users: {
    teacher: {
      id: "user-teacher-1",
      email: "teacher@test.local",
      name: "Test Teacher",
      institution: "UPC",
      role: "teacher",
      passwordHash: "ff41614108656761",
      salt: "fixture-teacher",
    },
    admin: {
      id: "user-admin-1",
      email: "admin@test.local",
      name: "Test Admin",
      institution: "UPC",
      role: "admin",
      passwordHash: "fbcb4f5ddf8ee0d9",
      salt: "fixture-admin",
    },
  },

  courses: {
    math101: {
      id: "course-math-101",
      userId: "user-teacher-1",
      title: "Mathématiques L2",
      subject: "Mathématiques",
      semester: "S1",
      description: "Calcul intégral et différentiel",
      content: "Limites, dérivées, intégrales et applications.",
    },
    physics101: {
      id: "course-phys-101",
      userId: "user-teacher-1",
      title: "Physique L2",
      subject: "Physique",
      semester: "S1",
      description: "Mécanique et thermodynamique",
      content: "Cinématique, dynamique et bases de la thermodynamique.",
    },
  },

  students: {
    alice: {
      id: "student-1",
      courseId: "course-math-101",
      firstName: "Alice",
      lastName: "Mukendi",
      matricule: "UPC001",
    },
  },

  exams: {
    midterm: {
      id: "exam-midterm-1",
      courseId: "course-math-101",
      title: "Midterm Exam",
      instructions: "Répondez à toutes les questions.",
      totalPoints: 20,
      durationMinutes: 120,
      difficulty: "moyen",
      type: "mixte",
      questions: [],
    },
    final: {
      id: "exam-final-1",
      courseId: "course-math-101",
      title: "Final Exam",
      instructions: "Justifiez vos réponses.",
      totalPoints: 20,
      durationMinutes: 180,
      difficulty: "difficile",
      type: "ouvert",
      questions: [],
    },
  },

  grades: {
    sample: {
      id: "grade-1",
      courseId: "course-math-101",
      studentId: "student-1",
      examId: "exam-midterm-1",
      scannedText: "Réponses OCR de démonstration",
      score: 15,
      maxScore: 20,
      appreciation: "Bonne copie dans l'ensemble.",
      strengths: ["Bonne compréhension"],
      weaknesses: ["Quelques imprécisions"],
      suggestion: "Revoir la rigueur de la démonstration.",
      validated: false,
    },
  },
};

// Function to reset fixtures for each test
export function resetFixtures() {
  return JSON.parse(JSON.stringify(testFixtures));
}
