import React, { useState } from 'react';
import { AlertTriangle, KeyRound, Terminal, Zap } from 'lucide-react';

export const SecurityShowcase: React.FC = () => {
  const [activeCheck, setActiveCheck] = useState<'secrets' | 'commands' | 'tokens'>('secrets');

  const checks = {
    secrets: {
      title: 'Secret & API Key Leak Prevention',
      tag: 'Zero-Leak Policy',
      icon: <KeyRound className="w-4 h-4 text-zinc-300" />,
      status: 'Scanned 0 Leaks',
      codeSample: `// Active regex scanners:
Anthropic API Key: sk-ant-[a-zA-Z0-9_-]{32,}   -> BLOCKED
OpenAI API Key:    sk-[a-zA-Z0-9]{32,}          -> BLOCKED
GitHub PAT:        ghp_[a-zA-Z0-9]{36}          -> BLOCKED
AWS Access Key:    AKIA[0-9A-Z]{16}             -> BLOCKED`,
      explanation: 'Scans all prompt files and markdown bodies before allowing symlink distribution. Forgotten tokens or test credentials are caught instantly.'
    },
    commands: {
      title: 'Dangerous Script Detection',
      tag: 'Command Safety',
      icon: <AlertTriangle className="w-4 h-4 text-zinc-300" />,
      status: 'Protected',
      codeSample: `// High-risk shell patterns flagged:
rm -rf /               -> CRITICAL: Recursive root deletion
chmod 777              -> WARN: Unrestricted permissions
curl ... | bash        -> WARN: Unverified remote shell execution
mkfs /dev/...          -> CRITICAL: Disk partition destruction`,
      explanation: 'Skills with tool-call permissions are audited to ensure dangerous bash commands do not enter your agent workflow.'
    },
    tokens: {
      title: 'Prompt Token Overhead Estimator',
      tag: 'Context Budget',
      icon: <Zap className="w-4 h-4 text-zinc-300" />,
      status: 'Optimal Context',
      codeSample: `api-integration       ~340 tokens    [Optimal]
code-review           ~520 tokens    [Optimal]
react-best-practices  ~890 tokens    [Acceptable]
monolithic-rules      ~2,450 tokens  [WARN: Exceeds prompt budget]`,
      explanation: 'Calculates prompt weight per conversation and warns when a skill exceeds recommended context budgets.'
    }
  };

  const curr = checks[activeCheck];

  return (
    <section className="py-16 md:py-24 bg-[#000000] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Security & Token Quality Auditor
          </h2>
          <p className="text-zinc-400 text-sm">
            Automated verification prevents distribution of tainted prompts or unvetted credentials into your agents.
          </p>
        </div>

        {/* Auditor Card */}
        <div className="max-w-4xl rounded-xl bg-[#090a0d] border border-white/15 overflow-hidden">
          {/* Header Switcher */}
          <div className="px-5 py-3 bg-[#050608] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {(['secrets', 'commands', 'tokens'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveCheck(key)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    activeCheck === key
                      ? 'bg-zinc-800 text-white font-medium border border-white/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="capitalize">{key}</span>
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-zinc-400">
              <span className="text-cyan-400 font-semibold">$</span> sn lint --strict
            </div>
          </div>

          {/* Details & Terminal Output */}
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/10 flex-shrink-0">
                {curr.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-bold text-white">{curr.title}</h3>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-white/10 px-1.5 py-0.5 rounded">
                    {curr.tag}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                  {curr.explanation}
                </p>
              </div>
            </div>

            {/* Code Output Window */}
            <div className="rounded-lg bg-[#000000] border border-white/10 p-3.5 font-mono text-xs text-zinc-300 overflow-x-auto">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-zinc-500 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Rule Engine Active</span>
                </div>
                <span className="text-emerald-400 font-medium">0 Violations</span>
              </div>
              <pre className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{curr.codeSample}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
