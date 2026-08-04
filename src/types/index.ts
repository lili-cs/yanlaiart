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
  status: "upcoming" | "open";
  maxStudents?: number;
  imageUrl: string;
  featured: boolean;
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
}
