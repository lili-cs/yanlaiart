export type Category = "drawing" | "painting" | "ceramic";

export interface Course {
  slug: string;
  title: string;
  titleCn: string;
  category: Category;
  description: string;
  longDescription: string;
  price: number; // in cents
  priceUnit: "total" | "hourly";
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  format: "in-person" | "online";
  status: "upcoming" | "open" | "cancelled";
  maxStudents?: number;
  /** Minimum students required to open the class. */
  minStudents?: number;
  imageUrl: string;
  featured: boolean;
  // For online courses: persistent meeting link (Zoom, Google Meet, VooV,
  // Tencent Meeting, Teams, etc.) surfaced in the calendar invite and email.
  meetingUrl?: string;
  // Free-form extra meeting details (meeting ID, dial-in numbers, etc.).
  // Rendered as-is in the confirmation email and calendar invite description.
  meetingInstructions?: string;
  // Session length in minutes for calendar-invite scheduling (default 60).
  sessionMinutes?: number;
  // Schedule for multi-session courses (used by the site-wide calendar).
  // Sessions are generated weekly from startDate, sessionCount times.
  /**
   * Soft-delete timestamp (Unix ms). When set, the course is hidden from the
   * public site and calendar but still recoverable from the admin trash.
   */
  deletedAt?: number;
  startDate?: string; // YYYY-MM-DD, first class
  startTime?: string; // HH:mm (24-hour), local studio time
  /**
   * Optional additional session start times on the same weekly day.
   * Use for multi-slot days (e.g. Sunday pottery offered at 1/3/5 PM).
   * When set, the calendar renders one item per (week × time).
   */
  sessionTimes?: string[];
  sessionCount?: number; // Number of weeks the course runs.
}

export interface ArtEvent {
  slug: string;
  title: string;
  titleCn: string;
  description: string;
  longDescription: string;
  price: number; // in cents, 0 = free
  date: string; // ISO date string
  time: string;
  location: string;
  imageUrl: string;
  capacity: number;
  // Set for online events; surfaced in the calendar invite and email.
  meetingUrl?: string;
}
