import React from 'react';
import { motion } from 'framer-motion';

export const WaveBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Ambient Top Glow */}
      <div 
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-30 blur-[100px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 210, 255, 0.4) 0%, rgba(0, 85, 255, 0.15) 50%, transparent 80%)'
        }}
      />

      {/* SVG Animated Wave Canvas */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 1440 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gradient 1: Deep Cyan to Electric Blue */}
          <linearGradient id="cyan-wave-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.22" />
            <stop offset="45%" stopColor="#0077ff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#002266" stopOpacity="0.02" />
          </linearGradient>

          {/* Gradient 2: Ice Cyan to Cobalt */}
          <linearGradient id="cyan-wave-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#0055ff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#001133" stopOpacity="0.01" />
          </linearGradient>

          {/* Gradient 3: Soft highlight crest */}
          <linearGradient id="cyan-wave-3" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00d2ff" stopOpacity="0.05" />
          </linearGradient>

          {/* Blur filter for smooth oceanic wave look */}
          <filter id="wave-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="24" />
          </filter>
        </defs>

        {/* Wave Layer 1: Slow Deep Undulation */}
        <motion.path
          d="M0,280 C320,160 540,380 840,240 C1140,100 1320,320 1440,260 L1440,700 L0,700 Z"
          fill="url(#cyan-wave-1)"
          filter="url(#wave-blur)"
          animate={{
            d: [
              "M0,280 C320,160 540,380 840,240 C1140,100 1320,320 1440,260 L1440,700 L0,700 Z",
              "M0,240 C360,340 600,160 900,300 C1200,440 1300,180 1440,290 L1440,700 L0,700 Z",
              "M0,300 C280,200 500,360 800,210 C1100,60 1360,280 1440,250 L1440,700 L0,700 Z",
              "M0,280 C320,160 540,380 840,240 C1140,100 1320,320 1440,260 L1440,700 L0,700 Z"
            ]
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Wave Layer 2: Counter-Phase Sweeping Wave */}
        <motion.path
          d="M0,380 C360,490 620,280 920,400 C1220,520 1340,340 1440,370 L1440,700 L0,700 Z"
          fill="url(#cyan-wave-2)"
          filter="url(#wave-blur)"
          animate={{
            d: [
              "M0,380 C360,490 620,280 920,400 C1220,520 1340,340 1440,370 L1440,700 L0,700 Z",
              "M0,420 C290,270 560,460 860,330 C1160,200 1380,430 1440,360 L1440,700 L0,700 Z",
              "M0,350 C380,480 650,310 940,430 C1230,550 1310,310 1440,390 L1440,700 L0,700 Z",
              "M0,380 C360,490 620,280 920,400 C1220,520 1340,340 1440,370 L1440,700 L0,700 Z"
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Wave Layer 3: Crisp Crest Wave Line with Glow */}
        <motion.path
          d="M0,320 C340,210 580,420 880,280 C1180,140 1350,360 1440,300"
          stroke="url(#cyan-wave-3)"
          strokeWidth="2.5"
          fill="none"
          animate={{
            d: [
              "M0,320 C340,210 580,420 880,280 C1180,140 1350,360 1440,300",
              "M0,280 C380,390 640,210 940,340 C1240,470 1320,230 1440,330",
              "M0,340 C300,250 540,400 840,250 C1140,100 1380,330 1440,290",
              "M0,320 C340,210 580,420 880,280 C1180,140 1350,360 1440,300"
            ]
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>

      {/* Vignette gradients to keep text 100% legible against deep black canvas */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
    </div>
  );
};
