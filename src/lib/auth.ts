import crypto from "node:crypto";

const HASH_ITERATIONS = 100_000;
const HASH_KEY_LEN = 64;
const HASH_ALGO = "sha512";

export interface PasswordHash {
  salt: string;
  hash: string;
}

export function hashPassword(password: string, saltHex?: string): PasswordHash {
  const salt = saltHex ?? crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LEN, HASH_ALGO)
    .toString("hex");
  return { salt, hash };
}

export function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string
): boolean {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(expectedHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const SESSION_COOKIE_NAME = "yla_admin_session";

let devSecretWarned = false;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production") {
      // Refuse to sign/verify cookies with a known constant in production —
      // anyone with the source could forge admin sessions.
      throw new Error(
        "SESSION_SECRET is not set (or is shorter than 16 chars). Set a strong random value in the Vercel dashboard: openssl rand -base64 32"
      );
    }
    if (!devSecretWarned) {
      devSecretWarned = true;
      console.warn(
        "SESSION_SECRET is not set (or too short). Sessions will not survive restarts. Set SESSION_SECRET in .env.local."
      );
    }
    return "insecure-dev-secret-set-SESSION_SECRET-in-env";
  }
  return secret;
}

export interface SessionPayload {
  username: string;
  expiresAt: number;
}

export function signSession(username: string): string {
  const payload: SessionPayload = {
    username,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  const b64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(b64)
    .digest("base64url");
  return `${b64}.${sig}`;
}

export function verifySession(cookie: string | undefined): SessionPayload | null {
  if (!cookie) return null;
  const [b64, sig] = cookie.split(".");
  if (!b64 || !sig) return null;
  const expected = crypto
    .createHmac("sha256", getSessionSecret())
    .update(b64)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.expiresAt !== "number" || payload.expiresAt < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_TTL_MS / 1000);

/** Opaque random token for password reset links. */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/** ~1 hour reset window. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
