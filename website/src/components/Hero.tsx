import React, { useState } from 'react';
import { ArrowRight, Copy, Check, Terminal, Shield, FolderSync, Cpu, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { ClothWaveCanvas } from './ClothWaveCanvas';

export const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'npm' | 'npx' | 'brew' | 'curl'>('npm');
  const [copied, setCopied] = useState(false);

  const installCommands = {
    npm: 'npm install -g skill-nexus',
    npx: 'npx skill-nexus init',
    brew: 'brew tap Peerawit-Y/tap && brew install skill-nexus',
    curl: 'curl -fsSL https://raw.githubusercontent.com/Peerawit-Y/skill-nexus/main/install.sh | bash'
  };

  const copyInstallCommand = () => {
    navigator.clipboard.writeText(installCommands[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const easeExpo = [0.16, 1, 0.3, 1] as const;

  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-10 sm:py-12 md:py-16 border-b border-white/10 bg-[#000000] overflow-hidden">
      {/* Procedural Cloth & Shore Wave Canvas Effect */}
      <ClothWaveCanvas />

      {/* Subtle Tactical Geometric Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 z-[1]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 100%)'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          {/* Top Indicator Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeExpo }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 backdrop-blur border border-white/15 text-xs font-mono text-zinc-300 cursor-default shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Universal Agent Skill Hub</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Auto-Discovery & Symlinks</span>
          </motion.div>

          {/* Main Title - Compact clamp ceiling to fit on laptops */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeExpo }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.08]"
          >
            One Hub for All Your AI Coding Agents
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: easeExpo }}
            className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto"
          >
            Centralized skill management and symlink distribution for Claude Code, Google Antigravity, Cursor, Windsurf, and Codex. Zero duplication across macOS, Linux, and Windows.
          </motion.p>

          {/* Command Switcher Box */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeExpo }}
            className="pt-2 max-w-xl mx-auto"
          >
            <div className="rounded-xl bg-[#090a0d]/90 backdrop-blur-md border border-white/15 p-2 shadow-xl shadow-black/50">
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 pb-2 border-b border-white/10 px-2 text-xs font-mono">
                <span className="text-zinc-500 mr-2 text-[11px] uppercase tracking-wider font-semibold">Channel:</span>
                {(['npm', 'npx', 'brew', 'curl'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeTab === tab
                        ? 'bg-zinc-800 text-white font-medium border border-white/10'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Command Display */}
              <div className="flex items-center justify-between px-3 py-2 mt-1 font-mono text-xs sm:text-sm text-zinc-100 bg-[#000000] rounded-lg border border-white/10 overflow-x-auto">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 select-none">$</span>
                  <span className="whitespace-nowrap">{installCommands[activeTab]}</span>
                </div>
                <button
                  onClick={copyInstallCommand}
                  className="ml-3 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
                  title="Copy command"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-sans">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="font-sans">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: easeExpo }}
            className="pt-1 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#dispatch"
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center gap-2 transition-transform active:scale-[0.98] shadow-md shadow-white/10"
            >
              <Terminal className="w-4 h-4" />
              <span>Explore Live Dispatch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="#docs"
              className="px-5 py-2.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 font-medium text-xs border border-white/15 transition-colors backdrop-blur"
            >
              CLI Documentation
            </a>
          </motion.div>

          {/* Technical Pillars Grid */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: easeExpo }}
            className="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-4xl mx-auto"
          >
            <div className="p-3.5 rounded-xl bg-[#090a0d]/85 backdrop-blur-md border border-white/10 space-y-1 hover:border-white/20 transition-colors">
              <div className="flex items-center gap-2 text-white text-xs font-semibold">
                <FolderSync className="w-4 h-4 text-cyan-400" />
                <span>Single Source of Truth</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Store skills once in <code className="text-zinc-300">~/.skill-nexus/</code>. Symlinks sync edits everywhere automatically.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090a0d]/85 backdrop-blur-md border border-white/10 space-y-1 hover:border-white/20 transition-colors">
              <div className="flex items-center gap-2 text-white text-xs font-semibold">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Zero-Elevation Windows</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Native NTFS Junctions without requiring WSL or Administrator prompt elevation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090a0d]/85 backdrop-blur-md border border-white/10 space-y-1 hover:border-white/20 transition-colors">
              <div className="flex items-center gap-2 text-white text-xs font-semibold">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Built-in Safety Linter</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Audits skills for API token leaks, hazardous shell commands, and prompt token budget.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
