import React, { useState } from 'react';
import { FileCode2, Copy, Check, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ConverterPreview: React.FC = () => {
  const [targetFormat, setTargetFormat] = useState<'cursor' | 'copilot' | 'windsurf'>('cursor');
  const [copied, setCopied] = useState(false);

  const sampleSkillMd = `---
name: code-review
description: Code quality, security review, and architecture validation standards.
allowed-tools: Bash, Read, Grep, Glob
---

# Code Review Standards

Guidelines for reviewing pull requests and auditing code security.

## Review Checklist
- [ ] No hardcoded API keys or secret tokens.
- [ ] Inputs sanitized against injection attacks.
- [ ] Edge cases handled cleanly (null checks, timeouts).`;

  const getTargetOutput = () => {
    switch (targetFormat) {
      case 'cursor':
        return {
          filename: '.cursor/rules/code-review.mdc',
          formatLabel: 'Cursor MDC Rule',
          content: `---
description: Code quality, security review, and architecture validation standards.
globs: "*"
alwaysApply: false
---

# Code Review Standards

Guidelines for reviewing pull requests and auditing code security.

## Review Checklist
- [ ] No hardcoded API keys or secret tokens.
- [ ] Inputs sanitized against injection attacks.
- [ ] Edge cases handled cleanly (null checks, timeouts).`
        };

      case 'copilot':
        return {
          filename: '.github/copilot-instructions.md',
          formatLabel: 'GitHub Copilot Instructions',
          content: `# GitHub Copilot Instructions

These instructions are compiled by Skill Nexus to guide GitHub Copilot across project conventions and skills.

## Skill: code-review
> Code quality, security review, and architecture validation standards.

# Code Review Standards

Guidelines for reviewing pull requests and auditing code security.

## Review Checklist
- [ ] No hardcoded API keys or secret tokens.
- [ ] Inputs sanitized against injection attacks.
- [ ] Edge cases handled cleanly (null checks, timeouts).

---`
        };

      case 'windsurf':
        return {
          filename: '.windsurfrules',
          formatLabel: 'Windsurf Cascade Rules',
          content: `# Windsurf Global Rules & Skills
Compiled by Skill Nexus for Codeium Windsurf Cascade Agent.

<rule name="code-review" description="Code quality, security review, and architecture validation standards.">
# Code Review Standards

Guidelines for reviewing pull requests and auditing code security.

## Review Checklist
- [ ] No hardcoded API keys or secret tokens.
- [ ] Inputs sanitized against injection attacks.
- [ ] Edge cases handled cleanly (null checks, timeouts).
</rule>`
        };
    }
  };

  const target = getTargetOutput();

  const copyOutput = () => {
    navigator.clipboard.writeText(target.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 md:py-24 bg-[#000000] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Multi-IDE Rule Exporter
          </h2>
          <p className="text-zinc-400 text-sm">
            Write once in standard <code className="text-white">SKILL.md</code>. Automatically export into Cursor, Copilot, or Windsurf rulesets.
          </p>
        </div>

        {/* Split View Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch font-mono">
          {/* Source SKILL.md */}
          <div className="rounded-xl bg-[#090a0d] border border-white/10 overflow-hidden flex flex-col justify-between">
            <div className="px-4 py-2.5 bg-[#050608] border-b border-white/10 flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-semibold flex items-center gap-2">
                <FileCode2 className="w-3.5 h-3.5 text-zinc-400" />
                Source: SKILL.md
              </span>
              <span className="text-zinc-500 text-[11px]">~/.skill-nexus/skills/code-review/</span>
            </div>

            <div className="p-4 text-xs text-zinc-300 leading-relaxed overflow-x-auto">
              <pre className="whitespace-pre-wrap">{sampleSkillMd}</pre>
            </div>

            <div className="p-2.5 bg-[#050608] border-t border-white/10 text-[11px] text-zinc-500">
              Universal Frontmatter Specification
            </div>
          </div>

          {/* Compiled Target with Animated Crossfade */}
          <div className="rounded-xl bg-[#090a0d] border border-white/15 overflow-hidden flex flex-col justify-between">
            <div className="px-4 py-2.5 bg-[#050608] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Target Format Switcher */}
              <div className="flex items-center gap-1 p-0.5 rounded bg-zinc-900 border border-white/10">
                {(['cursor', 'copilot', 'windsurf'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setTargetFormat(fmt)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors relative ${
                      targetFormat === fmt
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={copyOutput}
                className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1.5 transition-colors border border-white/10"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>

            <div className="p-4 text-xs text-zinc-200 leading-relaxed overflow-x-auto min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.pre
                  key={targetFormat}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="whitespace-pre-wrap"
                >
                  {target.content}
                </motion.pre>
              </AnimatePresence>
            </div>

            <div className="p-2.5 bg-[#050608] border-t border-white/10 text-xs text-zinc-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-zinc-300 font-mono">sn export --format {targetFormat}</span>
              </div>
              <span className="text-[11px] text-zinc-500">{target.filename}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
