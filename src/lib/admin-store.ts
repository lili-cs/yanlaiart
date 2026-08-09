import { readStore, updateStore } from "./store";
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
  /** Unix ms of the last forgot-password request (throttle). */
  lastResetRequestedAt?: number;
}

function defaultUsername(): string {
  return process.env.ADMIN_USERNAME ?? "yanlaiart";
}

function defaultInitialPassword(): string {
  return process.env.ADMIN_INITIAL_PASSWORD ?? "yichen";
}

function seedRecord(): AdminRecord {
  const { salt, hash } = hashPassword(defaultInitialPassword());
  return {
    username: defaultUsername(),
    passwordSalt: salt,
    passwordHash: hash,
  };
}

export async function getAdmin(): Promise<AdminRecord> {
  const existing = await readStore<AdminRecord>(KEY);
  if (existing && typeof existing === "object" && existing.username) {
    return existing;
  }
  return updateStore<AdminRecord>(KEY, (current) => {
    if (current && typeof current === "object" && current.username) {
      return current;
    }
    return seedRecord();
  });
}

/**
 * Atomically mutate the admin record. Prefer this over saveAdmin() for any
 * change that depends on the current value (e.g. rate-limit checks).
 */
export async function mutateAdmin(
  mutator: (current: AdminRecord) => AdminRecord | Promise<AdminRecord>
): Promise<AdminRecord> {
  return updateStore<AdminRecord>(KEY, async (current) => {
    const base =
      current && typeof current === "object" && current.username
        ? current
        : seedRecord();
    return mutator(base);
  });
}

export async function saveAdmin(patch: Partial<AdminRecord>): Promise<AdminRecord> {
  return mutateAdmin((current) => ({ ...current, ...patch }));
}

export async function clearResetToken(): Promise<void> {
  await mutateAdmin((current) => {
    if (!current.reset) return current;
    const next = { ...current };
    delete next.reset;
    return next;
  });
}
