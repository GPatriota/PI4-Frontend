import * as SQLite from 'expo-sqlite';
import migration001 from './migrations/001_initial';

// ─── Migration registry ─────────────────────────────────────────────────────
// To add a new migration:
//   1. Create src/database/migrations/002_your_change.ts
//   2. Import it here and add it to this array (keep the array in order)
const migrations = [migration001];
// ────────────────────────────────────────────────────────────────────────────

const db = SQLite.openDatabaseSync('electroshop.db');

export function runMigrations() {
  // Create the migrations tracking table if it doesn't exist
  db.execSync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      name   TEXT    NOT NULL UNIQUE,
      run_at TEXT    NOT NULL
    );
  `);

  const ran = db
    .getAllSync<{ name: string }>('SELECT name FROM _migrations')
    .map((r) => r.name);

  for (const migration of migrations) {
    if (!ran.includes(migration.name)) {
      migration.up(db);
      db.runSync(
        'INSERT INTO _migrations (name, run_at) VALUES (?, ?)',
        [migration.name, new Date().toISOString()]
      );
      console.log(`[DB] Migration applied: ${migration.name}`);
    }
  }
}

export { db };
