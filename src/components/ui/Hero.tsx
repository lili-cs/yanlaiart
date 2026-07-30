import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-neutral-900 to-stone-950 py-24 sm:py-32">
      {/* Mineral pigment washes — ink, ochre, celadon, aged cinnabar */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-amber-700/35 mix-blend-screen blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute right-0 top-1/3 h-[32rem] w-[32rem] rounded-full bg-orange-800/35 mix-blend-screen blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute -bottom-32 left-1/3 h-[34rem] w-[34rem] rounded-full bg-emerald-800/30 mix-blend-screen blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute right-1/4 -top-16 h-72 w-72 rounded-full bg-slate-600/30 mix-blend-screen blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute left-1/4 bottom-0 h-64 w-64 rounded-full bg-amber-800/25 mix-blend-screen blur-3xl" />
      </div>

      {/* Paper grain */}
      <div className="pointer-events-none absolute inset-0 texture-paper opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="animate-fade-rise text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="animate-gradient bg-gradient-to-r from-amber-100 via-stone-100 to-emerald-100 bg-clip-text text-transparent">
            Yan Lai Art
          </span>
        </h1>

        {/* Ink brush stroke — ochre to ink to celadon */}
        <svg
          className="mx-auto mt-4 h-4 w-64"
          viewBox="0 0 400 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            className="animate-ink-draw"
            d="M8 14 C 60 4, 120 20, 180 10 S 300 20, 392 8"
            stroke="url(#brushGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <defs>
            <linearGradient id="brushGradient" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a16207" />
              <stop offset="50%" stopColor="#57534e" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>

        <p className="animate-fade-rise animation-delay-200 mx-auto mt-8 max-w-2xl text-lg text-stone-300 sm:text-xl">
          Discover your creative potential through drawing, painting, and ceramic art.
          Join our welcoming community of artists and makers.
        </p>
        <div className="animate-fade-rise animation-delay-400 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/courses"
            className="inline-flex items-center rounded-lg bg-stone-100 px-7 py-3.5 text-sm font-semibold text-stone-900 shadow-lg shadow-amber-900/20 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-amber-900/30"
          >
            Browse Courses
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center rounded-lg border border-stone-400/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-stone-100 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-amber-200/60 hover:bg-white/10"
          >
            Upcoming Events
          </Link>
        </div>
      </div>
    </section>
  );
}
