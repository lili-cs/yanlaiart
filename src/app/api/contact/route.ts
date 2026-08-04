import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromAddress = process.env.CONTACT_FROM_EMAIL ?? "Yan Lai Art <onboarding@resend.dev>";

  if (!apiKey || !toEmail) {
    return NextResponse.json(
      { error: "Contact form is not configured on the server." },
      { status: 500 }
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const subject = String(payload.subject ?? "").trim();
  const message = String(payload.message ?? "").trim();
  const botcheck = String(payload.botcheck ?? "").trim();

  if (botcheck) {
    return NextResponse.json({ ok: true });
  }
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Please fill in name, email, and message." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const emailSubject = subject
    ? `[yanlaiart.com] ${subject}`
    : `[yanlaiart.com] New message from ${name}`;

  const text = [
    `From: ${name} <${email}>`,
    subject ? `Subject: ${subject}` : null,
    "",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #292524;">
      <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ""}
      <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 16px 0;" />
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `.trim();

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [toEmail],
      reply_to: email,
      subject: emailSubject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Resend send failed", res.status, detail);
    return NextResponse.json(
      { error: "We couldn't send your message. Please try again shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
