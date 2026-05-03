'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'system', icon: Monitor, label: 'System' },
    { value: 'dark', icon: Moon, label: 'Dark' },
  ] as const;

  const current = options.find((o) => o.value === theme) ?? options[2];
  const Icon = current.icon;

  const cycleTheme = () => {
    const idx = options.findIndex((o) => o.value === theme);
    const next = options[(idx + 1) % options.length];
    setTheme(next.value);
  };

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${current.label}`}
      className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/15 bg-white/6 text-slate-300 hover:text-white hover:border-orange-500/40 transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
