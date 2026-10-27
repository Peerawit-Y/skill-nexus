import React, { useState } from 'react';
import { Terminal, Copy, Check, Menu, X, Search } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('npm install -g skill-nexus');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Name */}
          <div className="flex items-center gap-6">
            <a href="#" className="flex items-center gap-2.5 group">
              <Logo className="w-7 h-7" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-white">
                  Skill Nexus
                </span>
                <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-white/10">
                  v1.1.0
                </span>
              </div>
            </a>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-zinc-400">
              <a href="#dispatch" className="hover:text-white transition-colors">Dispatch</a>
              <a href="#terminal" className="hover:text-white transition-colors">Terminal</a>
              <a href="#agents" className="hover:text-white transition-colors">Agents</a>
              <a href="#playground" className="hover:text-white transition-colors">Matrix</a>
              <a href="#studio" className="hover:text-white transition-colors">Studio</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#compare" className="hover:text-white transition-colors">Comparison</a>
              <a href="#docs" className="hover:text-white transition-colors">Docs</a>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 border border-white/10 hover:border-white/25 text-xs text-zinc-400 hover:text-zinc-200 transition-all font-mono"
              title="Search (Cmd + K)"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>Search</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 border border-zinc-700">⌘K</kbd>
            </button>

            <button
              onClick={copyCommand}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-cyan-500/50 text-xs font-mono text-zinc-300 hover:text-white transition-all group"
              title="Copy npm install command"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>npm i -g skill-nexus</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
              )}
            </button>

            <a
              href="https://github.com/Peerawit-Y/skill-nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              title="GitHub Repository"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-5 bg-black border-b border-white/10 space-y-2">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSearch?.();
            }}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-left text-xs font-mono text-zinc-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Search commands & topics</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 border border-zinc-700">⌘K</kbd>
          </button>
          <div className="flex flex-col space-y-1 text-xs text-zinc-300 pt-1">
            <a href="#terminal" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded hover:bg-zinc-900">CLI Terminal</a>
            <a href="#agents" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded hover:bg-zinc-900">Supported Agents</a>
            <a href="#playground" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded hover:bg-zinc-900">Distribution Matrix</a>
            <a href="#studio" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded hover:bg-zinc-900">Skill Studio & Generator</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded hover:bg-zinc-900">Core Features</a>
            <a href="#compare" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded hover:bg-zinc-900">Comparison</a>
            <a href="#docs" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded hover:bg-zinc-900">Documentation</a>
            <a href="#install" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded hover:bg-zinc-900">Installation</a>
          </div>
        </div>
      )}
    </header>
  );
};
