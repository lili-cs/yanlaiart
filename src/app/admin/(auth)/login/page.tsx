import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

interface Props {
  searchParams: Promise<{ next?: string }>;
}

function safeNext(raw: string | undefined): string {
  if (!raw) return "/admin";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return "/admin";
  }
  if (!raw.startsWith("/admin")) return "/admin";
  return raw;
}

export default async function LoginPage({ searchParams }: Props) {
  const [{ next }, c] = await Promise.all([searchParams, cookies()]);
  const session = verifySession(c.get(SESSION_COOKIE_NAME)?.value);
  const target = safeNext(next);
  if (session) redirect(target);
  return <LoginForm nextUrl={target} />;
}
