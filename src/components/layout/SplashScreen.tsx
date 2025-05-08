
import React from 'react';

const textToAnimate = "SAJID";
const letters = textToAnimate.split('');

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] overflow-hidden animate-background-pan">
      <h1 
        className="text-7xl sm:text-8xl md:text-9xl font-extrabold text-primary"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        aria-label={textToAnimate}
      >
        {letters.map((letter, index) => (
          <span
            key={index}
            className="inline-block letter-animate"
            style={{
              animationDelay: `${index * 0.15}s`,
              transformOrigin: 'center center -10px', // slight z offset for better rotation feel
            }}
            aria-hidden="true"
          >
            {letter === ' ' ? '\u00A0' : letter} {/* Handle spaces if any */}
          </span>
        ))}
      </h1>
    </div>
  );
}

