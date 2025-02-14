'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Maximize2 } from 'lucide-react';

export function PhotoItem({ photo }) {
  const [isEnlarged, setIsEnlarged] = useState(false);
  
  return (
    <div className="relative rounded-lg group">
      <div 
        className={`
          cursor-pointer 
          transition-all duration-300 transform 
          origin-center
          ${isEnlarged ? 'scale-[2.5] z-20' : 'hover:scale-110'}
        `}
        style={{
          position: isEnlarged ? 'relative' : 'static',
        }}
        tabIndex={0}
        onClick={() => setIsEnlarged(!isEnlarged)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsEnlarged(!isEnlarged);
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
              object-cover w-full h-64 rounded-lg
              transition-filter duration-300
              group-hover:brightness-90
              ${isEnlarged ? 'shadow-xl' : ''}
            `}
            priority
          />
          
          {/* Hover effect overlay */}
          {!isEnlarged && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          )}
        </div>
        
        {/* Caption overlay */}
        <div 
          className={`
            absolute inset-0 
            flex flex-col items-center justify-end 
            p-4 bg-gradient-to-t from-black/70 to-transparent 
            transition-opacity duration-300
            ${isEnlarged ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
        >
          <p className="text-white text-sm font-semibold drop-shadow-md">{photo.caption}</p>
          <p className="text-white text-xs drop-shadow-md">{photo.location}</p>
        </div>
      </div>
      
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