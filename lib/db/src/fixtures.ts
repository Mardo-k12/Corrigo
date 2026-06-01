// lib/db/src/fixtures.ts - Test fixtures for E2E tests

export const testFixtures = {
  validExamImage: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  
  users: {
    teacher: {
      email: "teacher@test.local",
      password: "TestPassword123!",
      name: "Test Teacher",
    },
    student: {
      email: "student@test.local",
      password: "StudentPass123!",
      name: "Test Student",
    },
  },

  courses: {
    math101: {
      name: "Mathematics 101",
      code: "MATH101",
      description: "Introduction to Mathematics",
    },
    physics101: {
      name: "Physics 101",
      code: "PHYS101",
      description: "Introduction to Physics",
    },
  },

  exams: {
    midterm: {
      title: "Midterm Exam",
      description: "Midterm examination",
      totalPoints: 100,
      passingScore: 60,
    },
    final: {
      title: "Final Exam",
      description: "Final examination",
      totalPoints: 100,
      passingScore: 70,
    },
  },
};

// Function to reset fixtures for each test
export function resetFixtures() {
  return JSON.parse(JSON.stringify(testFixtures));
}
