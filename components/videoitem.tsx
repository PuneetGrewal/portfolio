'use client';
import { useState } from 'react';
import { Maximize2 } from 'lucide-react';

export function VideoItem({ src, title }) {
  const [isEnlarged, setIsEnlarged] = useState(false);
  
  return (
    <div className="relative aspect-video rounded-lg group">
      <div 
        className={`
          cursor-pointer 
          transition-all duration-300 transform 
          origin-center
          ${isEnlarged ? 'scale-[4.5] z-20' : 'hover:scale-120'}
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
        <video
          autoPlay
          muted
          loop
          playsInline
          className={`
            w-full h-full object-cover rounded-lg
            transition-filter duration-300
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