import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = process.env.DB_PATH || join(__dirname, '../../caresave');
const DB_FILE = join(DB_DIR, 'hospital.db');

// Ensure directory exists at module load time
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

let db: any = null;
let SQL: any = null;

async function initDatabase() {
  if (!SQL) {
    SQL = await initSqlJs();
  }

  // Load existing database or create new one
  if (existsSync(DB_FILE)) {
    const buffer = readFileSync(DB_FILE);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  return db;
}

function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

export async function getDatabase() {
  if (!db) {
    await initDatabase();
  }
  return db;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const database = await getDatabase();

  try {
    // Use db.run() for modifications, db.exec() with results for queries
    const isModification = /^(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.test(sql.trim());

    if (isModification) {
      database.run(sql, params);
      saveDatabase();
      return { rows: [], rowCount: 1 };
    }

    // For SELECT queries, use db.exec()
    const results = database.exec(sql, params);
    const rows: T[] = [];

    if (results.length > 0 && results[0].values) {
      const columns = results[0].columns;
      for (const row of results[0].values) {
        const obj: any = {};
        columns.forEach((col: string, idx: number) => {
          obj[col] = row[idx];
        });
        rows.push(obj as T);
      }
    }

    return { rows, rowCount: rows.length };
  } catch (err) {
    console.error('Database query error:', sql, params, err);
    throw err;
  }
}

export async function run(sql: string, params: unknown[] = []): Promise<{ changes?: number }> {
  const database = await getDatabase();

  try {
    database.run(sql, params);
    saveDatabase();
    return { changes: 1 };
  } catch (err) {
    console.error('Database run error:', sql, params, err);
    throw err;
  }
}

export async function exec(sql: string): Promise<void> {
  const database = await getDatabase();

  try {
    database.run(sql);
    saveDatabase();
  } catch (err) {
    console.error('Database exec error:', sql, err);
    throw err;
  }
}
