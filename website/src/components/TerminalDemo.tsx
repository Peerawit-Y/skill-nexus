import React, { useState } from 'react';
import { TERMINAL_COMMANDS, TerminalDemoCommand } from '../data/cliData';
import { Terminal, Copy, Check, Play, RefreshCw } from 'lucide-react';

export const TerminalDemo: React.FC = () => {
  const [selectedCommand, setSelectedCommand] = useState<TerminalDemoCommand>(TERMINAL_COMMANDS[0]);
  const [copied, setCopied] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [history, setHistory] = useState<{ cmd: string; output: string }[]>([
    { cmd: TERMINAL_COMMANDS[0].command, output: TERMINAL_COMMANDS[0].output }
  ]);

  const selectPreset = (item: TerminalDemoCommand) => {
    setSelectedCommand(item);
    setHistory(prev => [...prev.slice(-3), { cmd: item.command, output: item.output }]);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCmd = customInput.trim();
    if (!cleanCmd) return;

    const match = TERMINAL_COMMANDS.find(c => c.command.toLowerCase().includes(cleanCmd.toLowerCase()) || cleanCmd.toLowerCase().includes(c.id));
    let out = '';

    if (match) {
      out = match.output;
    } else if (cleanCmd === 'help' || cleanCmd === '--help' || cleanCmd === '-h') {
      out = `Skill Nexus CLI v1.1.0
Usage: sn [command] [options]

Commands:
  init          Initialize ~/.skill-nexus/ and detect agents
  status        Show current skills & agent link table
  list          List all installed central and project skills
  new <name>    Create a new skill from template
  install <url> Install remote skill from GitHub
  lint [skill]  Audit skills for leaked secrets & tokens
  sync [agent]  Rebuild filesystem symlinks
  export        Export skills to Cursor/Copilot/Windsurf rules

Run 'sn <command> --help' for details.`;
    } else if (cleanCmd === 'clear') {
      setHistory([]);
      setCustomInput('');
      return;
    } else {
      out = `⚡ Executed: ${cleanCmd}
[simulated output] Completed successfully in 42ms.`;
    }

    setHistory(prev => [...prev.slice(-3), { cmd: cleanCmd, output: out }]);
    setCustomInput('');
  };

  const copyCurrentOutput = () => {
    const textToCopy = history.map(h => `$ ${h.cmd}\n${h.output}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearTerminal = () => {
    setHistory([{ cmd: selectedCommand.command, output: selectedCommand.output }]);
  };

  return (
    <section id="terminal" className="py-16 md:py-24 bg-[#000000] border-b border-white/10 scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Command-Line Dashboard
          </h2>
          <p className="text-zinc-400 text-sm">
            Interactive command simulator. Select a preset workflow or run commands directly.
          </p>
        </div>

        {/* Command Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {TERMINAL_COMMANDS.map((item) => (
            <button
              key={item.id}
              onClick={() => selectPreset(item)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 ${
                selectedCommand.id === item.id
                  ? 'bg-zinc-800 text-white border border-white/20'
                  : 'bg-[#090a0d] text-zinc-400 border border-white/10 hover:text-zinc-200 hover:border-white/20'
              }`}
            >
              <Play className="w-3 h-3 text-cyan-400" />
              <span>{item.command}</span>
            </button>
          ))}
        </div>

        {/* Terminal Window */}
        <div className="rounded-xl bg-[#090a0d] border border-white/15 overflow-hidden font-mono">
          {/* Header Bar */}
          <div className="px-4 py-2.5 bg-[#050608] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
              <span className="text-xs text-zinc-400 ml-2 font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                skill-nexus-cli
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={clearTerminal}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Reset Terminal"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={copyCurrentOutput}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Copy Terminal Output"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-4 sm:p-6 text-xs sm:text-[13px] text-zinc-200 min-h-[300px] max-h-[460px] overflow-y-auto space-y-5">
            {history.map((entry, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-semibold select-none">$</span>
                  <span className="text-white font-semibold">{entry.cmd}</span>
                </div>
                {/* Clean pre without side-stripe ban */}
                <pre className="text-zinc-300 leading-relaxed whitespace-pre-wrap pl-3 bg-[#000000]/60 p-3 rounded-lg border border-white/5 font-mono">
                  {entry.output}
                </pre>
              </div>
            ))}
          </div>

          {/* Input Prompt */}
          <form onSubmit={handleCustomSubmit} className="p-2.5 bg-[#050608] border-t border-white/10 flex items-center gap-2">
            <span className="text-cyan-400 font-bold pl-2 select-none">$</span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type 'help', 'status', 'lint', 'init', or 'clear'..."
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-zinc-100 focus:outline-none placeholder:text-zinc-600 font-mono"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded transition-colors font-mono"
            >
              Run
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
