import React from 'react';
import { 
  FolderSync, 
  ShieldAlert, 
  Share2, 
  Cpu, 
  Terminal, 
  FileCode2, 
  GitBranch, 
  Sliders 
} from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-[#000000] border-b border-white/10 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            System Architecture & Tooling
          </h2>
          <p className="text-zinc-400 text-sm">
            Designed for local machine performance, team repositories, and cross-agent synchronization.
          </p>
        </div>

        {/* Asymmetrical Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Feature 1 - Large card */}
          <div className="md:col-span-2 rounded-xl bg-[#090a0d] border border-white/15 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                <FolderSync className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                Zero-Duplication Central Hub
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                Store your AI instructions and prompts once inside <code className="text-zinc-300">~/.skill-nexus/skills/</code>. Filesystem symlinks transparently project them into Claude Code, Antigravity, and Cursor. When you update a skill file, every agent immediately sees the change without git pulls or copy-pasting.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 font-mono text-xs text-zinc-500 flex items-center justify-between">
              <span>Non-destructive unlinking</span>
              <span className="text-zinc-300">sn sync</span>
            </div>
          </div>

          {/* Feature 2 - Windows Native */}
          <div className="rounded-xl bg-[#090a0d] border border-white/10 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-zinc-300" />
              </div>
              <h3 className="text-base font-bold text-white">
                Native Windows Junctions
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Uses NTFS Directory Junctions (<code className="text-zinc-300">mklink /J</code>) on Windows. Requires zero Administrator prompt elevation and works seamlessly outside WSL.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              Cross-platform POSIX & Win32
            </div>
          </div>

          {/* Feature 3 - Project Scoping */}
          <div className="rounded-xl bg-[#090a0d] border border-white/10 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-zinc-300" />
              </div>
              <h3 className="text-base font-bold text-white">
                Team Project Scoping
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Commit repository-specific conventions inside <code className="text-zinc-300">.skills/</code>. Teammates run <code className="text-zinc-300">sn project sync</code> to populate their local editors.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              .skill-nexus.json config
            </div>
          </div>

          {/* Feature 4 - Security Linter */}
          <div className="rounded-xl bg-[#090a0d] border border-white/10 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-zinc-300" />
              </div>
              <h3 className="text-base font-bold text-white">
                Secret & Script Audit
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Audits all prompt markdown for hardcoded OpenAI/Anthropic API keys, unmasked tokens, dangerous shell deletions, and prompt token bloat.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              sn lint
            </div>
          </div>

          {/* Feature 5 - Rule Exporter */}
          <div className="rounded-xl bg-[#090a0d] border border-white/10 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                <FileCode2 className="w-4 h-4 text-zinc-300" />
              </div>
              <h3 className="text-base font-bold text-white">
                MDC & Cascade Exporter
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Compiles standard SKILL.md into Cursor <code className="text-zinc-300">.cursor/rules/*.mdc</code>, Copilot instructions, and Windsurf cascade files.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              sn export --format
            </div>
          </div>

          {/* Feature 6 - Remote Git */}
          <div className="rounded-xl bg-[#090a0d] border border-white/10 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                <Share2 className="w-4 h-4 text-zinc-300" />
              </div>
              <h3 className="text-base font-bold text-white">
                Remote Git Ingestion
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Clone and install remote skills directly from GitHub repositories or subpaths via <code className="text-zinc-300">sn install user/repo</code>.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              sn update
            </div>
          </div>

          {/* Feature 7 - Presets */}
          <div className="rounded-xl bg-[#090a0d] border border-white/10 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                <Sliders className="w-4 h-4 text-zinc-300" />
              </div>
              <h3 className="text-base font-bold text-white">
                Workflow Presets
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Save and apply bundles of skills (e.g. web-stack, security-audit) to any agent with a single command.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              sn preset apply
            </div>
          </div>

          {/* Feature 8 - Interactive TUI */}
          <div className="rounded-xl bg-[#090a0d] border border-white/10 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-zinc-300" />
              </div>
              <h3 className="text-base font-bold text-white">
                Interactive TUI
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Type <code className="text-zinc-300">sn</code> to launch a terminal user interface with keyboard navigation and instant status inspection.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              Zero arguments required
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
