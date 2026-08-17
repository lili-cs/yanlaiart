import { buildBookingIcs } from "@/lib/ics";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface BookingEmailPayload {
  itemType: "course" | "event";
  itemName: string;
  itemDetails: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  requestedDate?: string;
  requestedTime?: string;
  requestedEndTime?: string;
  notes?: string;
  amountLabel: string;
  referenceId?: string;
  isOnline?: boolean;
  meetingUrl?: string;
  meetingInstructions?: string;
  location?: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRequestedDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatRequestedTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

interface Attachment {
  filename: string;
  content: string; // base64
}

interface SendParams {
  from: string;
  to: string[];
  reply_to?: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Attachment[];
}

async function sendResendEmail(params: SendParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Resend send failed", res.status, detail);
    throw new Error("Failed to send email via Resend");
  }
}

function locationLine(p: BookingEmailPayload): string | null {
  if (p.isOnline) {
    return p.meetingUrl ? `Online — ${p.meetingUrl}` : "Online";
  }
  return p.location ?? null;
}

function buildDetailRows(p: BookingEmailPayload): Array<[string, string]> {
  const rows: Array<[string, string]> = [];
  rows.push([p.itemType === "course" ? "Course" : "Event", p.itemName]);
  if (p.itemDetails) rows.push(["Details", p.itemDetails]);
  if (p.requestedDate) rows.push(["Requested date", formatRequestedDate(p.requestedDate)]);
  if (p.requestedTime) rows.push(["Requested time", formatRequestedTime(p.requestedTime)]);
  const where = locationLine(p);
  if (where) rows.push([p.isOnline ? "Where" : "Location", where]);
  rows.push(["Amount", p.amountLabel]);
  if (p.referenceId) rows.push(["Reference", p.referenceId]);
  return rows;
}

