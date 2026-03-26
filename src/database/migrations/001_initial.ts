import { SQLiteDatabase } from 'expo-sqlite';

const migration = {
  name: '001_initial',
  up: (db: SQLiteDatabase) => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS schema_info (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    db.runSync(
      `INSERT OR IGNORE INTO schema_info (key, value) VALUES ('version', '1')`
    );
  },
};

export default migration;
