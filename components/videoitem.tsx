'use client';
import { useEffect, useRef, useState } from 'react';
import { Maximize2 } from 'lucide-react';

export function VideoItem({ src, title }) {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // autoPlay stays in the markup because the server can't know the visitor's
  // motion setting, and React won't drop the attribute when it hydrates.
  // Pausing here stops the video, or keeps it from starting if it hasn't yet.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      videoRef.current?.pause();
    }
  }, []);
  
  return (
    <div className="relative aspect-video rounded-lg group">
      <button
        type="button"
        aria-label={`Enlarge ${title}`}
        aria-expanded={isEnlarged}
        className={`
          block w-full text-left
          cursor-pointer
          transition-all duration-300 transform
          origin-center
          ${isEnlarged ? 'scale-[4.5] z-20' : 'hover:scale-120'}
        `}
        style={{
          position: isEnlarged ? 'relative' : 'static',
        }}
        onClick={() => setIsEnlarged(!isEnlarged)}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className={`
            w-full h-full object-cover rounded-lg
            transition-[filter] duration-300
            group-hover:brightness-90
            ${isEnlarged ? 'shadow-xl' : ''}
          `}
          src={src}
        />
        
        {/* Hover effect overlay with icon */}
        {!isEnlarged && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        )}
      </button>
      
      {/* Backdrop when enlarged */}
      {isEnlarged && (
        <div 
          className="fixed inset-0 bg-black/60 z-10 backdrop-blur-sm"
          onClick={() => setIsEnlarged(false)}
        />
      )}
    </div>
  );
}