function renderDetailsHtml(rows: Array<[string, string]>): string {
  return rows
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding: 6px 12px 6px 0; color: #78716c; font-size: 13px; vertical-align: top; white-space: nowrap;">${escapeHtml(k)}</td>
          <td style="padding: 6px 0; color: #292524; font-size: 14px; word-break: break-word;">${escapeHtml(v)}</td>
        </tr>`
    )
    .join("");
}

function renderDetailsText(rows: Array<[string, string]>): string {
  return rows.map(([k, v]) => `${k}: ${v}`).join("\n");
}

function fromAddress(): string {
  return (
    process.env.BOOKING_FROM_EMAIL ??
    process.env.CONTACT_FROM_EMAIL ??
    "Yan Lai Art <onboarding@resend.dev>"
  );
}

function buildJoinMeetingHtml(url: string, instructions?: string): string {
  const instructionsBlock = instructions
    ? `<div style="margin: 12px 0 0; padding-top: 12px; border-top: 1px dashed #99f6e4;">
         <p style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #0f766e;">Meeting details</p>
         <pre style="margin: 0; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #115e59;">${escapeHtml(instructions)}</pre>
       </div>`
    : "";
  return `
    <div style="margin: 16px 0 20px; padding: 16px; border: 1px solid #99f6e4; background: #f0fdfa; border-radius: 10px;">
      <p style="margin: 0 0 6px; font-weight: 600; color: #115e59;">Join online</p>
      <p style="margin: 0 0 12px; font-size: 13px; color: #0f766e;">
        Click below at your class time. This same link is in the calendar invite attached to this email.
      </p>
      <a href="${escapeHtml(url)}" style="display: inline-block; background: #0f766e; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Join meeting
      </a>
      <p style="margin: 12px 0 0; font-size: 12px; color: #0f766e; word-break: break-all;">
        or paste this link in your browser: <a href="${escapeHtml(url)}" style="color: #0f766e;">${escapeHtml(url)}</a>
      </p>
      ${instructionsBlock}
    </div>
  `.trim();
}

function toBase64(str: string): string {
  return Buffer.from(str, "utf8").toString("base64");
}

function buildIcsAttachmentFor(p: BookingEmailPayload): Attachment | null {
  if (!p.requestedDate || !p.requestedTime) return null;
  const summary = p.itemName;
  const descriptionParts: string[] = [];
  if (p.isOnline && p.meetingUrl) {
    descriptionParts.push(`Join online: ${p.meetingUrl}`);
    if (p.meetingInstructions) {
      descriptionParts.push("");
      descriptionParts.push(p.meetingInstructions);
    }
    descriptionParts.push("");
  }
  if (p.itemDetails) descriptionParts.push(p.itemDetails);
  if (p.notes) {
    descriptionParts.push("");
    descriptionParts.push(`Your notes: ${p.notes}`);
  }
  if (p.referenceId) {
    descriptionParts.push("");
    descriptionParts.push(`Reference: ${p.referenceId}`);
  }
  const description = descriptionParts.join("\n");

  const icsLocation = p.isOnline
    ? p.meetingUrl ?? "Online"
    : p.location ?? "Yan Lai Art Studio";

  const uid = `${p.referenceId ?? Date.now().toString(36)}@yanlaiart.com`;

  const ics = buildBookingIcs({
    uid,
    localDate: p.requestedDate,
    localStartTime: p.requestedTime,
    localEndTime: p.requestedEndTime,
    summary,
    description,
    location: icsLocation,
    url: p.isOnline ? p.meetingUrl : undefined,
  });

  return {
    filename: "yan-lai-art-booking.ics",
    content: toBase64(ics),
  };
}

export async function sendBookingConfirmationToCustomer(
  p: BookingEmailPayload
): Promise<void> {
  const rows = buildDetailRows(p);
  const heading =
    p.itemType === "course"
      ? "Your booking request is received"
      : "Your registration is confirmed";
  const closingLine =
    p.itemType === "course"
      ? "We'll be in touch shortly by email to confirm your preferred date and time and share studio details."
      : "We look forward to seeing you. You'll receive a reminder closer to the date.";

  const subject = `${heading} — ${p.itemName}`;
  const attachment = buildIcsAttachmentFor(p);

  const joinLineText = p.isOnline && p.meetingUrl
    ? `\nJoin online: ${p.meetingUrl}\n`
    : "";
  const calendarLineText = attachment
    ? "\nA calendar invite (.ics) is attached to this email — open it to add this session to your calendar.\n"
    : "";

  const text = [
    `Hi ${p.customerName},`,
    "",
    p.itemType === "course"
      ? `Thank you for booking with Yan Lai Art. We've received your request for ${p.itemName}.`
      : `Thank you for registering for ${p.itemName} with Yan Lai Art.`,
    joinLineText,
    renderDetailsText(rows),
    p.notes ? `\nYour notes: ${p.notes}` : "",
    calendarLineText,
    closingLine,
    "",
    "If you have any questions, just reply to this email.",
    "",
    "— Yan Lai Art",
  ]
    .filter(Boolean)
    .join("\n");

  const joinBlockHtml =
    p.isOnline && p.meetingUrl
      ? buildJoinMeetingHtml(p.meetingUrl, p.meetingInstructions)
      : "";
  const calendarNoteHtml = attachment
    ? `<p style="margin: 0 0 16px; padding: 10px 12px; background: #fef3c7; border-radius: 6px; font-size: 13px; color: #78350f;">
        📅 A calendar invite is attached to this email — open it to add this session to your calendar${p.isOnline ? " with the meeting link built in" : ""}.
      </p>`
    : "";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #292524; max-width: 560px;">
      <h2 style="margin: 0 0 4px; color: #78350f; font-size: 20px;">${escapeHtml(heading)}</h2>
      <p style="margin: 0 0 16px; color: #57534e;">Hi ${escapeHtml(p.customerName)},</p>
      <p style="margin: 0 0 16px;">
        ${
          p.itemType === "course"
            ? `Thank you for booking with Yan Lai Art. We've received your request for <strong>${escapeHtml(p.itemName)}</strong>.`
            : `Thank you for registering for <strong>${escapeHtml(p.itemName)}</strong>.`
        }
      </p>
      ${joinBlockHtml}
      <table style="border-collapse: collapse; margin: 12px 0 20px; width: 100%;">
        ${renderDetailsHtml(rows)}
        ${
          p.notes
            ? `<tr><td style="padding: 6px 12px 6px 0; color: #78716c; font-size: 13px; vertical-align: top;">Your notes</td><td style="padding: 6px 0; color: #292524; font-size: 14px; white-space: pre-wrap;">${escapeHtml(p.notes)}</td></tr>`
            : ""
        }
      </table>
      ${calendarNoteHtml}
      <p style="margin: 0 0 16px;">${escapeHtml(closingLine)}</p>
      <p style="margin: 0 0 8px; color: #57534e;">If you have any questions, just reply to this email.</p>
      <p style="margin: 24px 0 0; color: #78350f; font-weight: 600;">— Yan Lai Art</p>
    </div>
  `.trim();

  await sendResendEmail({
    from: fromAddress(),
    to: [p.customerEmail],
    subject,
    html,
    text,
    attachments: attachment ? [attachment] : undefined,
  });
}

/* ---- Cancellation / confirmation notices (sent from admin) ---- */

export interface CourseStatusEmailInput {
  courseName: string;
  customerName: string;
  customerEmail: string;
  customMessage?: string;
  requestedDate?: string;
  requestedTime?: string;
  meetingUrl?: string;
  meetingInstructions?: string;
  location?: string;
  isOnline?: boolean;
}

function renderCustomMessageHtml(msg?: string): string {
  if (!msg) return "";
  return `
    <div style="margin: 0 0 20px; padding: 14px 16px; background: #faf6ec; border-left: 3px solid #b8804b; border-radius: 4px;">
      <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #78716c;">Note from Yan Lai Art</p>
      <p style="margin: 0; white-space: pre-wrap; color: #292524;">${escapeHtml(msg)}</p>
    </div>
  `.trim();
}

function renderCustomMessageText(msg?: string): string {
  if (!msg) return "";
  return `\nA note from Yan Lai Art:\n${msg}\n`;
}

export async function sendCourseCancellationEmail(
  p: CourseStatusEmailInput
): Promise<void> {
  const subject = `Update: ${p.courseName} has been cancelled`;

  const text = [
    `Hi ${p.customerName},`,
    "",
    `We're sorry to share that ${p.courseName} has been cancelled.`,
    p.requestedDate ? `Your requested slot: ${formatRequestedDate(p.requestedDate)}${p.requestedTime ? ` at ${formatRequestedTime(p.requestedTime)}` : ""}` : "",
    "",
    "If you paid for this course, we'll process a full refund to your original payment method within a few business days. If we can help with anything else — including moving your enrollment to another course — just reply to this email.",
    renderCustomMessageText(p.customMessage),
    "Thank you for your understanding.",
    "",
    "— Yan Lai Art",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #292524; max-width: 560px;">
      <h2 style="margin: 0 0 4px; color: #991b1b; font-size: 20px;">Course cancelled</h2>
      <p style="margin: 0 0 16px; color: #57534e;">Hi ${escapeHtml(p.customerName)},</p>
      <p style="margin: 0 0 16px;">
        We're sorry to share that <strong>${escapeHtml(p.courseName)}</strong> has been cancelled.
      </p>
      ${
        p.requestedDate
          ? `<p style="margin: 0 0 16px; color: #57534e; font-size: 14px;">Your requested slot: <strong style="color: #292524;">${escapeHtml(formatRequestedDate(p.requestedDate))}${p.requestedTime ? ` at ${escapeHtml(formatRequestedTime(p.requestedTime))}` : ""}</strong></p>`
          : ""
      }
      <p style="margin: 0 0 16px;">
        If you paid for this course, we'll process a full refund to your original payment method within a few business days. If we can help with anything else — including moving your enrollment to another course — just reply to this email.
      </p>
      ${renderCustomMessageHtml(p.customMessage)}
      <p style="margin: 0 0 8px; color: #57534e;">Thank you for your understanding.</p>
      <p style="margin: 24px 0 0; color: #78350f; font-weight: 600;">— Yan Lai Art</p>
    </div>
  `.trim();

  await sendResendEmail({
    from: fromAddress(),
    to: [p.customerEmail],
    subject,
    html,
    text,
  });
}

export async function sendCourseConfirmationEmail(
  p: CourseStatusEmailInput
): Promise<void> {
  const subject = `Confirmed: ${p.courseName} is going ahead`;

  const scheduleLine = p.requestedDate
    ? `Your session: ${formatRequestedDate(p.requestedDate)}${p.requestedTime ? ` at ${formatRequestedTime(p.requestedTime)}` : ""}`
    : "";
  const whereLine = p.isOnline
    ? p.meetingUrl
      ? `Where: Online — ${p.meetingUrl}`
      : "Where: Online (link to follow)"
    : p.location
      ? `Where: ${p.location}`
      : "";

  const text = [
    `Hi ${p.customerName},`,
    "",
    `Good news — ${p.courseName} is confirmed and going ahead as scheduled.`,
    "",
    scheduleLine,
    whereLine,
    "",
    p.isOnline && p.meetingUrl
      ? `Click your calendar invite (sent when you booked) at class time to join, or use this link directly: ${p.meetingUrl}`
      : "See you soon!",
    renderCustomMessageText(p.customMessage),
    "If you have any questions, just reply to this email.",
    "",
    "— Yan Lai Art",
  ]
    .filter(Boolean)
    .join("\n");

  const joinBlock =
    p.isOnline && p.meetingUrl
      ? buildJoinMeetingHtml(p.meetingUrl, p.meetingInstructions)
      : "";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #292524; max-width: 560px;">
      <h2 style="margin: 0 0 4px; color: #065f46; font-size: 20px;">You&#39;re confirmed</h2>
      <p style="margin: 0 0 16px; color: #57534e;">Hi ${escapeHtml(p.customerName)},</p>
      <p style="margin: 0 0 16px;">
        Good news — <strong>${escapeHtml(p.courseName)}</strong> is confirmed and going ahead as scheduled.
      </p>
      ${scheduleLine ? `<p style="margin: 0 0 8px; font-size: 14px; color: #57534e;">${escapeHtml(scheduleLine)}</p>` : ""}
      ${whereLine ? `<p style="margin: 0 0 16px; font-size: 14px; color: #57534e;">${escapeHtml(whereLine)}</p>` : ""}
      ${joinBlock}
      ${renderCustomMessageHtml(p.customMessage)}
      <p style="margin: 0 0 8px; color: #57534e;">If you have any questions, just reply to this email.</p>
      <p style="margin: 24px 0 0; color: #78350f; font-weight: 600;">— Yan Lai Art</p>
    </div>
  `.trim();

  await sendResendEmail({
    from: fromAddress(),
    to: [p.customerEmail],
    subject,
    html,
    text,
  });
}

