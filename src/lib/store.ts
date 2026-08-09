import fs from "node:fs";
import path from "node:path";
import { neon, Pool, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Storage backends, in priority order:
 *   1. Neon Postgres  — if DATABASE_URL / POSTGRES_URL is set
 *   2. Vercel KV      — if KV_REST_API_URL + KV_REST_API_TOKEN are set
 *   3. JSON files     — under ./data, for local dev without a DB
 *
 * All mutations go through updateStore(), which for Postgres uses a
 * transaction with SELECT ... FOR UPDATE so concurrent writers can't
 * lose each other's changes. For KV and JSON backends there is an
 * in-process mutex (dev-only backends, so single-process assumption).
 */

const PG_URL =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_URL_NON_POOLING ??
  null;

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

const USE_PG = Boolean(PG_URL);
const USE_KV = !USE_PG && Boolean(KV_URL && KV_TOKEN);

const DATA_DIR = path.join(process.cwd(), "data");

/* ---- Neon Postgres backend ---------------------------------------- */

let sqlClient: NeonQueryFunction<false, false> | null = null;
let pgPool: Pool | null = null;
let ensureTablePromise: Promise<void> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!sqlClient) sqlClient = neon(PG_URL!);
  return sqlClient;
}

function getPool(): Pool {
  if (!pgPool) pgPool = new Pool({ connectionString: PG_URL! });
  return pgPool;
}

async function ensureStoreTable(): Promise<void> {
  if (!ensureTablePromise) {
    const sql = getSql();
    ensureTablePromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS store (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((err) => {
      ensureTablePromise = null;
      throw err;
    });
  }
  return ensureTablePromise;
}

async function pgGet<T>(key: string): Promise<T | null> {
  await ensureStoreTable();
  const sql = getSql();
  const rows = (await sql`SELECT value FROM store WHERE key = ${key}`) as Array<{
    value: unknown;
  }>;
  if (rows.length === 0) return null;
  return rows[0].value as T;
}

async function pgSet<T>(key: string, value: T): Promise<void> {
  await ensureStoreTable();
  const sql = getSql();
  const json = JSON.stringify(value);
  await sql`
    INSERT INTO store (key, value)
    VALUES (${key}, ${json}::jsonb)
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = NOW()
  `;
}

async function pgUpdate<T>(
  key: string,
  mutator: (current: T | null) => T | Promise<T>
): Promise<T> {
  await ensureStoreTable();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    // Ensure a row exists so FOR UPDATE has something to lock (jsonb 'null'
    // is a real JSONB value distinct from SQL NULL — safe placeholder).
    await client.query(
      `INSERT INTO store (key, value) VALUES ($1, 'null'::jsonb)
       ON CONFLICT (key) DO NOTHING`,
      [key]
    );
    const { rows } = await client.query<{ value: unknown }>(
      "SELECT value FROM store WHERE key = $1 FOR UPDATE",
      [key]
    );
    const raw = rows[0]?.value;
    // Postgres returns SQL NULL as null, and our placeholder 'null'::jsonb
    // also parses as null — both mean "no value yet".
    const current = raw === null || raw === undefined ? null : (raw as T);
    const next = await mutator(current);
    await client.query(
      "UPDATE store SET value = $1::jsonb, updated_at = NOW() WHERE key = $2",
      [JSON.stringify(next), key]
    );
    await client.query("COMMIT");
    return next;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* ignore rollback failure */
    }
    throw err;
  } finally {
    client.release();
  }
}

/* ---- Vercel KV backend (Upstash Redis REST) ----------------------- */

async function upstashCommand(cmd: (string | number)[]): Promise<unknown> {
  const res = await fetch(KV_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Vercel KV error ${res.status}: ${text}`);
  }
  const data = (await res.json()) as { result: unknown };
  return data.result;
}

/* ---- Per-key mutex for non-transactional backends ---------------- */
// KV + JSON have no row lock — serialize writes to the same key in-process
// so at least single-process deployments don't lose data. Serverless with
// KV should ideally migrate to Postgres for real atomicity.

const keyLocks = new Map<string, Promise<void>>();

async function withKeyLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = keyLocks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((resolve) => {
    release = resolve;
  });
  keyLocks.set(
    key,
    prev.then(() => next)
  );
  await prev;
  try {
    return await fn();
  } finally {
    release();
    if (keyLocks.get(key) === next) keyLocks.delete(key);
  }
}

/* ---- Public API ---------------------------------------------------- */

export async function readStore<T>(key: string): Promise<T | null> {
  if (USE_PG) return pgGet<T>(key);
  if (USE_KV) {
    const result = await upstashCommand(["GET", key]);
    if (typeof result !== "string") return null;
    try {
      return JSON.parse(result) as T;
    } catch {
      return null;
    }
  }
  const file = path.join(DATA_DIR, `${key}.json`);
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Overwrite the value under `key`. Prefer updateStore() for anything that
 * depends on the previous value — writeStore() alone is racy.
 */
export async function writeStore<T>(key: string, value: T): Promise<void> {
  if (USE_PG) {
    await pgSet(key, value);
    return;
  }
  if (USE_KV) {
    await upstashCommand(["SET", key, JSON.stringify(value)]);
    return;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${key}.json`);
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

/**
 * Atomic read-modify-write. The mutator receives the current value (or null
 * if the key doesn't exist) and returns the new value. On Postgres it runs
 * inside a transaction with SELECT FOR UPDATE so concurrent callers cannot
 * lose each other's changes.
 */
export async function updateStore<T>(
  key: string,
  mutator: (current: T | null) => T | Promise<T>
): Promise<T> {
  if (USE_PG) return pgUpdate<T>(key, mutator);
  return withKeyLock(key, async () => {
    const current = await readStore<T>(key);
    const next = await mutator(current);
    await writeStore(key, next);
    return next;
  });
}

export const storageBackend: "neon-postgres" | "vercel-kv" | "json-file" = USE_PG
  ? "neon-postgres"
  : USE_KV
    ? "vercel-kv"
    : "json-file";
