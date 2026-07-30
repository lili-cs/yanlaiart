import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Yan Lai Art — our story, our teaching philosophy, and our welcoming community of artists and makers.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        title="About Yan Lai Art"
        subtitle="A studio for makers, learners, and lifelong artists"
      />

      <div className="mt-12 space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Our Story</h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Yan Lai Art was founded on a simple belief: creativity is for everyone.
            What began as a small drawing circle has grown into a welcoming studio
            that offers courses in drawing, painting, and ceramics — as well as
            online lectures on the traditions of Eastern and Western art. Our
            students range from complete beginners picking up a pencil for the
            first time to seasoned makers refining their craft.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            How We Teach
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
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
          <h2 className="text-2xl font-semibold text-gray-900">What We Offer</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">Drawing</h3>
              <p className="mt-2 text-sm text-gray-600">
                Fundamentals, creative still life, and outdoor sketching for
                every level.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">Painting</h3>
              <p className="mt-2 text-sm text-gray-600">
                Watercolor landscapes, acrylic abstract art, and comparative art
                appreciation.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">Ceramic</h3>
              <p className="mt-2 text-sm text-gray-600">
                Hand-building, wheel throwing, and sculpture — book studio time
                by the hour.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Our Studio</h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Our studio is a bright, well-equipped space designed for focused work
            and creative exchange. Easels, drawing horses, potter&apos;s wheels,
            and a full glaze library are all here waiting for you. Come make
            something with us.
          </p>
        </section>
      </div>
    </div>
  );
}
