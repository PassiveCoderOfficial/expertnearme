'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';

export default function SaveExpertButton({ expertId }: { expertId: number }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me/saved')
      .then(r => {
        if (r.status === 401) { setAuthed(false); return null; }
        setAuthed(true);
        return r.json();
      })
      .then(d => {
        if (!d?.saved) return;
        setSaved(d.saved.some((s: { expert: { id: number } }) => s.expert.id === expertId));
      })
      .catch(() => {});
  }, [expertId]);

  const toggle = async () => {
    if (authed === false) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/me/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expertId }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      const d = await res.json();
      setSaved(d.saved);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Saved' : 'Save expert'}
      className={`inline-flex items-center gap-2 border font-medium px-3 py-2 rounded-xl transition-colors text-sm ${
        saved
          ? 'border-orange-400 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10'
          : 'border-slate-200 dark:border-white/15 hover:border-orange-400 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-white'
      }`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart className={`w-4 h-4 ${saved ? 'fill-orange-500 text-orange-500' : ''}`} />
      )}
      <span className="hidden sm:inline text-xs">{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
