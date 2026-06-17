import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[url('https://placehold.co/1920x600/1f2937/1f2937?text=')] bg-cover bg-center opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Yan Lai Art
          <span className="mt-2 block text-2xl font-light text-gray-300 sm:text-3xl">
            燕来艺术
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
          Discover your creative potential through drawing, painting, and ceramic art.
          Join our welcoming community of artists and makers.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/courses"
            className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-100"
          >
            Browse Courses
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center rounded-lg border border-gray-400 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Upcoming Events
          </Link>
        </div>
      </div>
    </section>
  );
}
