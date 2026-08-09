"use server";

import { redirect } from "next/navigation";
import { clearResetToken, getAdmin, saveAdmin } from "@/lib/admin-store";
import { hashPassword } from "@/lib/auth";

export interface ResetState {
  error?: string;
}

export async function resetAction(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirm) {
    return { error: "The two passwords don't match." };
  }

  const admin = await getAdmin();
  if (
    !admin.reset ||
    admin.reset.token !== token ||
    admin.reset.expiresAt < Date.now()
  ) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const { salt, hash } = hashPassword(password);
  await saveAdmin({ passwordSalt: salt, passwordHash: hash });
  await clearResetToken();

  redirect("/admin/login?reset=1");
}
