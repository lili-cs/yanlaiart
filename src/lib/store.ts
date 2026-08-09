import fs from "node:fs";
import path from "node:path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Storage backends, in priority order:
 *   1. Neon Postgres  — if DATABASE_URL / POSTGRES_URL is set
 *   2. Vercel KV      — if KV_REST_API_URL + KV_REST_API_TOKEN are set
 *   3. JSON files     — under ./data, for local dev without a DB
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
let ensureTablePromise: Promise<void> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!sqlClient) {
    sqlClient = neon(PG_URL!);
  }
  return sqlClient;
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
      // Reset so the next call retries, otherwise a single startup failure
      // would poison the whole process.
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
  // Neon returns JSONB as already-parsed objects.
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

/* ---- Public API ---------------------------------------------------- */

export async function readStore<T>(key: string): Promise<T | null> {
  if (USE_PG) {
    return pgGet<T>(key);
  }
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

export const storageBackend: "neon-postgres" | "vercel-kv" | "json-file" = USE_PG
  ? "neon-postgres"
  : USE_KV
    ? "vercel-kv"
    : "json-file";
