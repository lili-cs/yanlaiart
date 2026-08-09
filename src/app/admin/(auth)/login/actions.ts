"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin-store";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifyPassword,
} from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Please enter your username and password." };
  }

  const admin = await getAdmin();
  const usernameOk = username === admin.username;
  const passwordOk =
    usernameOk && verifyPassword(password, admin.passwordSalt, admin.passwordHash);

  if (!passwordOk) {
    return { error: "Incorrect username or password." };
  }

  const c = await cookies();
  c.set(SESSION_COOKIE_NAME, signSession(admin.username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/admin");
}
