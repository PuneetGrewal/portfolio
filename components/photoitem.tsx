'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Maximize2, X } from 'lucide-react';

export function PhotoItem({ photo }) {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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
    setIsTransitioning(true);
    setIsEnlarged(!isEnlarged);
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className="relative rounded-lg group">
      <div 
        className={`
          cursor-pointer 
          transition-all duration-300 transform 
          origin-center
          ${isEnlarged ? 'scale-[2.0] z-20' : 'hover:scale-115 rounded-lg'}
        `}
        style={{
          position: isEnlarged ? 'relative' : 'static',
        }}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div className="relative">
          <Image
            src={photo.src || "/placeholder.svg"}
            alt={photo.caption}
            width={3024}
            height={4032}
            className={`
              object-cover          
              ${isEnlarged ? 'hidden' : 'w-full h-64'}  // Hide the original image when enlarged
              rounded-lg
              transition-all duration-300
              group-hover:brightness-90
              ${isTransitioning ? 'transform scale 300' : ''}
            `}
            priority
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
            p-4 bg-gradient-to-t from-black/70 to-transparent 
            transition-opacity duration-300
            ${isEnlarged ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
        >
          <p className={`text-white font-semibold drop-shadow-md ${isEnlarged ? 'text-sm' : 'text-lg'}`}>
            {photo.caption}
          </p>
          <p className={`text-white drop-shadow-md ${isEnlarged ? 'text-xs' : 'text-sm'}`}>
            {photo.location}
          </p>
        </div>
      </div>
      
      {/* Modal overlay with transition */}
      <div 
        className={`
          fixed inset-0 z-40 bg-black/80 backdrop-blur-sm
          transition-opacity duration-300
          ${isEnlarged ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={handleClick} // Close on modal background click
      >
        <div 
          className={`
            fixed inset-0 z-50 flex items-center justify-center
            transition-transform duration-300
            ${isEnlarged ? 'scale-100' : 'scale-95'}
          `}
        >
          {isEnlarged && (
            <>
              <button
                className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
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
                  className="rounded-lg object-contain max-h-[85vh] h-auto w-auto"
                  priority
                />
                
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                  <p className="text-white text-lg font-semibold text-center drop-shadow-md">
                    {photo.caption}
                  </p>
                  <p className="text-white text-sm text-center drop-shadow-md">
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
