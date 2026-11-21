'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Maximize2, MountainSnow } from 'lucide-react';

export function MountainItem({ mountain }) {
  const [isEnlarged, setIsEnlarged] = useState(false);

  return (
    <div className="relative group">
      <button
        type="button"
        aria-label={`Enlarge ${mountain.name}`}
        aria-expanded={isEnlarged}
        className={`
          block w-full text-left
          cursor-pointer
          border border-border
          transition-all duration-300 transform motion-reduce:transition-none
          origin-center
          ${isEnlarged ? 'scale-[2.0] z-20' : 'hover:border-phosphor hover:shadow-[0_0_24px_color-mix(in_srgb,var(--color-phosphor)_20%,transparent)]'}
        `}
        style={{
          position: isEnlarged ? 'relative' : 'static',
        }}
        onClick={() => setIsEnlarged(!isEnlarged)}
      >
        <div data-mx-media>
          {/* Dynamically adjust size based on enlarged state. From 768px up,
              sizes is the enlarged width (twice the 276px tile) so it stays
              sharp; below that it's 100vw and the enlarged view is softer. */}
          <Image
            src={mountain.image || "/placeholder.svg"}
            alt={mountain.name}
            width={3024}
            height={4032}
            className={`
              object-cover
              ${isEnlarged ? 'w-auto h-auto' : 'w-full h-64'}
              transition-[filter] duration-300
              group-hover:brightness-90
              ${isEnlarged ? 'shadow-xl' : ''}
            `}
            sizes="(min-width: 768px) 552px, 100vw"
          />

          {/* Hover effect overlay */}
          {!isEnlarged && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          )}
        </div>

        {/* Mountain info overlay */}
        <div
          className={`
            absolute inset-0
            flex flex-col items-center justify-end
            p-4 bg-gradient-to-t from-background/90 to-transparent
            transition-opacity duration-300
            ${isEnlarged ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
        >
          <p className={`text-phosphor-hot font-semibold drop-shadow-md ${isEnlarged ? 'text-sm' : 'text-base'}`}>
            {mountain.name}
          </p>
          <p className={`text-foreground drop-shadow-md mt-1 ${isEnlarged ? 'text-[10px]' : 'text-[13px]'} flex items-center`}>
            <MountainSnow className="w-5 h-5 mr-2" />
            <span>{mountain.altitude}</span>
          </p>
        </div>
      </button>

      {/* Backdrop when enlarged */}
      {isEnlarged && (
        <div
          className="fixed inset-0 bg-black/60 z-10 backdrop-blur-xs"
          onClick={() => setIsEnlarged(false)}
        />
      )}
    </div>
  );
}
