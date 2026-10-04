import { readStore, updateStore } from "./store";

export interface HoursLine {
  label: string;
  value: string;
}

export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  artFormsTitle: string;
  artFormsSubtitle: string;
  featuredCoursesTitle: string;
  featuredCoursesSubtitle: string;
  upcomingEventsTitle: string;
  upcomingEventsSubtitle: string;
}

export interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  introZh: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}

export interface ContactContent {
  heroTitle: string;
  heroSubtitle: string;
  email: string;
  phone: string;
  address: string;
  hoursLines: HoursLine[];
  formHeading: string;
  formIntro: string;
}

export interface PageContent {
  home: HomeContent;
  about: AboutContent;
  contact: ContactContent;
}

export type PageKey = keyof PageContent;

export const PAGE_LABELS: Record<PageKey, string> = {
  home: "Home",
  about: "About",
  contact: "Contact",
};

export const DEFAULT_HOME: HomeContent = {
  heroTitle: "Yan Lai Art",
  heroSubtitle:
    "Discover your creative potential through drawing, painting, and ceramic art. Join our welcoming community of artists and makers.",
  artFormsTitle: "Explore Our Art Forms",
  artFormsSubtitle: "From pencil to clay, find the medium that speaks to you",
  featuredCoursesTitle: "Featured Courses",
  featuredCoursesSubtitle: "Our most popular courses hand-picked for you",
  upcomingEventsTitle: "Upcoming Events",
  upcomingEventsSubtitle:
    "Workshops, open studios, and community gatherings",
};

export const DEFAULT_ABOUT: AboutContent = {
  heroTitle: "About Yan Lai Art",
  heroSubtitle: "A quiet space to slow down, listen inward, and make",
  introZh:
    "在信息高速发展的现在，我们更关心孩子如何与自己对话。在自然之中，在安静的环境中，慢下来，与自己的感受紧密合作。绘画和手工，是最好的体验方式。走近 YANLAI ART，让这个空间滋养你的身心。",
  paragraph1:
    "In today's fast-paced, information-driven world, we believe that one of the most valuable gifts we can offer children is the opportunity to connect with themselves and listen to their own inner voice.",
  paragraph2:
    "We believe that true growth is not only about acquiring knowledge, but also about nurturing creativity, mindfulness, and emotional awareness. In a peaceful, nature-inspired environment, children are encouraged to slow down, explore freely, and express themselves through painting, crafts, and other forms of artistic creation.",
  paragraph3:
    "At YANLAI ART, we strive to create a warm and inspiring space where art becomes a bridge to self-discovery, imagination, and overall well-being. We invite every child and family to experience the joy, creativity, and nourishment that art can bring.",
};

export const DEFAULT_CONTACT: ContactContent = {
  heroTitle: "Contact Us",
  heroSubtitle: "We'd love to hear from you",
  email: "yichenhot@icloud.com",
  phone: "(929) 329-9686",
  address: "Pennington, NJ 08534",
  hoursLines: [
    { label: "Monday – Friday", value: "1:30 PM – 8:00 PM" },
    { label: "Saturday", value: "Closed" },
    { label: "Sunday", value: "10:00 AM – 8:00 PM" },
  ],
  formHeading: "Send a Message",
  formIntro:
    "Have a question about a course or want to book studio time? Drop us a note.",
};

const DEFAULTS: PageContent = {
  home: DEFAULT_HOME,
  about: DEFAULT_ABOUT,
  contact: DEFAULT_CONTACT,
};

const KEY = "page-content";

function mergeHours(stored: unknown): HoursLine[] {
  if (!Array.isArray(stored)) return DEFAULT_CONTACT.hoursLines;
  return stored
    .map((line): HoursLine | null => {
      if (!line || typeof line !== "object") return null;
      const l = line as Partial<HoursLine>;
      if (typeof l.label !== "string" || typeof l.value !== "string") return null;
      return { label: l.label, value: l.value };
    })
    .filter((l): l is HoursLine => l !== null);
}

/** Overlay string fields from `stored` onto `defaults`; non-string overrides
 *  (missing, wrong type, mangled payload) fall back to the default. Non-string
 *  fields on `defaults` are returned unchanged. */
function mergeStrings<T extends object>(
  defaults: T,
  stored: unknown
): T {
  if (!stored || typeof stored !== "object") return defaults;
  const s = stored as Record<string, unknown>;
  const out = { ...defaults } as T;
  for (const k of Object.keys(defaults) as Array<keyof T>) {
    const dv = defaults[k];
    const sv = s[k as string];
    if (typeof dv === "string" && typeof sv === "string") {
      (out as Record<string, unknown>)[k as string] = sv;
    }
  }
  return out;
}

export async function getPageContent(): Promise<PageContent> {
  const raw = (await readStore<Partial<PageContent>>(KEY)) ?? {};
  const contactBase = mergeStrings(DEFAULT_CONTACT, raw.contact);
  const hoursLines =
    raw.contact && Array.isArray(raw.contact.hoursLines)
      ? mergeHours(raw.contact.hoursLines)
      : DEFAULT_CONTACT.hoursLines;
  return {
    home: mergeStrings(DEFAULT_HOME, raw.home),
    about: mergeStrings(DEFAULT_ABOUT, raw.about),
    contact: { ...contactBase, hoursLines },
  };
}

export async function getHomeContent(): Promise<HomeContent> {
  const all = await getPageContent();
  return all.home;
}

export async function getAboutContent(): Promise<AboutContent> {
  const all = await getPageContent();
  return all.about;
}

export async function getContactContent(): Promise<ContactContent> {
  const all = await getPageContent();
  return all.contact;
}

export async function savePageSection<K extends PageKey>(
  key: K,
  value: PageContent[K]
): Promise<void> {
  await updateStore<Partial<PageContent>>(KEY, (current) => {
    const base = current && typeof current === "object" ? current : {};
    return { ...base, [key]: value };
  });
}
