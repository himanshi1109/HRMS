import React from 'react';

export const DotPattern = ({ className = '', opacity = 0.2 }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="w-full h-full animate-float opacity-80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dotGrid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="12"
              cy="12"
              r="1.5"
              fill="#704A3C"
              style={{ opacity }}
              className="animate-pulse-slow"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
      </svg>
    </div>
  );
};

export default DotPattern;
