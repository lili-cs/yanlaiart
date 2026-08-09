import { readStore, writeStore } from "./store";
import { hashPassword } from "./auth";

const KEY = "admin";

interface ResetTokenRecord {
  token: string;
  expiresAt: number;
}

export interface AdminRecord {
  username: string;
  passwordSalt: string;
  passwordHash: string;
  reset?: ResetTokenRecord;
}

function defaultUsername(): string {
  return process.env.ADMIN_USERNAME ?? "yanlaiart";
}

function defaultInitialPassword(): string {
  return process.env.ADMIN_INITIAL_PASSWORD ?? "yichen";
}

async function seed(): Promise<AdminRecord> {
  const { salt, hash } = hashPassword(defaultInitialPassword());
  const record: AdminRecord = {
    username: defaultUsername(),
    passwordSalt: salt,
    passwordHash: hash,
  };
  await writeStore(KEY, record);
  return record;
}

export async function getAdmin(): Promise<AdminRecord> {
  const existing = await readStore<AdminRecord>(KEY);
  if (existing) return existing;
  return seed();
}

export async function saveAdmin(patch: Partial<AdminRecord>): Promise<AdminRecord> {
  const current = await getAdmin();
  const next: AdminRecord = { ...current, ...patch };
  await writeStore(KEY, next);
  return next;
}

export async function clearResetToken(): Promise<void> {
  const current = await getAdmin();
  if (!current.reset) return;
  const next = { ...current };
  delete next.reset;
  await writeStore(KEY, next);
}
