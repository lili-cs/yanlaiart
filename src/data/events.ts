import { ArtEvent } from "@/types";

export const events: ArtEvent[] = [
  {
    slug: "qixi-couples-pottery-night",
    title: "Qixi Couples' Pottery Night",
    titleCn: "七夕情侣陶艺之夜",
    description:
      "Throw a pair of matching teacups with your partner to celebrate Qixi, the Double Seventh Festival.",
    longDescription:
      "Celebrate Qixi — China's traditional festival of love — at the potter's wheel. Come as a couple or a pair of friends and throw a matching set of two teacups together, guided by our instructor. We will finish the evening decorating your pieces with simple slip and underglaze designs. Cups will be fired and glazed, then delivered two weeks later. Tea and mooncakes served.",
    price: 6500,
    date: "2026-08-19",
    time: "6:30 PM - 9:00 PM",
    location: "Yan Lai Art Studio, Wheel Room",
    imageUrl: "https://placehold.co/800x500/fce7f3/9d174d?text=Qixi+Couples+Pottery",
    capacity: 12,
  },
  {
    slug: "mid-autumn-mooncake-molds",
    title: "Mid-Autumn Ceramic Mooncake Molds",
    titleCn: "中秋陶艺月饼模",
    description:
      "Sculpt a set of decorative ceramic mooncake molds to use at home each Mid-Autumn Festival.",
    longDescription:
      "Celebrate the Mid-Autumn Festival by hand-carving a set of ceramic mooncake molds you will use for years to come. You will shape and carve two small pressed-clay molds — one traditional round design, one of your own — then apply a food-safe glaze. Tea and mooncakes will be served throughout the evening. Molds are fired and ready for pickup the following week. Family-friendly, children welcome with a paying adult.",
    price: 6000,
    date: "2026-09-25",
    time: "6:00 PM - 9:00 PM",
    location: "Yan Lai Art Studio, Main Room",
    imageUrl: "https://placehold.co/800x500/fce7f3/9d174d?text=Mooncake+Molds",
    capacity: 24,
  },
  {
    slug: "halloween-ceramic-masks",
    title: "Halloween Ceramic Mask Making",
    titleCn: "万圣节陶艺面具",
    description:
      "Slab-build and decorate a wearable ceramic Halloween mask — costume optional but encouraged.",
    longDescription:
      "Get into the Halloween spirit with a spooky-fun ceramic mask making party. You will slab-build a face mask over a clay press mold, then carve, texture, and decorate it. Masks will be bisque-fired and finished with underglazes and lusters for pickup before Halloween week. Wear a costume for a small prize! Light snacks and drinks provided.",
    price: 6500,
    date: "2026-10-31",
    time: "5:00 PM - 8:00 PM",
    location: "Yan Lai Art Studio, Main Room",
    imageUrl: "https://placehold.co/800x500/fce7f3/9d174d?text=Halloween+Ceramic+Masks",
    capacity: 20,
  },
  {
    slug: "thanksgiving-serving-bowl",
    title: "Thanksgiving Serving Bowl Workshop",
    titleCn: "感恩节陶艺餐碗工作坊",
    description:
      "Throw or hand-build a large serving bowl in time to grace your Thanksgiving table.",
    longDescription:
      "Give thanks with a bowl made by your own hands. In this one-day workshop you will throw or hand-build a large serving bowl, then decorate it with warm autumnal glazes. Your bowl will be fired and returned to you the week before Thanksgiving — ready for stuffing, salads, and pass-around sides. A light Thanksgiving-themed lunch is included.",
    price: 8500,
    date: "2026-11-26",
    time: "10:00 AM - 3:00 PM",
    location: "Yan Lai Art Studio, Main Room",
    imageUrl: "https://placehold.co/800x500/fce7f3/9d174d?text=Thanksgiving+Bowl",
    capacity: 12,
  },
  {
    slug: "christmas-ceramic-ornaments",
    title: "Christmas Ceramic Ornaments",
    titleCn: "圣诞陶艺挂饰",
    description:
      "Hand-shape and glaze a set of ceramic ornaments to hang on your tree or gift to loved ones.",
    longDescription:
      "Bring some handmade magic to your holiday tree. Each participant will hand-shape a set of four ceramic ornaments — snowflakes, stars, baubles, and mini stockings — using stamps, cutters, and simple carving. Pieces will be bisque-fired and finished with festive glazes and metallic lusters for pickup before Christmas. Hot cocoa and holiday cookies included.",
    price: 5500,
    date: "2026-12-20",
    time: "2:00 PM - 5:00 PM",
    location: "Yan Lai Art Studio, Main Room",
    imageUrl: "https://placehold.co/800x500/fce7f3/9d174d?text=Christmas+Ornaments",
    capacity: 20,
  },
  {
    slug: "lunar-new-year-tea-cups",
    title: "Lunar New Year Ceramic Tea Cups",
    titleCn: "迎春陶艺茶杯",
    description:
      "Throw and hand-decorate a set of tea cups to welcome the Lunar New Year at your table.",
    longDescription:
      "Welcome the Year of the Sheep with clay in hand. In this festive workshop you will throw a set of four small tea cups on the wheel, then decorate them with auspicious motifs — spring peaches, plum blossoms, and the character 春. Pieces will be glazed and fired for pickup before the Lunar New Year holiday. Red envelopes and Chinese tea served.",
    price: 7000,
    date: "2027-02-13",
    time: "1:00 PM - 4:00 PM",
    location: "Yan Lai Art Studio, Wheel Room",
    imageUrl: "https://placehold.co/800x500/fce7f3/9d174d?text=Lunar+New+Year+Tea+Cups",
    capacity: 12,
  },
  {
    slug: "valentines-ceramic-hearts",
    title: "Valentine's Ceramic Heart Pendants",
    titleCn: "情人节陶艺爱心吊坠",
    description:
      "Make a pair of ceramic heart pendants — one for you, one for someone you love.",
    longDescription:
      "Skip the store-bought gift. In this cozy afternoon workshop you will shape and carve a pair of ceramic heart pendants, then finish them with soft blush and gold-luster glazes. Pieces come strung on braided cord and ready to gift. Pastries, tea, and a little help writing your card are all provided.",
    price: 5000,
    date: "2027-02-14",
    time: "1:00 PM - 4:00 PM",
    location: "Yan Lai Art Studio, Main Room",
    imageUrl: "https://placehold.co/800x500/fce7f3/9d174d?text=Ceramic+Hearts",
    capacity: 18,
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
