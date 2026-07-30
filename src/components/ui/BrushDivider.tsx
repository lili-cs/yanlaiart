export default function BrushDivider() {
  return (
    <div className="mx-auto flex max-w-md items-center justify-center py-2">
      <svg
        className="h-3 w-full"
        viewBox="0 0 400 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 6 C 60 2, 120 10, 200 6 S 340 2, 396 6"
          stroke="url(#brushDividerGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <defs>
          <linearGradient
            id="brushDividerGradient"
            x1="0"
            y1="0"
            x2="400"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#a16207" stopOpacity="0" />
            <stop offset="50%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#a16207" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
