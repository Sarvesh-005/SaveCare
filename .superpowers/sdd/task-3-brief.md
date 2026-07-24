### Task 3: DB schema + connection + migrate

**Files:**
- Create: `scripts/schema.sql`, `api/lib/db.ts`, `scripts/migrate.ts`

**Interfaces:**
- Produces: `pool` and `query(text, params)` from `api/lib/db.ts`. `schema.sql` creates all tables. `npm run db:migrate` applies it idempotently.

- [ ] **Step 1: Create `scripts/schema.sql`**

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin','doctor','receptionist')),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialization text NOT NULL,
  email text,
  phone text,
  consultation_fee_cents integer NOT NULL DEFAULT 0,
  available_days text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male','female','other')),
  phone text,
  email text,
  address text,
  blood_group text,
  allergies text,
  emergency_contact text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','no_show')),
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  visit_date timestamptz NOT NULL DEFAULT now(),
  chief_complaint text,
  diagnosis text,
  treatment text,
  prescription text,
  vitals jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','paid','partial','refunded')),
  paid_amount_cents integer NOT NULL DEFAULT 0,
  method text CHECK (method IN ('cash','card','insurance')),
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

CREATE TABLE IF NOT EXISTS migrations (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
```

- [ ] **Step 2: Create `api/lib/db.ts`**

```ts
import { Pool, QueryResult, QueryResultRow } from 'pg';

if (!process.env.DATABASE_URL) {
  // Defer hard failure until first query so tests that don't touch the DB still load.
  console.warn('DATABASE_URL is not set; DB queries will fail.');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 10,
});

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params as never);
}
```

- [ ] **Step 3: Create `scripts/migrate.ts`**

```ts
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../api/lib/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

async function main() {
  await pool.query(schema);
  await pool.query(
    `INSERT INTO migrations (name) VALUES ('001-init') ON CONFLICT (name) DO NOTHING`
  );
  console.log('Migration complete.');
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 4: Verify migrate runs (requires DATABASE_URL)**

Run: `cp .env.example .env` then fill `DATABASE_URL`, then `npm run db:migrate`
Expected: prints "Migration complete." and tables exist in the DB.

(If no DB available yet, note this and proceed — migrate is exercised for real in Task 4/seed.)

- [ ] **Step 5: Commit**

```bash
git add scripts/schema.sql api/lib/db.ts scripts/migrate.ts && git commit -m "feat(db): schema, pool, migrate script"
```

---

