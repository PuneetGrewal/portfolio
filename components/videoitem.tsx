'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function VideoItem({ src, title }) {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const enlargedRef = useRef<HTMLVideoElement>(null);
  const tileRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // autoPlay stays in the markup because the server can't know the visitor's
  // motion setting, and React won't drop the attribute when it hydrates.
  // Pausing here stops the video, or keeps it from starting if it hasn't yet.
  useEffect(() => {
    if (prefersReducedMotion()) videoRef.current?.pause();
  }, []);

  // The enlarged clip opens in an overlay that fits the screen, like the
  // photos, instead of scaling the tile in place, which ran off phones.
  useEffect(() => {
    if (!isEnlarged) return;

    const tileVideo = videoRef.current;
    const tileButton = tileRef.current;
    const reduce = prefersReducedMotion();
    if (reduce) enlargedRef.current?.pause();
    tileVideo?.pause(); // one clip playing at a time
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsEnlarged(false);
      // The close button is the only control, so Tab stays on it.
      if (event.key === 'Tab') {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKeyDown);
      if (!reduce) tileVideo?.play().catch(() => {});
      tileButton?.focus();
    };
  }, [isEnlarged]);

  return (
    <div className="relative aspect-video group">
      <button
        ref={tileRef}
        type="button"
        aria-label={`Enlarge ${title}`}
        aria-haspopup="dialog"
        aria-expanded={isEnlarged}
        data-mx-media
        className="block h-full w-full text-left cursor-pointer border border-border transition-[border-color,box-shadow] duration-300 hover:border-phosphor hover:shadow-[0_0_24px_color-mix(in_srgb,var(--color-phosphor)_20%,transparent)]"
        onClick={() => setIsEnlarged(true)}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover transition-[filter] duration-300 group-hover:brightness-90"
          src={src}
        />

        {/* Hover effect overlay with icon */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
      </button>

      {/* Rendered into <body>, so no ancestor can trap the fixed overlay and
          hovering it doesn't count as hovering the tile. */}
      {isEnlarged &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
            onClick={() => setIsEnlarged(false)}
          >
            <button
              ref={closeRef}
              type="button"
              aria-label="Close video"
              className="absolute top-4 right-4 rounded-full p-2.5 text-white transition-colors hover:bg-white/20"
              onClick={() => setIsEnlarged(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <video
              ref={enlargedRef}
              autoPlay
              muted
              loop
              playsInline
              src={src}
              className="max-h-[85vh] max-w-[90vw] shadow-xl"
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
