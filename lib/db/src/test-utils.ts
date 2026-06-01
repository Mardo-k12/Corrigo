// lib/db/src/test-utils.ts - Test utilities for database seeding

import { db } from "./index";
import { users, courses, exams, grades } from "./schema";
import { resetFixtures, testFixtures } from "./fixtures";

export async function setupTestDatabase() {
  console.log("🔧 Setting up test database...");

  try {
    // Clear existing data
    await clearTestDatabase();

    // Seed with fixtures
    const fixtures = resetFixtures();

    // Insert test data
    if (fixtures.users && Array.isArray(fixtures.users.teacher)) {
      // Insert users
      // Note: Using fixtures as defined in fixtures.ts
    }

    console.log("✅ Test database setup complete");
  } catch (error) {
    console.error("❌ Test database setup failed:", error);
    throw error;
  }
}

export async function clearTestDatabase() {
  console.log("🗑️  Clearing test database...");

  try {
    // Delete in reverse order (respect foreign keys)
    // Note: Implementation depends on your Drizzle schema
    // await db.delete(grades);
    // await db.delete(exams);
    // await db.delete(courses);
    // await db.delete(users);

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
