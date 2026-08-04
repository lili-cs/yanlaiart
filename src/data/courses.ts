import { Course, Category } from "@/types";

export const courses: Course[] = [
  // Drawing
  {
    slug: "fundamentals-of-drawing",
    title: "Fundamentals of Drawing",
    titleCn: "素描基础",
    category: "drawing",
    description:
      "Master the core principles of drawing including line, shape, form, and shading techniques.",
    longDescription:
      "This comprehensive course covers the essential building blocks of drawing. You will learn to see like an artist, understanding how to break down complex subjects into simple shapes. Topics include contour drawing, gesture sketching, value studies, perspective basics, and composition. By the end of this course, you will have a strong foundation to pursue any drawing style with confidence.",
    price: 36000,
    priceUnit: "total",
    duration: "8 classes (60 min each)",
    level: "Beginner",
    format: "in-person",
    status: "upcoming",
    maxStudents: 12,
    imageUrl: "https://placehold.co/800x500/e2e8f0/475569?text=Fundamentals+of+Drawing",
    featured: true,
  },
  {
    slug: "creative-still-life-sketching",
    title: "Creative Still Life Sketching",
    titleCn: "静物创意写生",
    category: "drawing",
    description:
      "Transform everyday objects into imaginative compositions with drawing and mixed media.",
    longDescription:
      "Explore still life beyond traditional realism. This course invites you to observe ordinary objects and reinterpret them with a creative eye. You will experiment with graphite, charcoal, ink, and mixed media to build compositions that balance careful observation with imaginative expression. Sessions include curated studio setups with varied lighting, thematic still life arrangements, and personalized critiques to sharpen both your technique and your artistic voice.",
    price: 36000,
    priceUnit: "total",
    duration: "8 classes (60 min each)",
    level: "Intermediate",
    format: "in-person",
    status: "upcoming",
    maxStudents: 10,
    imageUrl: "https://placehold.co/800x500/e2e8f0/475569?text=Creative+Still+Life+Sketching",
    featured: false,
  },
  {
    slug: "outdoor-sketching",
    title: "Outdoor Sketching",
    titleCn: "户外写生",
    category: "drawing",
    description:
      "Sketch landscapes, gardens, and streetscapes on location with pen, ink, and watercolor.",
    longDescription:
      "Take your sketchbook into the open air and learn to capture the world around you from direct observation. This course moves through a variety of outdoor settings — parks, gardens, waterfronts, and streetscapes — teaching you how to work quickly with pen, ink, and watercolor. You will develop skills in landscape composition, atmospheric perspective, drawing trees and foliage, capturing changing light, and adding lively washes on location. By the end you will have the confidence and toolkit to sketch anywhere.",
    price: 36000,
    priceUnit: "total",
    duration: "8 classes (60 min each)",
    level: "All Levels",
    format: "in-person",
    status: "upcoming",
    maxStudents: 15,
    imageUrl: "https://placehold.co/800x500/e2e8f0/475569?text=Outdoor+Sketching",
    featured: false,
  },
  // Painting
  {
    slug: "watercolor-landscapes",
    title: "Watercolor Landscapes",
    titleCn: "水彩风景",
    category: "painting",
    description:
      "Explore the beauty of watercolor through stunning landscape compositions.",
    longDescription:
      "Discover the luminous qualities of watercolor painting through landscape subjects. Learn essential techniques including wet-on-wet, wet-on-dry, glazing, and lifting. This course covers color mixing, atmospheric perspective, painting skies, water reflections, and foliage. Each class builds progressively, culminating in a finished landscape painting you can frame and display.",
    price: 36000,
    priceUnit: "total",
    duration: "8 classes (60 min each)",
    level: "Beginner",
    format: "in-person",
    status: "upcoming",
    maxStudents: 12,
    imageUrl: "https://placehold.co/800x500/fef3c7/92400e?text=Watercolor+Landscapes",
    featured: true,
  },
  {
    slug: "acrylic-abstract-art",
    title: "Acrylic Abstract Art",
    titleCn: "丙烯抽象艺术",
    category: "painting",
    description:
      "Express yourself through bold colors, textures, and abstract composition in acrylics.",
    longDescription:
      "Unleash your creativity with acrylic paints in this abstract art course. Explore color theory, texture building with palette knives and mixed media, gestural mark-making, and compositional balance. You will study abstract masters for inspiration while developing your own unique visual language. No prior painting experience is needed — just an open mind and willingness to experiment.",
    price: 36000,
    priceUnit: "total",
    duration: "8 classes (60 min each)",
    level: "All Levels",
    format: "in-person",
    status: "upcoming",
    maxStudents: 12,
    imageUrl: "https://placehold.co/800x500/fef3c7/92400e?text=Acrylic+Abstract+Art",
    featured: false,
  },
  {
    slug: "east-west-art-appreciation",
    title: "Eastern & Western Art Appreciation",
    titleCn: "东西方艺术鉴赏课",
    category: "painting",
    description:
      "A guided journey through masterworks of Eastern and Western art, from ancient traditions to modern movements.",
    longDescription:
      "This appreciation course invites you to look closely, think deeply, and discover the conversation between Eastern and Western art traditions. We will study landmark works from Chinese ink painting, calligraphy, and porcelain alongside European painting, sculpture, and modernism — comparing philosophies of space, brushwork, color, and meaning. Each session pairs illustrated lectures with open discussion and gallery-style close looking, giving you the vocabulary and cultural context to appreciate art with fresh eyes. No prior art history background required.",
    price: 18000,
    priceUnit: "total",
    duration: "10 classes (60 min each)",
    level: "All Levels",
    format: "online",
    status: "upcoming",
    imageUrl: "https://placehold.co/800x500/fef3c7/92400e?text=Art+Appreciation",
    featured: true,
  },
  // Ceramic
  {
    slug: "intro-to-pottery",
    title: "Introduction to Pottery",
    titleCn: "陶艺入门",
    category: "ceramic",
    description:
      "Get your hands dirty and learn the basics of hand-building and wheel throwing.",
    longDescription:
      "Step into the pottery studio and discover the joy of working with clay. This beginner-friendly course covers pinch pots, coil building, slab construction, and an introduction to the potter's wheel. You will learn about clay types, surface decoration, and the glazing and firing process. By the end, you will have created several functional pieces to take home.",
    price: 5000,
    priceUnit: "hourly",
    duration: "Book by the hour",
    level: "Beginner",
    format: "in-person",
    status: "open",
    maxStudents: 8,
    imageUrl: "https://placehold.co/800x500/d1fae5/065f46?text=Intro+to+Pottery",
    featured: true,
  },
  {
    slug: "wheel-throwing-intensive",
    title: "Wheel Throwing Intensive",
    titleCn: "拉坯强化班",
    category: "ceramic",
    description:
      "Focus on mastering the potter's wheel to create bowls, cups, and vases.",
    longDescription:
      "Dedicate yourself to the potter's wheel in this focused intensive course. Starting with centering clay, you will progress through pulling walls, shaping forms, trimming feet, and attaching handles. Learn to create consistent sets of bowls, mugs, and vases. The course includes glazing sessions where you will finish your pieces with beautiful, food-safe surfaces.",
    price: 5000,
    priceUnit: "hourly",
    duration: "Book by the hour",
    level: "Intermediate",
    format: "in-person",
    status: "open",
    maxStudents: 6,
    imageUrl: "https://placehold.co/800x500/d1fae5/065f46?text=Wheel+Throwing",
    featured: false,
  },
  {
    slug: "ceramic-sculpture",
    title: "Ceramic Sculpture",
    titleCn: "陶瓷雕塑",
    category: "ceramic",
    description:
      "Create expressive sculptural forms using hand-building and mixed ceramic techniques.",
    longDescription:
      "Push the boundaries of clay beyond functional ware and into the realm of sculpture. This course explores figurative and abstract sculptural forms, armature building, hollow construction for large pieces, and surface treatments including oxides, underglazes, and alternative firing methods. Develop your artistic voice through a series of increasingly ambitious sculptural projects.",
    price: 5000,
    priceUnit: "hourly",
    duration: "Book by the hour",
    level: "Advanced",
    format: "in-person",
    status: "open",
    maxStudents: 8,
    imageUrl: "https://placehold.co/800x500/d1fae5/065f46?text=Ceramic+Sculpture",
    featured: false,
  },
];

export function getAllCourses(): Course[] {
  return courses;
}

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getCoursesByCategory(category: Category): Course[] {
  return courses.filter((c) => c.category === category);
}

export function getFeaturedCourses(): Course[] {
  return courses.filter((c) => c.featured);
}
