import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Yan Lai Art — our story, our teaching philosophy, and our welcoming community of artists and makers.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About Yan Lai Art"
        subtitle="A studio for makers, learners, and lifelong artists"
      />
      <div className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-50 py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-20 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-4xl space-y-12 px-4 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-2xl font-semibold text-stone-900">Our Story</h2>
          <p className="mt-4 leading-relaxed text-stone-700">
            Yan Lai Art was founded on a simple belief: creativity is for everyone.
            What began as a small drawing circle has grown into a welcoming studio
            that offers courses in drawing, painting, and ceramics — as well as
            online lectures on the traditions of Eastern and Western art. Our
            students range from complete beginners picking up a pencil for the
            first time to seasoned makers refining their craft.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-stone-900">
            How We Teach
          </h2>
          <p className="mt-4 leading-relaxed text-stone-700">
            We believe great art teaching balances rigor with encouragement.
            Every course is structured around small class sizes, direct
            observation, and generous critique. Whether you are learning
            perspective in Fundamentals of Drawing, throwing your first bowl in
            the pottery studio, or discussing brushwork in the appreciation
            course, our instructors meet you where you are and help you take the
            next step.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-stone-900">What We Offer</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-stone-300/60 bg-stone-50/85 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-stone-400 hover:shadow-xl hover:shadow-stone-500/15">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-slate-300/30 blur-3xl transition-transform group-hover:scale-150" />
              <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-stone-300/30 blur-3xl transition-transform group-hover:scale-150" />
              <h3 className="relative text-lg font-semibold text-stone-900">Drawing</h3>
              <p className="relative mt-2 text-sm text-stone-700">
                Fundamentals, creative still life, and outdoor sketching for
                every level.
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-amber-300/60 bg-stone-50/85 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-amber-700/60 hover:shadow-xl hover:shadow-amber-900/15">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-300/40 blur-3xl transition-transform group-hover:scale-150" />
              <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-orange-300/30 blur-3xl transition-transform group-hover:scale-150" />
              <h3 className="relative text-lg font-semibold text-stone-900">Painting</h3>
              <p className="relative mt-2 text-sm text-stone-700">
                Watercolor landscapes, acrylic abstract art, and comparative art
                appreciation.
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-300/60 bg-stone-50/85 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-emerald-700/60 hover:shadow-xl hover:shadow-emerald-900/15">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-300/40 blur-3xl transition-transform group-hover:scale-150" />
              <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-stone-300/30 blur-3xl transition-transform group-hover:scale-150" />
              <h3 className="relative text-lg font-semibold text-stone-900">Ceramic</h3>
              <p className="relative mt-2 text-sm text-stone-700">
                Hand-building, wheel throwing, and sculpture — book studio time
                by the hour.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-stone-900">Our Studio</h2>
          <p className="mt-4 leading-relaxed text-stone-700">
            Our studio is a bright, well-equipped space designed for focused work
            and creative exchange. Easels, drawing horses, potter&apos;s wheels,
            and a full glaze library are all here waiting for you. Come make
            something with us.
          </p>
        </section>
        </div>
      </div>
    </>
  );
}
