import { ArtEvent } from "@/types";

export const events: ArtEvent[] = [
  {
    slug: "summer-art-fair-2026",
    title: "Summer Art Fair 2026",
    titleCn: "2026夏季艺术展",
    description:
      "Join us for our annual summer art fair featuring student works, live demos, and guest artists.",
    longDescription:
      "Our biggest event of the year! The Summer Art Fair showcases the incredible work of our students alongside pieces by guest artists. Enjoy live painting and pottery demonstrations, try your hand at mini art workshops, and browse artwork available for purchase. Light refreshments will be served. Bring the whole family for a day of creativity and inspiration.",
    price: 0,
    date: "2026-08-15",
    time: "10:00 AM - 5:00 PM",
    location: "Yan Lai Art Gallery, Main Campus",
    imageUrl: "https://placehold.co/800x500/fce7f3/9d174d?text=Summer+Art+Fair",
    capacity: 200,
  },
  {
    slug: "ceramic-raku-firing-workshop",
    title: "Ceramic Raku Firing Workshop",
    titleCn: "乐烧陶艺工作坊",
    description:
      "Experience the exciting art of raku firing in this hands-on weekend workshop.",
    longDescription:
      "Raku firing is one of the most dramatic and exciting ceramic processes. In this weekend workshop, you will glaze bisque-fired pieces (provided) and watch as they are fired in our outdoor raku kiln. Learn about the history of raku, glaze chemistry for metallic and crackle effects, and post-firing reduction techniques. Each participant will take home 3-4 uniquely finished pieces.",
    price: 8500,
    date: "2026-07-20",
    time: "9:00 AM - 4:00 PM",
    location: "Yan Lai Art Studio, Outdoor Kiln Area",
    imageUrl: "https://placehold.co/800x500/fce7f3/9d174d?text=Raku+Firing+Workshop",
    capacity: 12,
  },
  {
    slug: "watercolor-in-the-park",
    title: "Watercolor in the Park",
    titleCn: "公园水彩写生",
    description:
      "An outdoor plein air painting session in the beautiful surroundings of Riverside Park.",
    longDescription:
      "Grab your brushes and join us for a relaxing day of plein air watercolor painting. This guided outdoor session is perfect for painters of all levels. Our instructor will provide tips on capturing natural light, mixing greens for foliage, and composing outdoor scenes. All materials are provided — just bring yourself and a sense of adventure. We will meet at the park entrance and walk to our painting spot together.",
    price: 4500,
    date: "2026-07-05",
    time: "1:00 PM - 4:00 PM",
    location: "Riverside Park, Main Entrance",
    imageUrl: "https://placehold.co/800x500/fce7f3/9d174d?text=Watercolor+in+the+Park",
    capacity: 20,
  },
  {
    slug: "figure-drawing-night",
    title: "Figure Drawing Night",
    titleCn: "人体素描之夜",
    description:
      "Drop-in figure drawing session with a live model. All skill levels welcome.",
    longDescription:
      "Our monthly figure drawing night provides a supportive environment to practice drawing the human figure from a live model. The session includes a mix of short gesture poses (2-5 minutes) and longer sustained poses (20-30 minutes). Easels, drawing boards, and basic materials are provided, but feel free to bring your own preferred media. Light snacks and drinks available.",
    price: 2500,
    date: "2026-07-12",
    time: "6:30 PM - 9:00 PM",
    location: "Yan Lai Art Studio, Room A",
    imageUrl: "https://placehold.co/800x500/fce7f3/9d174d?text=Figure+Drawing+Night",
    capacity: 25,
  },
];

export function getAllEvents(): ArtEvent[] {
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getEventBySlug(slug: string): ArtEvent | undefined {
  return events.find((e) => e.slug === slug);
}

export function getUpcomingEvents(): ArtEvent[] {
  return getAllEvents();
}
