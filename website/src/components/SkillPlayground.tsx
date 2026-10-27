import React, { useState } from 'react';
import { Layers, Check, X, Terminal } from 'lucide-react';

interface MockSkill {
  id: string;
  name: string;
  category: string;
  tokens: string;
}

const INITIAL_SKILLS: MockSkill[] = [
  { id: 'api-integration', name: 'api-integration', category: 'Backend', tokens: '~340 tok' },
  { id: 'code-review', name: 'code-review', category: 'Quality', tokens: '~520 tok' },
  { id: 'react-best-practices', name: 'react-best-practices', category: 'Frontend', tokens: '~890 tok' },
  { id: 'security-audit', name: 'security-audit', category: 'DevSecOps', tokens: '~210 tok' },
  { id: 'docker-devops', name: 'docker-devops', category: 'Infra', tokens: '~410 tok' }
];

export const SkillPlayground: React.FC = () => {
  const [activeSkills, setActiveSkills] = useState<{ [agentId: string]: string[] }>({
    claude: ['api-integration', 'code-review', 'react-best-practices', 'security-audit'],
    antigravity: ['api-integration', 'code-review', 'security-audit', 'docker-devops'],
    cursor: ['code-review', 'react-best-practices', 'api-integration']
  });

  const [lastAction, setLastAction] = useState<string>('Initialized: 11 active symlinks across 3 agents');

  const toggleSkill = (agentId: string, skillId: string) => {
    setActiveSkills(prev => {
      const current = prev[agentId] || [];
      const exists = current.includes(skillId);
      const updated = exists ? current.filter(id => id !== skillId) : [...current, skillId];
      
      setLastAction(
        exists
          ? `sn disable ${agentId} ${skillId} (unlinked)`
          : `sn enable ${agentId} ${skillId} (symlinked)`
      );

      return {
        ...prev,
        [agentId]: updated
      };
    });
  };

  const enableAll = (agentId: string) => {
    setActiveSkills(prev => ({
      ...prev,
      [agentId]: INITIAL_SKILLS.map(s => s.id)
    }));
    setLastAction(`sn reset ${agentId} (linked all skills)`);
  };

  const totalLinks = Object.values(activeSkills).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <section id="playground" className="py-16 md:py-24 bg-[#000000] border-b border-white/10 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Symlink Distribution Matrix
          </h2>
          <p className="text-zinc-400 text-sm">
            Live simulation of agent symlink assignments. Toggle skills on or off to inspect the resulting CLI actions.
          </p>
        </div>

        {/* Matrix Card */}
        <div className="rounded-xl bg-[#090a0d] border border-white/15 p-6">
          {/* Top Bar Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <div className="text-xs font-mono text-zinc-300">
                Hub Source: <span className="text-white">~/.skill-nexus/skills/</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="px-2.5 py-1 rounded bg-[#000000] border border-white/10 text-zinc-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Active Symlinks: <strong className="text-white">{totalLinks}</strong></span>
              </div>
            </div>
          </div>

          {/* Interactive Table */}
          <div className="overflow-x-auto my-4">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-3 font-semibold">Skill</th>
                  <th className="py-3 px-3 font-semibold text-center">Claude Code</th>
                  <th className="py-3 px-3 font-semibold text-center">Antigravity</th>
                  <th className="py-3 px-3 font-semibold text-center">Cursor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {INITIAL_SKILLS.map((skill) => {
                  const inClaude = activeSkills.claude?.includes(skill.id);
                  const inAntigravity = activeSkills.antigravity?.includes(skill.id);
                  const inCursor = activeSkills.cursor?.includes(skill.id);

                  return (
                    <tr key={skill.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <span className="text-white font-medium">{skill.name}</span>
                        <span className="text-zinc-500 ml-2">({skill.tokens})</span>
                      </td>

                      {/* Claude */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleSkill('claude', skill.id)}
                          className={`px-2.5 py-1 rounded border text-xs transition-colors inline-flex items-center gap-1.5 ${
                            inClaude
                              ? 'bg-zinc-800 border-white/20 text-white'
                              : 'bg-black border-white/5 text-zinc-600 hover:text-zinc-400'
                          }`}
                        >
                          {inClaude ? <Check className="w-3 h-3 text-cyan-400" /> : <X className="w-3 h-3 text-zinc-600" />}
                          <span>{inClaude ? 'Linked' : 'Off'}</span>
                        </button>
                      </td>

                      {/* Antigravity */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleSkill('antigravity', skill.id)}
                          className={`px-2.5 py-1 rounded border text-xs transition-colors inline-flex items-center gap-1.5 ${
                            inAntigravity
                              ? 'bg-zinc-800 border-white/20 text-white'
                              : 'bg-black border-white/5 text-zinc-600 hover:text-zinc-400'
                          }`}
                        >
                          {inAntigravity ? <Check className="w-3 h-3 text-cyan-400" /> : <X className="w-3 h-3 text-zinc-600" />}
                          <span>{inAntigravity ? 'Linked' : 'Off'}</span>
                        </button>
                      </td>

                      {/* Cursor */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleSkill('cursor', skill.id)}
                          className={`px-2.5 py-1 rounded border text-xs transition-colors inline-flex items-center gap-1.5 ${
                            inCursor
                              ? 'bg-zinc-800 border-white/20 text-white'
                              : 'bg-black border-white/5 text-zinc-600 hover:text-zinc-400'
                          }`}
                        >
                          {inCursor ? <Check className="w-3 h-3 text-cyan-400" /> : <X className="w-3 h-3 text-zinc-600" />}
                          <span>{inCursor ? 'Linked' : 'Off'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">Reset:</span>
              <button
                onClick={() => enableAll('claude')}
                className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] font-mono text-zinc-300"
              >
                Claude
              </button>
              <button
                onClick={() => enableAll('antigravity')}
                className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] font-mono text-zinc-300"
              >
                Antigravity
              </button>
              <button
                onClick={() => enableAll('cursor')}
                className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] font-mono text-zinc-300"
              >
                Cursor
              </button>
            </div>

            <div className="p-2 rounded bg-[#000000] border border-white/10 font-mono text-xs text-zinc-300 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-500 select-none">$</span>
              <span className="text-zinc-200">{lastAction}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
