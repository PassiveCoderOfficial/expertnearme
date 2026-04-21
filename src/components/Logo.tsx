"use client";

interface LogoProps {
  className?: string;
  size?: number;
  textClassName?: string;
  showText?: boolean;
}

export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pin body */}
      <path
        d="M18 3C12.477 3 8 7.477 8 13c0 7.5 10 20 10 20s10-12.5 10-20c0-5.523-4.477-10-10-10z"
        fill="url(#pin-gradient)"
      />
      {/* Inner circle */}
      <circle cx="18" cy="13" r="4.5" fill="white" fillOpacity="0.9" />
      {/* Star/dot accent inside circle */}
      <circle cx="18" cy="13" r="2" fill="url(#dot-gradient)" />
      <defs>
        <linearGradient id="pin-gradient" x1="8" y1="3" x2="28" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="dot-gradient" x1="16" y1="11" x2="20" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Logo({ className = "", size = 36, showText = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <span className="font-bold text-white tracking-tight" style={{ fontSize: size * 0.5 }}>
          ExpertNear<span className="text-orange-400">.Me</span>
        </span>
      )}
    </span>
  );
}
