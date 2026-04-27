import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

let db: ReturnType<typeof drizzle> | null = null;

export function initDbFromEnv() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined. Set it to enable Postgres.');
  }

  const pool = new Pool({ connectionString: dbUrl });
  db = drizzle(pool, { logger: false });
  return db;
}

export function getDb() {
  if (!db) {
    return initDbFromEnv();
  }
  return db;
}
