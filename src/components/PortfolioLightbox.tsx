'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface PortfolioItem {
  id: number;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
}

function getVideoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    void u;
  } catch {}
  return null;
}

export default function PortfolioLightbox({ items }: { items: PortfolioItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const openIdx = open !== null ? items.findIndex(i => i.id === open) : -1;
  const current = openIdx >= 0 ? items[openIdx] : null;

  const prev = () => { if (openIdx > 0) setOpen(items[openIdx - 1].id); };
  const next = () => { if (openIdx < items.length - 1) setOpen(items[openIdx + 1].id); };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(null);
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setOpen(item.id)}
            className="group rounded-2xl bg-slate-800/50 border border-white/8 overflow-hidden hover:border-orange-500/30 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          >
            {item.imageUrl ? (
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={item.imageUrl}
                  alt={item.title ?? 'Portfolio'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.videoUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white opacity-80" />
                  </div>
                )}
              </div>
            ) : item.videoUrl ? (
              <div className="aspect-video bg-slate-800 flex flex-col items-center justify-center gap-2">
                <Play className="w-10 h-10 text-orange-400 fill-orange-400/30" />
                <span className="text-xs text-slate-400">Play Video</span>
              </div>
            ) : (
              <div className="aspect-video bg-slate-800 flex items-center justify-center">
                <span className="text-slate-600 text-xs">No preview</span>
              </div>
            )}
            {(item.title || item.description) && (
              <div className="p-3 text-left">
                {item.title && <p className="text-sm font-medium text-white truncate">{item.title}</p>}
                {item.description && <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{item.description}</p>}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open !== null && current && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(null)}
          onKeyDown={handleKey}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setOpen(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {openIdx > 0 && (
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {openIdx < items.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div
            className="max-w-4xl w-full mx-auto"
            onClick={e => e.stopPropagation()}
          >
            {current.videoUrl && getVideoEmbed(current.videoUrl) ? (
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
                <iframe
                  src={getVideoEmbed(current.videoUrl)!}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : current.imageUrl ? (
              <img
                src={current.imageUrl}
                alt={current.title ?? 'Portfolio'}
                className="max-h-[80vh] max-w-full mx-auto rounded-2xl object-contain"
              />
            ) : null}

            {(current.title || current.description) && (
              <div className="mt-4 text-center">
                {current.title && <p className="text-white font-semibold text-lg">{current.title}</p>}
                {current.description && <p className="text-slate-400 text-sm mt-1 max-w-2xl mx-auto">{current.description}</p>}
              </div>
            )}

            {items.length > 1 && (
              <p className="text-center text-slate-500 text-xs mt-3">{openIdx + 1} / {items.length}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
