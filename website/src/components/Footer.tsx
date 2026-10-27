import React from 'react';
import { ExternalLink } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#000000] border-t border-white/10 py-12 text-zinc-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <Logo className="w-5 h-5 !p-0.5" />
              <span className="text-sm font-bold text-white tracking-tight">Skill Nexus</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Universal skill management and symlink distribution for AI coding agents.
            </p>
            <div className="text-[11px] font-mono text-zinc-500">
              MIT License • v1.1.0
            </div>
          </div>

          {/* Agents */}
          <div className="space-y-2">
            <h5 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px] font-mono">
              Ecosystem
            </h5>
            <ul className="space-y-1.5 text-zinc-400">
              <li><a href="#agents" className="hover:text-white transition-colors">Claude Code (~/.claude)</a></li>
              <li><a href="#agents" className="hover:text-white transition-colors">Google Antigravity (~/.gemini)</a></li>
              <li><a href="#agents" className="hover:text-white transition-colors">Cursor (.cursor/rules)</a></li>
              <li><a href="#agents" className="hover:text-white transition-colors">Windsurf (.windsurfrules)</a></li>
              <li><a href="#agents" className="hover:text-white transition-colors">OpenAI Codex (~/.codex)</a></li>
            </ul>
          </div>

          {/* Docs */}
          <div className="space-y-2">
            <h5 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px] font-mono">
              Tooling
            </h5>
            <ul className="space-y-1.5 text-zinc-400">
              <li><a href="#terminal" className="hover:text-white transition-colors">CLI Terminal Simulator</a></li>
              <li><a href="#studio" className="hover:text-white transition-colors">SKILL.md Studio & Generator</a></li>
              <li><a href="#compare" className="hover:text-white transition-colors">Architecture Comparison</a></li>
              <li><a href="#docs" className="hover:text-white transition-colors">Team Project Scoping (.skills/)</a></li>
              <li><a href="#install" className="hover:text-white transition-colors">Installation Channels</a></li>
            </ul>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <h5 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px] font-mono">
              Repository
            </h5>
            <ul className="space-y-1.5 text-zinc-400">
              <li>
                <a
                  href="https://github.com/Peerawit-Y/skill-nexus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Peerawit-Y/skill-nexus/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Releases & Binaries</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/skill-nexus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>npm Registry (skill-nexus)</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 text-[11px] font-mono">
          <div>
            © {new Date().getFullYear()} Skill Nexus by <a href="https://github.com/Peerawit-Y" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white">Peerawit-Y</a>.
          </div>
          <div>
            Built with TypeScript & React
          </div>
        </div>
      </div>
    </footer>
  );
};
