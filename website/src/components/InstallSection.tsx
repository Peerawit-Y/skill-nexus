import React, { useState } from 'react';
import { Download, Check, Copy, ExternalLink } from 'lucide-react';

export const InstallSection: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const methods = [
    {
      id: 'npm',
      title: 'NPM Global',
      desc: 'Recommended for Node.js environments on macOS, Linux, and Windows.',
      cmd: 'npm install -g skill-nexus',
      recommended: true
    },
    {
      id: 'brew',
      title: 'Homebrew',
      desc: 'Native macOS package management via custom tap.',
      cmd: 'brew tap Peerawit-Y/tap && brew install skill-nexus',
      recommended: false
    },
    {
      id: 'curl',
      title: 'Shell Script',
      desc: 'Downloads precompiled binary for macOS/Linux with zero Node.js dependency.',
      cmd: 'curl -fsSL https://raw.githubusercontent.com/Peerawit-Y/skill-nexus/main/install.sh | bash',
      recommended: false
    },
    {
      id: 'npx',
      title: 'Zero-Install (npx)',
      desc: 'Run directly without permanent global installation.',
      cmd: 'npx skill-nexus init',
      recommended: false
    }
  ];

  return (
    <section id="install" className="py-16 md:py-24 bg-[#000000] border-b border-white/10 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Installation Channels
          </h2>
          <p className="text-zinc-400 text-sm">
            Choose the package manager or binary download matching your operating system.
          </p>
        </div>

        {/* Installation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          {methods.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl bg-[#090a0d] border p-5 flex flex-col justify-between ${
                m.recommended
                  ? 'border-white/25'
                  : 'border-white/10'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">
                    {m.title}
                  </h3>
                  {m.recommended && (
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded font-semibold">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#000000] border border-white/10 font-mono text-xs text-zinc-200">
                  <div className="flex items-center gap-2 overflow-x-auto truncate">
                    <span className="text-zinc-600 select-none">$</span>
                    <span className="truncate">{m.cmd}</span>
                  </div>
                  <button
                    onClick={() => copyText(m.cmd, m.id)}
                    className="ml-2 p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex-shrink-0 border border-white/10"
                    title="Copy command"
                  >
                    {copiedId === m.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Precompiled Binaries Box */}
        <div className="mt-6 max-w-4xl rounded-xl bg-[#090a0d] border border-white/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-zinc-300" />
              Pre-Compiled Standalone Binaries (Zero Node.js)
            </h4>
            <p className="text-xs text-zinc-400">
              Download native executables for Windows x64, macOS Apple Silicon / Intel, and Linux x64 from GitHub.
            </p>
          </div>

          <a
            href="https://github.com/Peerawit-Y/skill-nexus/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 flex-shrink-0"
          >
            <span>GitHub Releases</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>
        </div>
      </div>
    </section>
  );
};
