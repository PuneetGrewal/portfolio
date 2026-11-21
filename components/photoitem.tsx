'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Maximize2, X } from 'lucide-react';

export function PhotoItem({ photo }) {
  const [isEnlarged, setIsEnlarged] = useState(false);

  useEffect(() => {
    if (isEnlarged) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEnlarged]);

  const handleClick = () => {
    setIsEnlarged(!isEnlarged);
  };

  return (
    <div className="relative group">
      {/* The tile doesn't scale while the lightbox is open: the photo shows
          there, and a 2x empty tile widened the page on phones. */}
      <button
        type="button"
        aria-label={`Enlarge ${photo.caption}`}
        aria-expanded={isEnlarged}
        className={`
          block w-full text-left
          cursor-pointer
          border border-border
          transition-[border-color,box-shadow] duration-300
          hover:border-phosphor hover:shadow-[0_0_24px_rgb(0_255_65/0.2)]
        `}
        style={{
          position: isEnlarged ? 'relative' : 'static',
        }}
        onClick={handleClick}
      >
        <div data-mx-media>
          {/* Hide the original image when enlarged */}
          <Image
            src={photo.src || "/placeholder.svg"}
            alt={photo.caption}
            width={3024}
            height={4032}
            className={`
              object-cover
              ${isEnlarged ? 'hidden' : 'w-full h-64'}
              transition-[filter] duration-300
              group-hover:brightness-90
            `}
            sizes="(min-width: 768px) 280px, 100vw"
          />

          {!isEnlarged && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          )}
        </div>

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
            {photo.caption}
          </p>
          <p className={`text-foreground drop-shadow-md ${isEnlarged ? 'text-xs' : 'text-[13px]'}`}>
            {photo.location}
          </p>
        </div>
      </button>

      {/* Modal overlay with transition */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/80 backdrop-blur-xs
          transition-opacity duration-300
          ${isEnlarged ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={handleClick} // Close on modal background click
      >
        <div
          className={`
            fixed inset-0 z-50 flex items-center justify-center
            transition-transform duration-300 motion-reduce:transition-none
            ${isEnlarged ? 'scale-100' : 'scale-95'}
          `}
        >
          {isEnlarged && (
            <>
              <button
                type="button"
                aria-label="Close photo"
                className="absolute top-4 right-4 p-2.5 text-white hover:bg-white/20 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent click from propagating to modal
                  handleClick(); // Close image when X is clicked
                }}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative max-w-[90vw] max-h-[90vh]">
                <Image
                  src={photo.src || "/placeholder.svg"}
                  alt={photo.caption}
                  width={3024}
                  height={4032}
                  className="object-contain max-h-[85vh] h-auto w-auto"
                />

                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                  <p className="text-phosphor-hot text-base font-semibold text-center drop-shadow-md">
                    {photo.caption}
                  </p>
                  <p className="text-foreground text-[13px] text-center drop-shadow-md">
                    {photo.location}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
