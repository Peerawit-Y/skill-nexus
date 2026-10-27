import React from 'react';
import { Check, X } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const rows = [
    {
      feature: 'Single Source of Truth',
      skillNexus: true,
      manual: false,
      submodules: 'Partial',
      isolated: false,
      description: 'Single ~/.skill-nexus/ hub prevents edits from going out of sync.'
    },
    {
      feature: 'Real-Time Symlink Distribution',
      skillNexus: true,
      manual: false,
      submodules: false,
      isolated: false,
      description: 'Edits in hub update all connected agents immediately.'
    },
    {
      feature: 'Native Windows (No Admin / WSL)',
      skillNexus: true,
      manual: false,
      submodules: false,
      isolated: true,
      description: 'Unprivileged NTFS Junctions without requiring elevated prompt.'
    },
    {
      feature: 'Security & Secret Linter',
      skillNexus: true,
      manual: false,
      submodules: false,
      isolated: false,
      description: 'Audits prompt files for leaked API keys and unsafe shell scripts.'
    },
    {
      feature: 'Team & Project Scoping (.skills/)',
      skillNexus: true,
      manual: false,
      submodules: 'Partial',
      isolated: false,
      description: 'Version-control domain rules directly inside repository codebases.'
    },
    {
      feature: 'Auto-Discovery of Installed Agents',
      skillNexus: true,
      manual: false,
      submodules: false,
      isolated: false,
      description: 'Detects Claude, Antigravity, Cursor, Windsurf automatically.'
    },
    {
      feature: 'Multi-IDE Rule Exporter (.mdc)',
      skillNexus: true,
      manual: false,
      submodules: false,
      isolated: false,
      description: 'Compiles standard SKILL.md into Cursor MDC, Copilot, and Windsurf format.'
    },
    {
      feature: 'Interactive TUI Dashboard',
      skillNexus: true,
      manual: false,
      submodules: false,
      isolated: false,
      description: 'Keyboard-driven terminal interface to toggle and monitor links.'
    }
  ];

  const renderBadge = (val: boolean | string) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-zinc-800 text-white border border-white/10">
          <Check className="w-3.5 h-3.5" />
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-black text-zinc-700 border border-white/5">
          <X className="w-3 h-3" />
        </span>
      );
    }
    return (
      <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/10">
        {val}
      </span>
    );
  };

  return (
    <section id="compare" className="py-16 md:py-24 bg-[#000000] border-b border-white/10 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Architecture Comparison
          </h2>
          <p className="text-zinc-400 text-sm">
            How Skill Nexus compares against traditional copy-pasting, submodules, and isolated agent configs.
          </p>
        </div>

        {/* Table Card */}
        <div className="rounded-xl bg-[#090a0d] border border-white/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#050608] font-mono">
                  <th className="py-3 px-4 text-zinc-400 font-semibold uppercase">Capability</th>
                  <th className="py-3 px-4 text-white font-bold uppercase text-center bg-zinc-900 border-x border-white/10">
                    Skill Nexus
                  </th>
                  <th className="py-3 px-4 text-zinc-500 font-semibold uppercase text-center">Manual Copying</th>
                  <th className="py-3 px-4 text-zinc-500 font-semibold uppercase text-center">Git Submodules</th>
                  <th className="py-3 px-4 text-zinc-500 font-semibold uppercase text-center">Isolated Configs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{r.feature}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{r.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center bg-zinc-900/40 border-x border-white/10">
                      {renderBadge(r.skillNexus)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderBadge(r.manual)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderBadge(r.submodules)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderBadge(r.isolated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
