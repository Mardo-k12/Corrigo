import { courses, db, grades, hasDatabaseConfig, students, users, exams } from "./index";
import { seedData } from "./domain-seed";

export async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    if (!hasDatabaseConfig || !db) {
      console.warn("⚠️ DATABASE_URL not configured, skipping database seed.");
      return;
    }

    await db.delete(grades);
    await db.delete(exams);
    await db.delete(students);
    await db.delete(courses);
    await db.delete(users);

    await db.insert(users).values(seedData.users);
    await db.insert(courses).values(seedData.courses);
    await db.insert(students).values(seedData.students);
    await db.insert(exams).values(seedData.exams);
    await db.insert(grades).values(seedData.grades);

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
