import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, Check, Bot, Code2, Wind, Cpu, RefreshCw, Zap } from 'lucide-react';

interface AgentNode {
  id: string;
  name: string;
  path: string;
  icon: React.ReactNode;
  active: boolean;
}

const INITIAL_AGENTS: AgentNode[] = [
  { id: 'claude', name: 'Claude Code', path: '~/.claude/skills', icon: <Terminal className="w-3.5 h-3.5 text-amber-400" />, active: true },
  { id: 'antigravity', name: 'Antigravity', path: '~/.gemini/skills', icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />, active: true },
  { id: 'cursor', name: 'Cursor', path: '.cursor/rules', icon: <Code2 className="w-3.5 h-3.5 text-indigo-400" />, active: true },
  { id: 'windsurf', name: 'Windsurf', path: '.windsurfrules', icon: <Wind className="w-3.5 h-3.5 text-teal-400" />, active: true },
  { id: 'codex', name: 'Codex', path: '~/.codex/skills', icon: <Cpu className="w-3.5 h-3.5 text-emerald-400" />, active: true },
];

const SKILLS = [
  { id: 'code-review', name: 'code-review', size: '340 tok' },
  { id: 'api-integration', name: 'api-integration', size: '520 tok' },
  { id: 'security-lint', name: 'security-lint', size: '210 tok' },
  { id: 'react-standards', name: 'react-standards', size: '680 tok' },
];

export const HeroVisual: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState(SKILLS[0]);
  const [agents, setAgents] = useState<AgentNode[]>(INITIAL_AGENTS);
  const [syncing, setSyncing] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  const toggleAgent = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
    triggerSync();
  };

  const triggerSync = (skill = selectedSkill) => {
    setSelectedSkill(skill);
    setSyncing(true);
    setPulseCount(c => c + 1);
    setTimeout(() => setSyncing(false), 600);
  };

  const activeCount = agents.filter(a => a.active).length;

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 rounded-xl bg-[#090a0d] border border-white/15 overflow-hidden shadow-2xl">
      {/* Top telemetry bar */}
      <div className="px-4 py-2.5 bg-[#050608] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-semibold tracking-wide">LIVE DISPATCH GRAPH</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 text-[11px]">Click skills or agents to test live linking</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <span>Active Targets: <strong className="text-cyan-400 font-bold">{activeCount}/5</strong></span>
          <span className="text-zinc-600">•</span>
          <span>Latency: <strong className="text-emerald-400 font-bold">0.02s</strong></span>
        </div>
      </div>

      {/* Main interactive visual grid */}
      <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Central Hub & Skill Picker */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Central Hub (~/.skill-nexus)
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Select to dispatch</span>
          </div>

          <div className="space-y-1.5">
            {SKILLS.map((sk) => {
              const isSelected = selectedSkill.id === sk.id;
              return (
                <button
                  key={sk.id}
                  onClick={() => triggerSync(sk)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border font-mono text-xs flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-zinc-800 text-white border-cyan-400/60 shadow-sm'
                      : 'bg-black/60 text-zinc-400 border-white/10 hover:border-white/25 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-zinc-600'}`} />
                    <span className="font-semibold">{sk.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{sk.size}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => triggerSync()}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-cyan-300 flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>Simulate 'sn sync'</span>
          </button>
        </div>

        {/* Center: Dynamic Connector Beam Display */}
        <div className="md:col-span-2 hidden md:flex flex-col items-center justify-center relative py-4">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-cyan-400/50 flex items-center justify-center shadow-lg relative z-10">
            <motion.div
              animate={syncing ? { scale: [1, 1.25, 1], rotate: [0, 180, 360] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Zap className="w-5 h-5 text-cyan-400" />
            </motion.div>
          </div>

          {/* Radiating lines animation */}
          <div className="w-full flex items-center justify-center my-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span>Symlinks</span>
          </div>

          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              />
            ))}
          </div>
        </div>

        {/* Right Column: AI Agent Satellites */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-zinc-400" />
              Connected Agents
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Toggle to unlink</span>
          </div>

          <div className="space-y-1.5">
            {agents.map((ag) => (
              <div
                key={ag.id}
                onClick={() => toggleAgent(ag.id)}
                className={`px-3 py-2 rounded-lg border font-mono text-xs flex items-center justify-between cursor-pointer transition-all ${
                  ag.active
                    ? 'bg-black/80 border-white/15 text-zinc-200 hover:border-white/30'
                    : 'bg-black/30 border-white/5 text-zinc-600 line-through'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-zinc-900 border border-white/10">
                    {ag.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{ag.name}</div>
                    <div className="text-[10px] text-zinc-500 truncate max-w-[160px]">{ag.path}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {ag.active ? (
                    <motion.div
                      key={pulseCount}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-[10px] text-emerald-400 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Linked</span>
                    </motion.div>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-600 border border-white/5">
                      Unlinked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time CLI telemetry log at bottom */}
      <div className="px-4 py-2.5 bg-[#050608] border-t border-white/10 font-mono text-xs text-zinc-400 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="text-zinc-600 select-none">$</span>
          <span className="text-zinc-300 truncate">
            sn sync → Created symlinks for <strong className="text-cyan-300">{selectedSkill.name}</strong> to {activeCount} agents
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 flex-shrink-0 font-medium">NTFS / POSIX OK</span>
      </div>
    </div>
  );
};
