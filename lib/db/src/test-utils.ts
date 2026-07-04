// lib/db/src/test-utils.ts - Test utilities for database seeding

import { courses, db, grades, hasDatabaseConfig, students, users, exams } from "./index";
import { resetFixtures, testFixtures } from "./fixtures";

export async function setupTestDatabase() {
  console.log("🔧 Setting up test database...");

  try {
    if (!hasDatabaseConfig || !db) {
      console.warn("⚠️ DATABASE_URL not configured, test database setup skipped.");
      return;
    }

    // Clear existing data
    await clearTestDatabase();

    // Seed with fixtures
    const fixtures = resetFixtures();

    await db.insert(users).values([
      {
        ...fixtures.users.teacher,
        createdAt: new Date(),
      },
      {
        ...fixtures.users.admin,
        createdAt: new Date(),
      },
    ]);

    await db.insert(courses).values([
      {
        ...fixtures.courses.math101,
        summary: null,
        createdAt: new Date(),
      },
      {
        ...fixtures.courses.physics101,
        summary: null,
        createdAt: new Date(),
      },
    ]);

    await db.insert(students).values([
      {
        ...fixtures.students.alice,
        createdAt: new Date(),
      },
    ]);

    await db.insert(exams).values([
      {
        ...fixtures.exams.midterm,
        createdAt: new Date(),
      },
      {
        ...fixtures.exams.final,
        createdAt: new Date(),
      },
    ]);

    await db.insert(grades).values([
      {
        ...fixtures.grades.sample,
        imageUri: null,
        createdAt: new Date(),
      },
    ]);

    console.log("✅ Test database setup complete");
  } catch (error) {
    console.error("❌ Test database setup failed:", error);
    throw error;
  }
}

export async function clearTestDatabase() {
  console.log("🗑️  Clearing test database...");

  try {
    if (!hasDatabaseConfig || !db) {
      console.warn("⚠️ DATABASE_URL not configured, clearTestDatabase skipped.");
      return;
    }

    await db.delete(grades);
    await db.delete(exams);
    await db.delete(students);
    await db.delete(courses);
    await db.delete(users);

    console.log("✅ Test database cleared");
  } catch (error) {
    console.error("❌ Failed to clear test database:", error);
    throw error;
  }
}

export async function resetTestDatabase() {
  await clearTestDatabase();
  await setupTestDatabase();
}

// Cypress support
export function getCypressTestFixtures() {
  return testFixtures;
}
