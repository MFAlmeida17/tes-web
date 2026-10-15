import React from 'react';

interface LogoProps {
  variant?: 'full' | 'word';
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * Commodex Brand Logo traced from Canva Master (`src/assets/brand/logo.ts`):
 * - `full`: Navy badge (#1A2B3D) with Orange Frame (#F8A531), "Commod" + "Ex" in Amber (#E6930F)
 * - `word`: Wordmark only ("Commod" follows currentColor, "Ex" in #E6930F)
 */
export const CommodexLogo: React.FC<LogoProps> = ({
  variant = 'full',
  className = '',
  theme = 'dark',
}) => {
  if (variant === 'word') {
    return (
      <span
        className={`inline-flex items-baseline font-bold tracking-tight select-none whitespace-nowrap shrink-0 ${
          theme === 'dark' ? 'text-white' : 'text-[#2A211C]'
        } ${className}`}
      >
        <span>Commod</span>
        <span className="text-[#E6930F]">Ex</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0 ${className}`}
    >
      <svg
        width="148"
        height="38"
        viewBox="0 0 148 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-9 w-auto shrink-0"
        role="img"
        aria-label="Commodex"
      >
        {/* Outer Orange Frame (#F8A531) & Navy Badge (#1A2B3D) */}
        <rect
          x="1"
          y="1"
          width="146"
          height="36"
          rx="6"
          fill="#1A2B3D"
          stroke="#F8A531"
          strokeWidth="2"
        />
        {/* Subtle Maritime Trade Geometric Emblem */}
        <path
          d="M12 19C12 14.5817 15.5817 11 20 11H24L21 15.5H19.5C17.567 15.5 16 17.067 16 19C16 20.933 17.567 22.5 19.5 22.5H21L24 27H20C15.5817 27 12 23.4183 12 19Z"
          fill="#F8A531"
        />
        <path d="M23.5 14L28.5 19L23.5 24L21 21.5L23.5 19L21 16.5L23.5 14Z" fill="#EB980C" />
        {/* Wordmark "Commod" in Crisp White + "Ex" in Amber (#E6930F) */}
        <text
          x="34"
          y="24.5"
          fill="#FFFFFF"
          fontFamily="Plus Jakarta Sans, General Sans, sans-serif"
          fontWeight="700"
          fontSize="17.5"
          letterSpacing="-0.03em"
        >
          Commod<tspan fill="#E6930F">Ex</tspan>
        </text>
      </svg>
    </span>
  );
};

export const EssGroupEmblem: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-lg bg-[#1A2B3D] border border-[#F8A531]/30 text-white ${className}`}
  >
    <div className="w-8 h-8 rounded bg-[#EB980C] flex items-center justify-center font-mono font-bold text-xs text-[#26160E] shrink-0">
      ESS
    </div>
    <div className="text-left leading-tight">
      <div className="text-xs font-semibold text-white">PT Esystem Solutions Komoditi</div>
      <div className="text-[11px] text-[#E9E1D5]/75">Parent Commodity Holding Group</div>
    </div>
  </div>
);