/* ---- Newsletter subscription ---- */

export interface SubscriptionEmailInput {
  email: string;
  name?: string;
  phone?: string;
  interests: string[];
  message?: string;
  subscribedAt: string;
}

const INTEREST_LABELS: Record<string, string> = {
  courses: "Courses",
  events: "Holiday Events",
  "open-studio": "Open Studio",
  all: "All updates",
};

function formatInterests(interests: string[]): string {
  if (interests.length === 0) return "All updates";
  return interests.map((i) => INTEREST_LABELS[i] ?? i).join(", ");
}

export async function sendSubscriptionNotificationToOwner(
  p: SubscriptionEmailInput
): Promise<void> {
  const to =
    process.env.NEWSLETTER_TO_EMAIL ??
    process.env.CONTACT_TO_EMAIL ??
    process.env.BOOKING_TO_EMAIL;
  if (!to) {
    console.warn(
      "Owner subscription notification skipped: NEWSLETTER_TO_EMAIL / CONTACT_TO_EMAIL not set"
    );
    return;
  }

  const rows: Array<[string, string]> = [];
  if (p.name) rows.push(["Name", p.name]);
  rows.push(["Email", p.email]);
  if (p.phone) rows.push(["Phone", p.phone]);
  rows.push(["Interested in", formatInterests(p.interests)]);
  rows.push(["Subscribed", new Date(p.subscribedAt).toLocaleString("en-US")]);

  const subject = `[yanlaiart.com] New newsletter subscriber${p.name ? ` — ${p.name}` : ""}`;

  const text = [
    "New newsletter subscription on yanlaiart.com",
    "",
    renderDetailsText(rows),
    p.message ? `\nMessage:\n${p.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #292524; max-width: 560px;">
      <h2 style="margin: 0 0 12px; color: #78350f; font-size: 20px;">New newsletter subscriber</h2>
      <table style="border-collapse: collapse; margin: 0 0 16px; width: 100%;">
        ${renderDetailsHtml(rows)}
        ${
          p.message
            ? `<tr><td style="padding: 6px 12px 6px 0; color: #78716c; font-size: 13px; vertical-align: top;">Message</td><td style="padding: 6px 0; color: #292524; font-size: 14px; white-space: pre-wrap;">${escapeHtml(p.message)}</td></tr>`
            : ""
        }
      </table>
    </div>
  `.trim();

  await sendResendEmail({
    from: fromAddress(),
    to: [to],
    reply_to: p.email,
    subject,
    html,
    text,
  });
}

interface FeaturedCourse {
  slug: string;
  title: string;
  image: string;
  meta: string;
}

const FEATURED_COURSES: FeaturedCourse[] = [
  {
    slug: "fundamentals-of-drawing",
    title: "Fundamentals of Drawing",
    image: "/images/fundamentals-of-drawing.jpg",
    meta: "8 weekly classes · $360",
  },
  {
    slug: "watercolor-landscapes",
    title: "Watercolor Landscapes",
    image: "/images/watercolor.jpg",
    meta: "8 weekly classes · $360",
  },
  {
    slug: "intro-to-pottery",
    title: "Introduction to Pottery",
    image: "/images/intro-to-pottery.jpg",
    meta: "Sundays · $58/hour",
  },
];

function publicBaseUrl(): string {
  const explicit = process.env.EMAIL_PUBLIC_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const site = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (site && !/localhost|127\.0\.0\.1/i.test(site)) {
    return site.replace(/\/$/, "");
  }
  return "https://www.yanlaiart.com";
}

export async function sendSubscriptionWelcomeToUser(
  p: SubscriptionEmailInput
): Promise<void> {
  const baseUrl = publicBaseUrl();
  const coursesUrl = `${baseUrl}/courses`;
  const calendarUrl = `${baseUrl}/calendar`;
  const contactUrl = `${baseUrl}/contact`;
  const trialUrl = `${baseUrl}/courses/free-trial-class`;

  const greetingName = p.name || "there";
  const subject = "Welcome to Yan Lai Art — you're on the list";

  const text = [
    `Hi ${greetingName},`,
    "",
    "Thanks for subscribing to Yan Lai Art. You'll be the first to hear about new courses, holiday workshops, and open studio events.",
    "",
    "A little about what we offer:",
    "• Small-group drawing, watercolor, acrylic, and ceramic classes at our Pennington, NJ studio",
    "• A weekly Open Studio for ceramics — book by the hour on the potter's wheel",
    "• Seasonal holiday workshops for kids, adults, and families",
    "• An online Eastern & Western Art Appreciation course you can join from anywhere",
    "",
    "A peek at what's on the schedule:",
    ...FEATURED_COURSES.map(
      (c) => `• ${c.title} — ${c.meta} — ${baseUrl}/courses/${c.slug}`
    ),
    "",
    `Curious to try before you commit? Book a free 60-minute trial class — no cost, no commitment: ${trialUrl}`,
    "",
    "Handy links:",
    `• Browse courses: ${coursesUrl}`,
    `• See the class calendar: ${calendarUrl}`,
    `• Reach out anytime: ${contactUrl}`,
    "",
    "See you at the studio soon.",
    "",
    "— Yan Lai Art",
    "Pennington, NJ 08534",
  ].join("\n");

  const featuredHtml = `
    <h3 style="margin: 24px 0 10px; font-size: 14px; color: #78350f; text-transform: uppercase; letter-spacing: 0.06em;">A peek at what&#39;s on the schedule</h3>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: separate; border-spacing: 8px 0; margin: 0 -8px 8px;">
      <tr>
        ${FEATURED_COURSES.map((c) => {
          const url = `${baseUrl}/courses/${c.slug}`;
          const img = `${baseUrl}${c.image}`;
          return `
            <td width="33%" valign="top" style="padding: 0;">
              <a href="${escapeHtml(url)}" style="text-decoration: none; color: inherit; display: block;">
                <img src="${escapeHtml(img)}" alt="${escapeHtml(c.title)}" width="176" style="display: block; width: 100%; max-width: 176px; height: auto; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 8px; border: 1px solid #f3ead3;" />
                <p style="margin: 8px 0 2px; font-size: 13px; font-weight: 600; color: #292524; line-height: 1.3;">${escapeHtml(c.title)}</p>
                <p style="margin: 0; font-size: 12px; color: #78716c; line-height: 1.4;">${escapeHtml(c.meta)}</p>
              </a>
            </td>`;
        }).join("")}
      </tr>
    </table>
  `.trim();

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #292524; max-width: 560px;">
      <h2 style="margin: 0 0 4px; color: #78350f; font-size: 22px;">Welcome to Yan Lai Art</h2>
      <p style="margin: 0 0 16px; color: #57534e;">Hi ${escapeHtml(greetingName)},</p>
      <p style="margin: 0 0 16px;">
        Thanks for subscribing! You&#39;ll be the first to hear about new courses, holiday workshops, and open studio events.
      </p>

      <h3 style="margin: 20px 0 8px; font-size: 14px; color: #78350f; text-transform: uppercase; letter-spacing: 0.06em;">What we offer</h3>
      <ul style="margin: 0 0 16px; padding-left: 20px; color: #292524; font-size: 14px; line-height: 1.6;">
        <li>Small-group <strong>drawing, watercolor, acrylic, and ceramic</strong> classes at our Pennington, NJ studio</li>
        <li>Weekly <strong>Open Studio</strong> for ceramics — book the potter&#39;s wheel by the hour</li>
        <li>Seasonal <strong>holiday workshops</strong> for kids, adults, and families</li>
        <li>Online <strong>Eastern &amp; Western Art Appreciation</strong> course you can join from anywhere</li>
      </ul>

      ${featuredHtml}

      <div style="margin: 20px 0; padding: 16px; border: 1px solid #fcd34d; background: #fffbeb; border-radius: 10px;">
        <p style="margin: 0 0 6px; font-weight: 600; color: #78350f;">Curious to try before you commit?</p>
        <p style="margin: 0 0 12px; font-size: 13px; color: #92400e;">
          Book a free 60-minute trial class — no cost, no commitment.
        </p>
        <a href="${escapeHtml(trialUrl)}" style="display: inline-block; background: #78350f; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Book a free trial
        </a>
      </div>

      <h3 style="margin: 20px 0 8px; font-size: 14px; color: #78350f; text-transform: uppercase; letter-spacing: 0.06em;">Handy links</h3>
      <p style="margin: 0 0 6px; font-size: 14px;">
        <a href="${escapeHtml(coursesUrl)}" style="color: #78350f; font-weight: 600;">Browse courses</a>
        &nbsp;·&nbsp;
        <a href="${escapeHtml(calendarUrl)}" style="color: #78350f; font-weight: 600;">Class calendar</a>
        &nbsp;·&nbsp;
        <a href="${escapeHtml(contactUrl)}" style="color: #78350f; font-weight: 600;">Contact us</a>
      </p>

      <p style="margin: 24px 0 4px; color: #78350f; font-weight: 600;">— Yan Lai Art</p>
      <p style="margin: 0; color: #78716c; font-size: 13px;">Pennington, NJ 08534</p>
    </div>
  `.trim();

  await sendResendEmail({
    from: fromAddress(),
    to: [p.email],
    subject,
    html,
    text,
  });
}

export async function sendBookingNotificationToOwner(
  p: BookingEmailPayload
): Promise<void> {
  const to = process.env.BOOKING_TO_EMAIL ?? process.env.CONTACT_TO_EMAIL;
  if (!to) {
    console.warn("Owner notification skipped: BOOKING_TO_EMAIL / CONTACT_TO_EMAIL not set");
    return;
  }

  const rows = buildDetailRows(p);
  const contactRows: Array<[string, string]> = [
    ["Name", p.customerName],
    ["Email", p.customerEmail],
  ];
  if (p.customerPhone) contactRows.push(["Phone", p.customerPhone]);

  const subject = `[yanlaiart.com] New ${p.itemType} booking — ${p.itemName}`;
  const attachment = buildIcsAttachmentFor(p);

  const text = [
    `New ${p.itemType} booking on yanlaiart.com`,
    "",
    "Customer",
    "-------",
    renderDetailsText(contactRows),
    "",
    "Booking",
    "-------",
    renderDetailsText(rows),
    p.notes ? `\nNotes:\n${p.notes}` : "",
    attachment ? "\nCalendar invite (.ics) attached." : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #292524; max-width: 560px;">
      <h2 style="margin: 0 0 12px; color: #78350f; font-size: 20px;">New ${escapeHtml(p.itemType)} booking</h2>
      <h3 style="margin: 16px 0 4px; font-size: 14px; color: #57534e; text-transform: uppercase; letter-spacing: 0.04em;">Customer</h3>
      <table style="border-collapse: collapse; margin: 0 0 16px; width: 100%;">
        ${renderDetailsHtml(contactRows)}
      </table>
      <h3 style="margin: 16px 0 4px; font-size: 14px; color: #57534e; text-transform: uppercase; letter-spacing: 0.04em;">Booking</h3>
      <table style="border-collapse: collapse; margin: 0 0 16px; width: 100%;">
        ${renderDetailsHtml(rows)}
        ${
          p.notes
            ? `<tr><td style="padding: 6px 12px 6px 0; color: #78716c; font-size: 13px; vertical-align: top;">Notes</td><td style="padding: 6px 0; color: #292524; font-size: 14px; white-space: pre-wrap;">${escapeHtml(p.notes)}</td></tr>`
            : ""
        }
      </table>
      ${attachment ? `<p style="margin: 0; font-size: 13px; color: #57534e;">📅 Calendar invite (.ics) attached.</p>` : ""}
    </div>
  `.trim();

  await sendResendEmail({
    from: fromAddress(),
    to: [to],
    reply_to: p.customerEmail,
    subject,
    html,
    text,
    attachments: attachment ? [attachment] : undefined,
  });
}
