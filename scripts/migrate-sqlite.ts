import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatabase, exec } from '../api/lib/db-sqlite.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dirname, 'schema-sqlite.sql'), 'utf8');

async function main() {
  try {
    console.log('Initializing database...');
    const db = await getDatabase();

    // Split schema into individual statements and execute
    const statements = schema.split(';').filter((s) => s.trim().length > 0);
    for (const statement of statements) {
      await exec(statement + ';');
    }

    // Record migration
    await exec(
      `INSERT OR IGNORE INTO migrations (name) VALUES ('001-init')`
    );

    console.log('✓ Migration complete.');
    console.log(`Database saved to: ${process.env.DB_PATH || './caresave/hospital.db'}`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
