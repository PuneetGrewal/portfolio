'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Maximize2, Mountain, MountainSnow } from 'lucide-react';

export function MountainItem({ mountain }) {
  const [isEnlarged, setIsEnlarged] = useState(false);
  
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
            src={mountain.image || "/placeholder.svg"}
            alt={mountain.name}
            width={3024}
            height={4032}
            className={`
              object-cover 
              ${isEnlarged ? 'w-auto h-auto' : 'w-full h-64'} // Dynamically adjust size based on enlarged state
              rounded-lg
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
        
        {/* Mountain info overlay */}
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
            {mountain.name}
          </p>
          <p className={`text-white drop-shadow-md mt-1 ${isEnlarged ? 'text-[10px]' : 'text-xs'} flex items-center`}>
            <MountainSnow className="w-6 h-6 text-white mr-2" />
            <span>{mountain.altitude}</span>
          </p>
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
