import { Database } from "bun:sqlite";
import { join } from "node:path";

const DB_PATH = join(import.meta.dir, "nibble.db");

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    db = new Database(DB_PATH, { create: true });
    db.run("PRAGMA journal_mode = WAL");
    db.run("PRAGMA foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'free' CHECK(tier IN ('free', 'pro')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Add tier column to existing users (migration)
  try {
    database.run("ALTER TABLE users ADD COLUMN tier TEXT NOT NULL DEFAULT 'free'");
  } catch {
    // column already exists
  }

  database.run(`
    CREATE TABLE IF NOT EXISTS food_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      food_name TEXT NOT NULL,
      calories REAL NOT NULL DEFAULT 0,
      protein REAL NOT NULL DEFAULT 0,
      carbs REAL NOT NULL DEFAULT 0,
      fat REAL NOT NULL DEFAULT 0,
      meal_type TEXT NOT NULL DEFAULT 'snack' CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
      date TEXT NOT NULL DEFAULT (date('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      photo_url TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Add photo_url column to existing tables (ignore error if already present)
  try {
    database.run("ALTER TABLE food_entries ADD COLUMN photo_url TEXT");
  } catch {
    // column already exists, that's fine
  }

  // Add micro/macro nutrient columns (migration — ignore if already present)
  const newColumns = [
    "fiber REAL",
    "sugar REAL",
    "saturated_fat REAL",
    "sodium REAL",
    "cholesterol REAL",
  ];
  for (const col of newColumns) {
    try {
      database.run(`ALTER TABLE food_entries ADD COLUMN ${col}`);
    } catch {
      // column already exists
    }
  }

  database.run(`
    CREATE TABLE IF NOT EXISTS daily_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      calorie_goal REAL NOT NULL DEFAULT 2000,
      protein_goal REAL NOT NULL DEFAULT 150,
      carbs_goal REAL NOT NULL DEFAULT 250,
      fat_goal REAL NOT NULL DEFAULT 65,
      fiber_goal REAL DEFAULT 25,
      sugar_goal REAL DEFAULT 50,
      saturated_fat_goal REAL DEFAULT 20,
      sodium_goal REAL DEFAULT 2300,
      cholesterol_goal REAL DEFAULT 300,
      date TEXT NOT NULL DEFAULT (date('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Add new goal columns to existing daily_goals table
  const newGoalColumns = [
    "fiber_goal REAL DEFAULT 25",
    "sugar_goal REAL DEFAULT 50",
    "saturated_fat_goal REAL DEFAULT 20",
    "sodium_goal REAL DEFAULT 2300",
    "cholesterol_goal REAL DEFAULT 300",
  ];
  for (const col of newGoalColumns) {
    try {
      database.run(`ALTER TABLE daily_goals ADD COLUMN ${col}`);
    } catch {
      // column already exists
    }
  }
}

export function seed(database: Database) {
  // Ensure all existing users have a tier (migration for seeded users)
  database.run("UPDATE users SET tier = 'free' WHERE tier IS NULL OR tier = ''");

  const existing = database.query("SELECT id FROM users WHERE id = 1").get();
  if (existing) return;

  database.run(
    "INSERT INTO users (id, email, name, tier) VALUES (1, 'user@nibble.app', 'Alex', 'free')"
  );
  database.run(
    "INSERT INTO daily_goals (user_id, calorie_goal, protein_goal, carbs_goal, fat_goal) VALUES (1, 2000, 150, 250, 65)"
  );

  const today = new Date().toISOString().slice(0, 10);

  const entries = [
    { food_name: "Oatmeal with berries", calories: 320, protein: 10, carbs: 55, fat: 6, meal_type: "breakfast" },
    { food_name: "Grilled chicken salad", calories: 450, protein: 42, carbs: 12, fat: 24, meal_type: "lunch" },
    { food_name: "Protein bar", calories: 210, protein: 20, carbs: 25, fat: 7, meal_type: "snack" },
    { food_name: "Salmon with rice", calories: 580, protein: 38, carbs: 48, fat: 22, meal_type: "dinner" },
  ];

  const insert = database.prepare(
    "INSERT INTO food_entries (user_id, food_name, calories, protein, carbs, fat, meal_type, date) VALUES (1, ?, ?, ?, ?, ?, ?, ?)"
  );

  for (const e of entries) {
    insert.run(e.food_name, e.calories, e.protein, e.carbs, e.fat, e.meal_type, today);
  }
}
