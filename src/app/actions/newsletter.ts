"use server";

import { promises as fs } from "fs";
import path from "path";
import {
  sendSubscriptionNotificationToOwner,
  sendSubscriptionWelcomeToUser,
} from "@/lib/email";

interface SubscribeResult {
  ok: boolean;
  message: string;
}

interface SubscriberRecord {
  email: string;
  name?: string;
  phone?: string;
  interests: string[];
  message?: string;
  subscribedAt: string;
}

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");

async function loadSubscribers(): Promise<SubscriberRecord[]> {
  try {
    const raw = await fs.readFile(SUBSCRIBERS_FILE, "utf8");
    return JSON.parse(raw) as SubscriberRecord[];
  } catch {
    return [];
  }
}

async function saveSubscribers(records: SubscriberRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(SUBSCRIBERS_FILE), { recursive: true });
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(records, null, 2), "utf8");
}

export async function subscribe(formData: FormData): Promise<SubscribeResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim() || undefined;
  const phone = String(formData.get("phone") ?? "").trim() || undefined;
  const message = String(formData.get("message") ?? "").trim() || undefined;
  const interests = formData.getAll("interests").map(String);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const record: SubscriberRecord = {
    email,
    name,
    phone,
    interests: interests.length > 0 ? interests : ["all"],
    message,
    subscribedAt: new Date().toISOString(),
  };

  try {
    const existing = await loadSubscribers();
    if (existing.some((s) => s.email === email)) {
      return {
        ok: true,
        message: "You're already subscribed — thanks!",
      };
    }
    existing.push(record);
    await saveSubscribers(existing);
  } catch (err) {
    console.error("[newsletter] failed to persist subscriber:", err);
    console.log("[newsletter] subscription payload:", record);
  }

  const [ownerResult, welcomeResult] = await Promise.allSettled([
    sendSubscriptionNotificationToOwner(record),
    sendSubscriptionWelcomeToUser(record),
  ]);
  if (ownerResult.status === "rejected") {
    console.error("[newsletter] owner notification failed:", ownerResult.reason);
  }
  if (welcomeResult.status === "rejected") {
    console.error("[newsletter] welcome email failed:", welcomeResult.reason);
  }

  return {
    ok: true,
    message: "Thanks! You'll be notified about upcoming courses and events.",
  };
}
