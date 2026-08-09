interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-base text-gray-600 sm:text-lg">{subtitle}</p>
      )}
    </div>
  );
}
