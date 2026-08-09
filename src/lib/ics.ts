/**
 * Minimal RFC 5545 iCalendar (.ics) builder for booking confirmations.
 * Times are emitted in America/New_York wall-clock with a VTIMEZONE block
 * so viewers in other timezones see the correct converted time.
 */

const STUDIO_TZID = "America/New_York";
const CRLF = "\r\n";

// Static VTIMEZONE for America/New_York — covers current U.S. DST rules.
const NY_VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${STUDIO_TZID}`,
  "X-LIC-LOCATION:America/New_York",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0400",
  "TZNAME:EDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0500",
  "TZNAME:EST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

export interface BookingIcsInput {
  uid: string;
  /** YYYY-MM-DD, interpreted as America/New_York local date. */
  localDate: string;
  /** HH:mm (24-hour), interpreted as America/New_York local time. */
  localStartTime: string;
  /** HH:mm (24-hour). If omitted, `startTime + 60min` is used. */
  localEndTime?: string;
  summary: string;
  description: string;
  location?: string;
  url?: string;
}

function pad(n: number, w = 2): string {
  return String(n).padStart(w, "0");
}

function icsDateTime(date: string, time: string): string {
  // "2026-08-24" + "18:30" => "20260824T183000"
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function icsUtcStamp(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const total = h * 60 + m + minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  const newH = Math.floor(wrapped / 60);
  const newM = wrapped % 60;
  return `${pad(newH)}:${pad(newM)}`;
}

function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// RFC 5545 §3.1: fold lines at 75 octets (bytes) with CRLF + single space.
// UTF-8 CJK characters are 3 bytes each, so a naive char-count fold produces
// lines several times over the limit that some older clients reject.
function foldLine(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  // First segment: 75 bytes. Continuation segments: prefixed by " ", so 74
  // bytes of content each.
  let offset = 0;
  let limit = 75;
  while (offset < bytes.length) {
    // Don't split in the middle of a multi-byte UTF-8 sequence: rewind until
    // the next byte would be a valid UTF-8 leading byte.
    let end = Math.min(offset + limit, bytes.length);
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    parts.push(bytes.subarray(offset, end).toString("utf8"));
    offset = end;
    limit = 74;
  }
  return parts.join(`${CRLF} `);
}

export function buildBookingIcs(input: BookingIcsInput): string {
  const endTime = input.localEndTime ?? addMinutes(input.localStartTime, 60);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yan Lai Art//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...NY_VTIMEZONE,
    "BEGIN:VEVENT",
    `UID:${input.uid}`,
    `DTSTAMP:${icsUtcStamp(new Date())}`,
    `DTSTART;TZID=${STUDIO_TZID}:${icsDateTime(input.localDate, input.localStartTime)}`,
    `DTEND;TZID=${STUDIO_TZID}:${icsDateTime(input.localDate, endTime)}`,
    `SUMMARY:${escapeIcsText(input.summary)}`,
    `DESCRIPTION:${escapeIcsText(input.description)}`,
  ];
  if (input.location) {
    lines.push(`LOCATION:${escapeIcsText(input.location)}`);
  }
  if (input.url) {
    // RFC 5545 says URI values are not text — no comma/semicolon escaping.
    // But CR/LF still need stripping (defense against malicious input).
    lines.push(`URL:${input.url.replace(/[\r\n]+/g, "")}`);
  }
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.map(foldLine).join(CRLF) + CRLF;
}

/**
 * Parses an event time string like "6:00 PM - 9:00 PM" into
 * two 24-hour "HH:mm" strings. Returns null if unparseable.
 */
export function parseTimeRange(input: string): { start: string; end: string } | null {
  const parts = input.split(/\s*[-–—]\s*/);
  if (parts.length !== 2) return null;
  const start = parseClock(parts[0]);
  const end = parseClock(parts[1]);
  if (!start || !end) return null;
  return { start, end };
}

function parseClock(s: string): string | null {
  const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const period = m[3]?.toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return `${pad(hour)}:${pad(minute)}`;
}
