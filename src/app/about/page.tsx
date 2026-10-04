import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { getAboutContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "In a fast-moving world, Yan Lai Art invites children — and everyone — to slow down, listen inward, and let painting and handcraft become a quiet conversation with the self.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const content = await getAboutContent();
  const [paragraph1, paragraph2, paragraph3] = [
    content.paragraph1,
    content.paragraph2,
    content.paragraph3,
  ];
  return (
    <>
      <PageHero
        title={content.heroTitle}
        subtitle={content.heroSubtitle}
        backgroundImage="/images/temple.jpg"
        backgroundImagePosition="center 55%"
      />
      <div className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-50 py-14 sm:py-20 md:py-28">
        <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-20 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <article className="relative overflow-hidden rounded-3xl border border-stone-300/60 bg-stone-50/85 px-5 py-10 shadow-sm backdrop-blur-sm sm:px-10 sm:py-16 md:px-14 md:py-20">
            {/* Ghosted landscape — the mission text sits on the artist's painting like calligraphy on silk */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/landscape.jpg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.09] mix-blend-multiply"
              style={{
                objectPosition: "center 20%",
                maskImage:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.3) 60%, transparent 90%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.3) 60%, transparent 90%)",
              }}
            />
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />

            <p
              lang="zh-Hans"
              style={{
                fontFamily:
                  'var(--font-noto-serif-sc), "Songti SC", "STSong", "SimSun", "Noto Serif CJK SC", serif',
                textIndent: "2em",
                ...({ textJustify: "inter-ideograph" } as unknown as React.CSSProperties),
              }}
              className="relative mx-auto max-w-2xl text-justify text-[1.05rem] font-medium leading-[2.05] tracking-[0.04em] text-stone-900 sm:text-[1.2rem] sm:leading-[2.15] md:text-[1.35rem]"
            >
              {content.introZh}
            </p>

            <div className="relative mx-auto mt-12 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-stone-400/70" />
              <span className="h-1.5 w-1.5 rotate-45 bg-amber-700/60" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-stone-400/70" />
            </div>

            <div className="relative mt-12 space-y-6 text-stone-700">
              <p className="text-lg leading-[1.9] first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-serif first-letter:text-5xl first-letter:font-semibold first-letter:leading-none first-letter:text-amber-800 sm:text-xl sm:leading-[1.9]">
                {paragraph1}
              </p>

              <p className="text-base leading-[1.9] text-stone-600 sm:text-lg">
                {paragraph2}
              </p>

              <p className="text-base leading-[1.9] text-stone-600 sm:text-lg">
                {paragraph3}
              </p>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
