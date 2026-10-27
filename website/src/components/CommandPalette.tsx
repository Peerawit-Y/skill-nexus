import React, { useState, useEffect } from 'react';
import { Search, Terminal, BookOpen, Bot, Copy, Check, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORTED_AGENTS, TERMINAL_COMMANDS, DOC_TOPICS } from '../data/cliData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  const filteredCommands = TERMINAL_COMMANDS.filter(c => 
    c.command.toLowerCase().includes(query.toLowerCase()) || 
    c.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAgents = SUPPORTED_AGENTS.filter(a => 
    a.name.toLowerCase().includes(query.toLowerCase()) || 
    a.defaultPath.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDocs = DOC_TOPICS.filter(d => 
    d.title.toLowerCase().includes(query.toLowerCase()) || 
    d.content.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#090a0d] border border-white/20 rounded-xl shadow-2xl overflow-hidden font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-white/10 bg-[#000000]">
              <Search className="w-4 h-4 text-zinc-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, agents, or documentation topics... (ESC to close)"
                className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-mono"
              />
              <button 
                onClick={onClose}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results Container */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
              {/* CLI Commands */}
              {filteredCommands.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CLI Commands</span>
                  </div>
                  <div className="space-y-1">
                    {filteredCommands.map((cmd) => (
                      <div
                        key={cmd.id}
                        className="p-2 rounded-lg bg-[#000000] hover:bg-zinc-900 border border-white/10 flex items-center justify-between group transition-colors"
                      >
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            onNavigate('terminal');
                            onClose();
                          }}
                        >
                          <div className="font-mono text-xs text-white font-medium">
                            {cmd.command}
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            {cmd.description}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(cmd.command)}
                          className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors ml-2 border border-white/10"
                          title="Copy command"
                        >
                          {copiedCmd === cmd.command ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supported Agents */}
              {filteredAgents.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Agents</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredAgents.map((agent) => (
                      <div
                        key={agent.id}
                        onClick={() => {
                          onNavigate('agents');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg bg-[#000000] hover:bg-zinc-900 border border-white/10 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{agent.name}</div>
                          <div className="text-[10px] font-mono text-zinc-500 truncate max-w-[180px]">
                            {agent.defaultPath}
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-300 font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10">
                          {agent.method}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Docs Topics */}
              {filteredDocs.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Documentation Guides</span>
                  </div>
                  <div className="space-y-1">
                    {filteredDocs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          onNavigate('docs');
                          onClose();
                        }}
                        className="p-2 rounded-lg bg-[#000000] hover:bg-zinc-900 border border-white/10 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-medium text-white">{doc.title}</div>
                          <div className="text-[10px] text-zinc-500">{doc.category}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredCommands.length === 0 && filteredAgents.length === 0 && filteredDocs.length === 0 && (
                <div className="py-8 text-center text-zinc-500 text-xs font-mono">
                  No matching commands or topics found for "{query}".
                </div>
              )}
            </div>

            {/* Footer shortcuts */}
            <div className="px-4 py-2 bg-[#000000] border-t border-white/10 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>Navigation: <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">↓</kbd></span>
                <span>Close: <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">ESC</kbd></span>
              </div>
              <span className="text-zinc-400">Skill Nexus</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
