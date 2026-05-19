'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

export default function OwnerEditButton({ expertEmail }: { expertEmail: string }) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return;
        if (data?.user?.email && data.user.email === expertEmail) setIsOwner(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [expertEmail]);

  if (!isOwner) return null;

  return (
    <div className="flex flex-wrap gap-2 pb-1">
      <Link href="/dashboard/profile"
        className="inline-flex items-center gap-2 border border-orange-500/40 hover:border-orange-500/70 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-medium px-4 py-2 rounded-xl transition-colors text-sm">
        <Pencil className="w-4 h-4" /> Edit Profile
      </Link>
    </div>
  );
}
