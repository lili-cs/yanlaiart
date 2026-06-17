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
    price: 18000,
    duration: "8 weeks",
    level: "Beginner",
    maxStudents: 12,
    imageUrl: "https://placehold.co/800x500/e2e8f0/475569?text=Fundamentals+of+Drawing",
    featured: true,
  },
  {
    slug: "portrait-sketching",
    title: "Portrait Sketching",
    titleCn: "人像速写",
    category: "drawing",
    description:
      "Learn to capture the human face with expressive pencil and charcoal techniques.",
    longDescription:
      "Dive deep into the art of portrait drawing. This course explores facial proportions, anatomy of the head, and how light defines form. You will work with graphite, charcoal, and conte crayon to develop a range of expressive techniques. Each session includes live model practice and personalized critiques to rapidly improve your portraiture skills.",
    price: 22000,
    duration: "6 weeks",
    level: "Intermediate",
    maxStudents: 10,
    imageUrl: "https://placehold.co/800x500/e2e8f0/475569?text=Portrait+Sketching",
    featured: false,
  },
  {
    slug: "urban-sketching",
    title: "Urban Sketching",
    titleCn: "城市速写",
    category: "drawing",
    description:
      "Sketch cityscapes and everyday scenes with pen, ink, and watercolor on location.",
    longDescription:
      "Take your sketchbook outdoors and learn to capture the energy of urban environments. This course covers perspective for architecture, drawing people in motion, quick composition techniques, and adding watercolor washes for atmosphere. We will visit local landmarks and neighborhoods, building your confidence to sketch anywhere in the world.",
    price: 19000,
    duration: "6 weeks",
    level: "All Levels",
    maxStudents: 15,
    imageUrl: "https://placehold.co/800x500/e2e8f0/475569?text=Urban+Sketching",
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
    price: 24000,
    duration: "8 weeks",
    level: "Beginner",
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
    price: 22000,
    duration: "6 weeks",
    level: "All Levels",
    maxStudents: 12,
    imageUrl: "https://placehold.co/800x500/fef3c7/92400e?text=Acrylic+Abstract+Art",
    featured: false,
  },
  {
    slug: "oil-painting-masterclass",
    title: "Oil Painting Masterclass",
    titleCn: "油画大师课",
    category: "painting",
    description:
      "Develop classical oil painting skills with a focus on still life and portraiture.",
    longDescription:
      "This masterclass takes you through the rich tradition of oil painting. Learn to prepare canvases, mix colors on the palette, and build paintings in layers from underpainting to final glazes. Subjects include still life, portraiture, and landscape. You will gain an understanding of the old masters' techniques while developing a contemporary approach to this timeless medium.",
    price: 32000,
    duration: "10 weeks",
    level: "Intermediate",
    maxStudents: 8,
    imageUrl: "https://placehold.co/800x500/fef3c7/92400e?text=Oil+Painting+Masterclass",
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
    price: 26000,
    duration: "8 weeks",
    level: "Beginner",
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
    price: 28000,
    duration: "6 weeks",
    level: "Intermediate",
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
    price: 30000,
    duration: "8 weeks",
    level: "Advanced",
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
