import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;
export type { Database };

export function initDatabase() {
  const dbPath = path.resolve(process.cwd(), 'local_data.db');
  db = new Database(dbPath);
  console.error(`Database connected at ${dbPath}`);
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  
  // Create tables here if needed in the future
  // db.exec(`
  //   CREATE TABLE IF NOT EXISTS example (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     name TEXT NOT NULL
  //   )
  // `);
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    console.error('Closing database connection...');
    db.close();
  }
}
