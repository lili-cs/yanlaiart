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

/**
 * Where customer replies to our outbound mail should land. We can't send from
 * @icloud.com through Resend (Apple's domain isn't verifiable), so From must
 * stay on the verified @yanlaiart.com domain — but we set reply_to explicitly
 * so hitting Reply reaches the owner's real inbox.
 */
function ownerReplyTo(): string | undefined {
  return (
    process.env.BOOKING_TO_EMAIL ??
    process.env.CONTACT_TO_EMAIL ??
    undefined
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
    reply_to: ownerReplyTo(),
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

/* ---- Shared studio letterhead (used by admin-facing emails) ---- */

const SERIF_STACK =
  "Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'URW Palladio L', 'Nimbus Roman No9 L', serif";
const SANS_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

interface StudioEmailInput {
  customerName: string;
  kicker: string;
  headline: string;
  body: string;
  details: Array<[string, string]>;
  cta?: { label: string; url: string };
  ctaColor?: string;
  postScript?: string;
}

function buildStudioEmailText(p: Omit<StudioEmailInput, "ctaColor">): string {
  const detailLines = p.details.map(([k, v]) => `${k}: ${v}`);
  return [
    "YAN LAI ART",
    "",
    p.kicker.toUpperCase(),
    p.headline,
    "",
    `Hi ${p.customerName},`,
    "",
    p.body,
    "",
    ...detailLines,
    "",
    p.cta ? `${p.cta.label}: ${p.cta.url}` : "",
    p.postScript ?? "",
    "",
    "— Yan Lai Art",
    "Pennington, NJ 08534",
  ]
    .filter((l) => l !== null && l !== undefined)
    .join("\n");
}

function buildStudioEmailHtml(
  p: StudioEmailInput & { kickerColor: string }
): string {
  const accent = p.kickerColor;
  const detailsHtml = p.details.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0 0; border-collapse: collapse;">
         ${p.details
           .map(
             ([k, v]) => `
             <tr>
               <td style="padding: 0 20px 4px 0; vertical-align: top; font-family: ${SANS_STACK}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: ${accent};">${escapeHtml(k)}</td>
               <td style="padding: 0 0 12px; vertical-align: top; font-family: ${SERIF_STACK}; font-size: 16px; color: #2d251f;">${escapeHtml(v)}</td>
             </tr>`
           )
           .join("")}
       </table>`
    : "";

  const bodyHtml = p.body
    ? p.body
        .split(/\n{2,}/)
        .map(
          (para) =>
            `<p style="margin: 0 0 18px; font-family: ${SERIF_STACK}; font-size: 17px; line-height: 1.7; color: #2d251f; white-space: pre-wrap;">${escapeHtml(para.trim())}</p>`
        )
        .join("")
    : "";

  const ctaColor = p.ctaColor ?? accent;
  const ctaHtml = p.cta
    ? `<div style="margin: 28px 0 0;">
         <a href="${escapeHtml(p.cta.url)}" style="display: inline-block; padding: 12px 22px; background: ${ctaColor}; color: #ffffff; text-decoration: none; font-family: ${SANS_STACK}; font-size: 13px; font-weight: 600; letter-spacing: 0.02em; border-radius: 4px;">${escapeHtml(p.cta.label)}</a>
       </div>`
    : "";

  const postScriptHtml = p.postScript
    ? `<p style="margin: 28px 0 0; font-family: ${SERIF_STACK}; font-size: 15px; line-height: 1.65; color: #6b5e50; font-style: italic;">${escapeHtml(p.postScript)}</p>`
    : "";

  return `
    <div style="margin: 0; padding: 0; background: #faf6ef;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #faf6ef; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 580px; background: #fffdf8; border: 1px solid #ede3cf; border-radius: 6px;">
              <tr>
                <td style="padding: 40px 44px 12px;">
                  <div style="font-family: ${SANS_STACK}; font-size: 11px; font-weight: 700; letter-spacing: 0.28em; color: #78350f; text-transform: uppercase;">
                    Yan Lai Art
                  </div>
                  <div style="margin: 12px 0 0; height: 1px; background: #ede3cf; line-height: 1px; font-size: 0;">&nbsp;</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 44px 0;">
                  <div style="font-family: ${SANS_STACK}; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: ${accent};">
                    ${escapeHtml(p.kicker)}
                  </div>
                  <h1 style="margin: 8px 0 24px; font-family: ${SERIF_STACK}; font-size: 28px; line-height: 1.2; font-weight: 400; color: #2d251f; letter-spacing: -0.005em;">
                    ${escapeHtml(p.headline)}
                  </h1>
                  <p style="margin: 0 0 22px; font-family: ${SERIF_STACK}; font-size: 17px; line-height: 1.6; color: #6b5e50;">
                    Hi ${escapeHtml(p.customerName)},
                  </p>
                  ${bodyHtml}
                  ${ctaHtml}
                  ${detailsHtml}
                  ${postScriptHtml}
                </td>
              </tr>
              <tr>
                <td style="padding: 36px 44px 40px;">
                  <div style="height: 1px; background: #ede3cf; line-height: 1px; font-size: 0;">&nbsp;</div>
                  <p style="margin: 20px 0 4px; font-family: ${SERIF_STACK}; font-size: 15px; color: #6b5e50; font-style: italic;">
                    With warmth,
                  </p>
                  <p style="margin: 0 0 12px; font-family: ${SANS_STACK}; font-size: 12px; font-weight: 700; letter-spacing: 0.24em; color: #78350f; text-transform: uppercase;">
                    Yan Lai Art
                  </p>
                  <p style="margin: 0; font-family: ${SANS_STACK}; font-size: 12px; color: #a8998a;">
                    Pennington, NJ 08534
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `.trim();
}

export async function sendCourseFollowUpEmail(
  p: CourseStatusEmailInput
): Promise<void> {
  const subject = `About your booking — ${p.courseName}`;
  const scheduleLine = p.requestedDate
    ? `${formatRequestedDate(p.requestedDate)}${p.requestedTime ? ` · ${formatRequestedTime(p.requestedTime)}` : ""}`
    : "";
  const bodyText = p.customMessage?.trim() ?? "";

  const text = buildStudioEmailText({
    customerName: p.customerName,
    kicker: "About your booking",
    headline: p.courseName,
    body: bodyText,
    details: scheduleLine ? [["Your requested slot", scheduleLine]] : [],
  });

  const html = buildStudioEmailHtml({
    customerName: p.customerName,
    kicker: "About your booking",
    kickerColor: "#b45309",
    headline: p.courseName,
    body: bodyText,
    details: scheduleLine ? [["Your requested slot", scheduleLine]] : [],
  });

  await sendResendEmail({
    from: fromAddress(),
    to: [p.customerEmail],
    reply_to: ownerReplyTo(),
    subject,
    html,
    text,
  });
}

export async function sendCourseCancellationEmail(
  p: CourseStatusEmailInput
): Promise<void> {
  const subject = `${p.courseName} has been cancelled`;

  const scheduleLine = p.requestedDate
    ? `${formatRequestedDate(p.requestedDate)}${p.requestedTime ? ` · ${formatRequestedTime(p.requestedTime)}` : ""}`
    : "";
  const bodyText = p.customMessage?.trim() ?? "";

  const text = buildStudioEmailText({
    customerName: p.customerName,
    kicker: "Course cancelled",
    headline: p.courseName,
    body: bodyText,
    details: scheduleLine ? [["Your requested slot", scheduleLine]] : [],
  });

  const html = buildStudioEmailHtml({
    customerName: p.customerName,
    kicker: "Course cancelled",
    kickerColor: "#a01d2a",
    headline: p.courseName,
    body: bodyText,
    details: scheduleLine ? [["Your requested slot", scheduleLine]] : [],
  });

  await sendResendEmail({
    from: fromAddress(),
    to: [p.customerEmail],
    reply_to: ownerReplyTo(),
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
    ? `${formatRequestedDate(p.requestedDate)}${p.requestedTime ? ` · ${formatRequestedTime(p.requestedTime)}` : ""}`
    : "";
  const whereLine = p.isOnline
    ? p.meetingUrl
      ? "Online — see meeting link above"
      : "Online (link to follow)"
    : p.location ?? "";

  const bodyText = p.customMessage?.trim() ?? "";

  const details: Array<[string, string]> = [];
  if (scheduleLine) details.push(["When", scheduleLine]);
  if (whereLine) details.push(["Where", whereLine]);

  const text = buildStudioEmailText({
    customerName: p.customerName,
    kicker: "You're confirmed",
    headline: p.courseName,
    body: bodyText,
    details,
    cta: p.isOnline && p.meetingUrl ? { label: "Join meeting", url: p.meetingUrl } : undefined,
    postScript: "If you have any questions, just reply to this email.",
  });

  const html = buildStudioEmailHtml({
    customerName: p.customerName,
    kicker: "You're confirmed",
    kickerColor: "#0f766e",
    headline: p.courseName,
    body: bodyText,
    details,
    cta: p.isOnline && p.meetingUrl ? { label: "Join meeting", url: p.meetingUrl } : undefined,
    ctaColor: "#0f766e",
    postScript: "If you have any questions, just reply to this email.",
  });

  await sendResendEmail({
    from: fromAddress(),
    to: [p.customerEmail],
    reply_to: ownerReplyTo(),
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

export function publicBaseUrl(): string {
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
    reply_to: ownerReplyTo(),
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
