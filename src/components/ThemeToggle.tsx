'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark', icon: Moon, label: 'Dark' },
] as const;

type ThemeValue = (typeof OPTIONS)[number]['value'];

function themeStyles(value: ThemeValue): string {
  if (value === 'light') {
    return 'bg-white border-slate-200 text-orange-500 shadow-sm';
  }
  if (value === 'dark') {
    return 'bg-slate-800 border-orange-500/60 text-white shadow-sm';
  }
  return 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-300';
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[0];
  const Icon = current.icon;

  const cycleTheme = () => {
    const idx = OPTIONS.findIndex((o) => o.value === theme);
    setTheme(OPTIONS[(idx + 1) % OPTIONS.length].value);
  };

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${current.label} — click to cycle`}
      className={`flex items-center justify-center w-9 h-9 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${themeStyles(current.value)}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
