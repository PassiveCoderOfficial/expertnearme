"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <p className="text-7xl sm:text-8xl font-bold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent mb-2">
        500
      </p>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        Something went wrong
      </h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        An unexpected error occurred. Try again, or head back home.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/15 hover:border-orange-400 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Home className="w-4 h-4" /> Go home
        </Link>
      </div>
    </main>
  );
}
