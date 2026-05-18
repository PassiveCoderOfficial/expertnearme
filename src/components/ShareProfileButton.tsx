'use client';

import { useState } from 'react';
import { Share2, Check, Link2 } from 'lucide-react';

export default function ShareProfileButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      title="Share profile"
      className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/15 hover:border-orange-400 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-white font-medium px-3 py-2 rounded-xl transition-colors text-sm"
    >
      {copied ? (
        <><Check className="w-4 h-4 text-green-500" /><span className="text-green-500 text-xs">Copied!</span></>
      ) : (
        <><Share2 className="w-4 h-4" /><span className="hidden sm:inline text-xs">Share</span></>
      )}
    </button>
  );
}
