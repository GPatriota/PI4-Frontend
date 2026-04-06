import * as SQLite from 'expo-sqlite';
import migration1 from './migrations/1-initial-structure';
import migration2 from './migrations/2-populate-initial-tables';

const migrations = [migration1, migration2];

const db = SQLite.openDatabaseSync('electroshop.db');

export function runMigrations() {
  db.execSync('PRAGMA foreign_keys = ON;');

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
