import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'nexus-core' | 'orbital-knot' | 'hex-hub';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "w-7 h-7", 
  variant = 'nexus-core' 
}) => {
  if (variant === 'orbital-knot') {
    // Interlocking S-N ribbon knot with central junction
    return (
      <div className={`relative flex items-center justify-center rounded-lg bg-[#0d0f14] border border-white/20 p-1 group-hover:border-cyan-400/50 transition-colors ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M7 8C7 5.79086 8.79086 4 11 4H15C17.2091 4 19 5.79086 19 8C19 10.2091 17.2091 12 15 12H9C6.79086 12 5 13.7909 5 16C5 18.2091 6.79086 20 9 20H13C15.2091 20 17 18.2091 17 16"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="2.5" fill="#00d2ff" />
          <circle cx="12" cy="12" r="4.5" stroke="#00d2ff" strokeWidth="1" strokeOpacity="0.4" />
        </svg>
      </div>
    );
  }

  if (variant === 'hex-hub') {
    // Hexagonal dispatch hub
    return (
      <div className={`relative flex items-center justify-center rounded-lg bg-[#0d0f14] border border-white/20 p-1 group-hover:border-cyan-400/50 transition-colors ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Hexagon outline */}
          <path
            d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Radial Spokes to center */}
          <path d="M12 2V12M20.66 17L12 12M3.34 17L12 12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2.5" fill="#00d2ff" />
        </svg>
      </div>
    );
  }

  // Default flagship: "The Nexus Core"
  // Precision Central Node with 4 orbital vectors representing symlinks distributing out to multiple AI agents
  return (
    <div className={`relative flex items-center justify-center rounded-lg bg-[#0d0f14] border border-white/20 p-1 group-hover:border-cyan-400/50 transition-colors ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Converging vector tracks */}
        <path
          d="M12 3V6M12 18V21M3 12H6M18 12H21"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Diagonals / Corner satellite points */}
        <path
          d="M6.34 6.34L8.46 8.46M15.54 15.54L17.66 17.66M6.34 17.66L8.46 15.54M15.54 8.46L17.66 6.34"
          stroke="#00d2ff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        {/* Core Nexus Ring */}
        <circle cx="12" cy="12" r="4" stroke="#ffffff" strokeWidth="1.75" />
        {/* Center Active Nucleus */}
        <circle cx="12" cy="12" r="1.75" fill="#00d2ff" />
      </svg>
    </div>
  );
};
