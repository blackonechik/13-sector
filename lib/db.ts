import { Pool, PoolClient, QueryResultRow } from 'pg';

declare global {
  var __appPool: Pool | undefined;
  var __appDbInitPromise: Promise<void> | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL ?? 'postgres://postgres:postgres@127.0.0.1:5432/postgres';
  return new Pool({
    connectionString,
  });
}

export const pool = globalThis.__appPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__appPool = pool;
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      answer TEXT NOT NULL,
      author TEXT,
      status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY,
      submissions_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      submissions_start_at TIMESTAMPTZ,
      submissions_end_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_state (
      id INTEGER PRIMARY KEY,
      current_question_id TEXT REFERENCES questions(id) ON DELETE SET NULL,
      game_state TEXT NOT NULL CHECK (game_state IN ('waiting', 'selecting', 'question', 'answer', 'finished')),
      selected_index INTEGER,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    INSERT INTO app_settings (id, submissions_enabled)
    VALUES (1, TRUE)
    ON CONFLICT (id) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO game_state (id, current_question_id, game_state, selected_index)
    VALUES (1, NULL, 'waiting', NULL)
    ON CONFLICT (id) DO NOTHING;
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS questions_status_used_idx
    ON questions (status, used, created_at DESC);
  `);
}

export async function ensureDatabase() {
  if (!globalThis.__appDbInitPromise) {
    globalThis.__appDbInitPromise = initializeDatabase();
  }

  await globalThis.__appDbInitPromise;
}

export async function query<T extends QueryResultRow>(text: string, values?: unknown[]) {
  await ensureDatabase();
  return pool.query<T>(text, values);
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  await ensureDatabase();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
