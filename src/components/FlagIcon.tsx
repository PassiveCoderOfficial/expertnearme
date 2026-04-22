'use client';

import { Suspense, lazy, ComponentType } from 'react';

// Dynamically load the SVG flag component for a given ISO country code.
// country-flag-icons/react/3x2 exports one React component per country (e.g. BD, AE, SG).
interface FlagSvgProps extends React.SVGProps<SVGSVGElement> {}

interface FlagIconProps {
  countryCode: string;         // ISO 3166-1 alpha-2 (e.g. 'bd', 'ae', 'sg')
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
}

function FlagFallback({ code, width, height }: { code: string; width?: number | string; height?: number | string }) {
  return (
    <span
      className="inline-flex items-center justify-center text-xs font-bold text-slate-300 bg-slate-700 rounded"
      style={{ width: width || 20, height: height || 15 }}
    >
      {code.slice(0, 2)}
    </span>
  );
}

export default function FlagIcon({ countryCode, className = '', width = 20, height = 15, style }: FlagIconProps) {
  const code = countryCode.toUpperCase();

  // Lazy-load the specific flag SVG component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const FlagComponent = lazy<ComponentType<FlagSvgProps>>(() =>
    import(`country-flag-icons/react/3x2`)
      .then((mod) => {
        const Comp = (mod as Record<string, ComponentType<FlagSvgProps>>)[code];
        if (!Comp) throw new Error(`No flag for ${code}`);
        return { default: Comp };
      })
      .catch(() => ({ default: () => <FlagFallback code={code} width={width} height={height} /> as unknown as null }))
  );

  return (
    <Suspense fallback={<FlagFallback code={code} width={width} height={height} />}>
      <FlagComponent
        className={`inline-block rounded-sm overflow-hidden ${className}`}
        style={{ display: 'inline-block', width, height, verticalAlign: 'middle', ...style }}
        aria-label={`${code} flag`}
      />
    </Suspense>
  );
}
