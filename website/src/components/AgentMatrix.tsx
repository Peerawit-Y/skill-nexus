import React from 'react';
import { SUPPORTED_AGENTS } from '../data/cliData';
import { Bot, Terminal, Sparkles, Code2, Wind, Cpu, FolderGit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const AgentMatrix: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Terminal': return <Terminal className="w-4 h-4 text-zinc-300" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'Code2': return <Code2 className="w-4 h-4 text-zinc-300" />;
      case 'Wind': return <Wind className="w-4 h-4 text-zinc-300" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-zinc-300" />;
      case 'Bot': return <Bot className="w-4 h-4 text-zinc-300" />;
      default: return <Bot className="w-4 h-4 text-zinc-300" />;
    }
  };

  return (
    <section id="agents" className="py-16 md:py-24 bg-[#000000] border-b border-white/10 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Supported Agent Ecosystem
          </h2>
          <p className="text-zinc-400 text-sm">
            Native directory resolution paths and link strategies detected on initialization.
          </p>
        </div>

        {/* Grid of Agents with Staggered Fade */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPORTED_AGENTS.map((agent, idx) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl bg-[#090a0d] border border-white/10 p-5 flex flex-col justify-between hover:border-white/20 transition-colors"
            >
              <div className="space-y-3.5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-zinc-900 border border-white/10">
                      {getIcon(agent.iconName)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {agent.name}
                      </h3>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {agent.badge}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                    {agent.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {agent.description}
                </p>

                {/* Path Configuration */}
                <div className="pt-2 space-y-1.5 border-t border-white/5">
                  <span className="text-[10px] uppercase font-mono text-zinc-500 font-semibold tracking-wider">
                    Target Path
                  </span>
                  <div className="p-2 rounded-md bg-[#000000] border border-white/10 font-mono text-xs text-zinc-300 truncate">
                    {agent.defaultPath}
                  </div>
                </div>
              </div>

              {/* Linking Mechanism */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" />
                  Strategy:
                </span>
                <span className="text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-white/10">
                  {agent.method}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
