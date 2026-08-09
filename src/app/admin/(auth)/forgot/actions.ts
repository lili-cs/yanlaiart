"use server";

import { mutateAdmin } from "@/lib/admin-store";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/auth";

/** Minimum time between two forgot-password requests. */
const RESET_THROTTLE_MS = 5 * 60 * 1000;

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface ForgotState {
  ok?: boolean;
  error?: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendResetEmail(to: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const from =
    process.env.BOOKING_FROM_EMAIL ??
    process.env.CONTACT_FROM_EMAIL ??
    "Yan Lai Art <onboarding@resend.dev>";

  const text = [
    "You (or someone) requested a password reset for the Yan Lai Art admin.",
    "",
    "Open this link within the next hour to set a new password:",
    resetUrl,
    "",
    "If you didn't request this, you can ignore this email — the link will expire on its own.",
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #292524; max-width: 560px;">
      <h2 style="margin: 0 0 12px; color: #78350f; font-size: 20px;">Reset your admin password</h2>
      <p style="margin: 0 0 12px;">You (or someone) requested a password reset for the Yan Lai Art admin.</p>
      <p style="margin: 0 0 20px;">
        <a href="${escapeHtml(resetUrl)}" style="display: inline-block; background: #1c1917; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600;">Set a new password</a>
      </p>
      <p style="margin: 0 0 12px; font-size: 13px; color: #57534e;">
        Or paste this URL into your browser: <a href="${escapeHtml(resetUrl)}" style="color: #78350f;">${escapeHtml(resetUrl)}</a>
      </p>
      <p style="margin: 0 0 12px; font-size: 13px; color: #57534e;">
        This link expires in one hour. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `.trim();

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Reset your Yan Lai Art admin password",
      html,
      text,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Reset email send failed", res.status, detail);
    throw new Error("Failed to send reset email");
  }
}

export async function forgotAction(
  prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  void prev;
  void formData;
  // The reset email always goes to the owner's registered inbox — the form
  // has nothing to spoof.
  const ownerEmail = "yichenhot@icloud.com";

  const now = Date.now();
  const token = generateResetToken();

  // Atomically check throttle and issue a new token. If the last request was
  // within the throttle window, keep the previous reset entry unchanged (so
  // any live token stays valid) and short-circuit.
  let throttled = false;
  const admin = await mutateAdmin((current) => {
    const last = current.lastResetRequestedAt ?? 0;
    if (now - last < RESET_THROTTLE_MS) {
      throttled = true;
      return current;
    }
    return {
      ...current,
      reset: { token, expiresAt: now + RESET_TOKEN_TTL_MS },
      lastResetRequestedAt: now,
    };
  });

  if (throttled) {
    // Reply generically so callers can't tell whether we sent an email —
    // prevents them from learning the throttle interval.
    return { ok: true };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/admin/reset/${admin.reset!.token}`;

  // In dev, log the URL so you can complete a reset locally without email.
  if (process.env.NODE_ENV !== "production") {
    console.log("[admin] Password reset URL (dev only):", resetUrl);
  }

  try {
    await sendResetEmail(ownerEmail, resetUrl);
  } catch (err) {
    console.error(err);
    // Don't leak whether email delivery succeeded — reply generically.
  }

  return { ok: true };
}
