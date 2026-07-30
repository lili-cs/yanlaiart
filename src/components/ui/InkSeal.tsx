interface InkSealProps {
  character?: string;
  size?: number;
  /** Rotation in degrees — small variations feel more hand-pressed. */
  rotation?: number;
  /** Seed for the turbulence filter so paired seals have unique edges. */
  seed?: number;
  className?: string;
}

/**
 * A hand-pressed Chinese seal (印章) rendered from SVG.
 *
 * Real seals are carved by hand from stone and pressed with cinnabar paste,
 * so the finished stamp is never a clean rectangle:
 *  - the edges are chipped and irregular
 *  - the red field has darker and lighter mottling where the paste took unevenly
 *  - tiny "missing ink" spots let the paper show through
 *  - the impression is often slightly tilted from the pressing angle
 */
export default function InkSeal({
  character = "燕",
  size = 40,
  rotation = -3,
  seed = 7,
  className = "",
}: InkSealProps) {
  const filterId = `sealRough-${seed}`;
  const gradientId = `sealCinnabar-${seed}`;

  return (
    <div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a83438" />
            <stop offset="50%" stopColor="#8b2226" />
            <stop offset="100%" stopColor="#701a1e" />
          </linearGradient>
          <filter
            id={filterId}
            x="-15%"
            y="-15%"
            width="130%"
            height="130%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="2"
              seed={seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        <g filter={`url(#${filterId})`}>
          <path
            d="M 4 6
               C 4 4.5, 5.5 3.5, 7 3.6
               L 43 4.2
               C 45 4.4, 46.5 5.2, 46.6 7
               L 46 42
               C 45.8 44.2, 44.5 45.4, 42.5 45.6
               L 7.5 46.4
               C 5.2 46.2, 3.8 44.8, 3.7 42.5
               Z"
            fill={`url(#${gradientId})`}
          />

          <ellipse cx="11" cy="12" rx="4.5" ry="2.5" fill="#4a0f13" opacity="0.42" />
          <ellipse cx="38" cy="9" rx="3.5" ry="4" fill="#4a0f13" opacity="0.38" />
          <ellipse cx="16" cy="41" rx="5.5" ry="2.2" fill="#4a0f13" opacity="0.32" />
          <ellipse cx="41" cy="34" rx="3.5" ry="3.5" fill="#4a0f13" opacity="0.38" />
          <ellipse cx="30" cy="16" rx="2.5" ry="1.5" fill="#4a0f13" opacity="0.25" />

          <circle cx="13" cy="30" r="1.7" fill="#f5ecd7" opacity="0.35" />
          <circle cx="35" cy="21" r="1.1" fill="#f5ecd7" opacity="0.28" />
          <circle cx="27" cy="41" r="0.9" fill="#f5ecd7" opacity="0.4" />
          <circle cx="45" cy="16" r="0.7" fill="#f5ecd7" opacity="0.5" />
          <circle cx="6" cy="24" r="0.9" fill="#f5ecd7" opacity="0.45" />

          <path d="M 3.5 8 L 5 6.5 L 4 10 Z" fill="#f5ecd7" opacity="0.35" />
          <path d="M 46 44 L 47 42 L 45.5 45.5 Z" fill="#f5ecd7" opacity="0.3" />
        </g>

        <text
          x="25"
          y="34"
          textAnchor="middle"
          fontSize="28"
          fontFamily='"STKaiti", "KaiTi", "Noto Serif SC", "Songti SC", "SimSun", serif'
          fontWeight="900"
          fill="#f5ecd7"
          style={{ letterSpacing: "-0.03em" }}
        >
          {character}
        </text>

        <circle cx="20" cy="24" r="0.6" fill="#8b2226" opacity="0.7" />
        <circle cx="31" cy="30" r="0.5" fill="#8b2226" opacity="0.7" />
      </svg>
    </div>
  );
}
