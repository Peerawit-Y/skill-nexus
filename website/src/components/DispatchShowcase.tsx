import React from 'react';
import { HeroVisual } from './HeroVisual';
import { Network } from 'lucide-react';

export const DispatchShowcase: React.FC = () => {
  return (
    <section id="dispatch" className="py-16 md:py-24 bg-[#000000] border-b border-white/10 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Network className="w-3.5 h-3.5" />
            <span>INTERACTIVE SIMULATION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Real-Time Symlink Dispatch Engine
          </h2>
          <p className="text-zinc-400 text-sm">
            Simulate how Skill Nexus links your central skill files into active agent environments in milliseconds.
          </p>
        </div>

        {/* The Live Interactive Visualizer */}
        <HeroVisual />
      </div>
    </section>
  );
};
