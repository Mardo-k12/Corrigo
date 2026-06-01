import { db } from "../index";
import { users, courses, exams, grades } from "../schema";

// Seed data for development/testing
export const seedData = {
  users: [
    {
      id: "user-1",
      email: "teacher@example.com",
      name: "John Doe",
      role: "teacher" as const,
      passwordHash: "$2a$10$...", // bcrypt hash
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "user-2",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin" as const,
      passwordHash: "$2a$10$...",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  courses: [
    {
      id: "course-1",
      teacherId: "user-1",
      name: "Mathematics 101",
      code: "MATH101",
      description: "Introduction to Calculus",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "course-2",
      teacherId: "user-1",
      name: "Physics 101",
      code: "PHYS101",
      description: "Introduction to Physics",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  exams: [
    {
      id: "exam-1",
      courseId: "course-1",
      title: "Midterm Exam",
      description: "Midterm examination",
      totalPoints: 100,
      passingScore: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "exam-2",
      courseId: "course-1",
      title: "Final Exam",
      description: "Final examination",
      totalPoints: 100,
      passingScore: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  grades: [
    {
      id: "grade-1",
      examId: "exam-1",
      studentId: "student-1",
      score: 85,
      feedback: "Great work!",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

export async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Insert users
    console.log("📝 Seeding users...");
    for (const user of seedData.users) {
      await db.insert(users).values(user).onConflictDoNothing();
    }

    // Insert courses
    console.log("📚 Seeding courses...");
    for (const course of seedData.courses) {
      await db.insert(courses).values(course).onConflictDoNothing();
    }

    // Insert exams
    console.log("📋 Seeding exams...");
    for (const exam of seedData.exams) {
      await db.insert(exams).values(exam).onConflictDoNothing();
    }

    // Insert grades
    console.log("⭐ Seeding grades...");
    for (const grade of seedData.grades) {
      await db.insert(grades).values(grade).onConflictDoNothing();
    }

    console.log("✅ Database seed completed!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
