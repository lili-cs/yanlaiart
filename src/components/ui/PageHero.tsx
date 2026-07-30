import BrushDivider from "./BrushDivider";

interface PageHeroProps {
  title: string;
  subtitle?: string;
}

export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-neutral-900 to-stone-950 py-16 sm:py-20">
      {/* Ink + mineral pigment blobs — muted, painterly */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-24 -top-16 h-80 w-80 rounded-full bg-amber-700/30 mix-blend-screen blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute right-0 top-1/2 h-96 w-96 rounded-full bg-emerald-800/25 mix-blend-screen blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-orange-800/30 mix-blend-screen blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute right-1/4 top-0 h-64 w-64 rounded-full bg-slate-600/25 mix-blend-screen blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 texture-paper opacity-40" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="animate-fade-rise text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="animate-gradient bg-gradient-to-r from-amber-100 via-stone-100 to-emerald-100 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        <div className="animate-fade-rise animation-delay-200">
          <BrushDivider />
        </div>
        {subtitle && (
          <p className="animate-fade-rise animation-delay-400 mx-auto mt-3 max-w-2xl text-lg text-stone-300">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
