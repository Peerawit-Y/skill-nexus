import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Sliders, Terminal, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TemplateItem {
  id: string;
  name: string;
  title: string;
  description: string;
  tools: string;
  body: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'code-review',
    name: 'code-review',
    title: 'Code Review & Standards',
    description: 'Code quality, security review, and architecture validation standards.',
    tools: 'Bash, Read, Grep, Glob',
    body: `# Code Review & Quality Standards

Comprehensive guidelines for reviewing pull requests, ensuring security, type safety, and architectural consistency.

## 1. Trigger & Scope
### When to Use
- When reviewing pull requests, diffs, or newly implemented features.
- When auditing code for security vulnerabilities, edge cases, and performance bottlenecks.

### When NOT to Use
- When only writing new prototype code without review requirements.

## 2. Review Checklist
### Security & Privacy
- [ ] No hardcoded credentials, API keys, or private tokens.
- [ ] Inputs are sanitized and validated against injection attacks (SQL, Command, XSS).

### Correctness & Robustness
- [ ] Edge cases handled (null/undefined values, empty arrays, network timeouts).
- [ ] Error handling does not swallow unexpected exceptions silently.

### Clean Architecture
- [ ] Single Responsibility Principle followed for functions and modules.
- [ ] Code is DRY (Don't Repeat Yourself) without excessive premature abstraction.`
  },
  {
    id: 'api-integration',
    name: 'api-integration',
    title: 'API Integration & Resilience',
    description: 'Robust API integration patterns, rate limiting, and structured retry policies.',
    tools: 'Bash, Read, Write, Grep',
    body: `# API Integration Guidelines

Standards for consuming external REST/GraphQL APIs with resilience, caching, and circuit-breaking.

## 1. Principles
- Always use exponential backoff with jitter on 429 and 5xx responses.
- Enforce strict typing with Zod or TypeScript schema validation for all network payloads.
- Never log raw authorization tokens or unmasked personal customer data.

## 2. Error Handling
- Wrap requests in structured error handlers.
- Emit standardized domain errors with status codes and request trace IDs.`
  },
  {
    id: 'workflow-automation',
    name: 'workflow-automation',
    title: 'Workflow Automation & CI/CD',
    description: 'Automated CI/CD workflows, release pipelines, and git sanity checks.',
    tools: 'Bash, Read, Write',
    body: `# Workflow Automation Rules

Guidelines for executing repeatable local and CI/CD pipelines safely.

## 1. Safety Measures
- Dry-run mode must be supported before executing state-altering actions.
- Require confirmation before dropping tables, deleting buckets, or force-pushing.
- Log command execution timestamps and execution durations.`
  },
  {
    id: 'starter',
    name: 'starter-skill',
    title: 'Minimal Starter Skill',
    description: 'Standard starter template for custom agent prompts and guidelines.',
    tools: 'Read, Write, Grep',
    body: `# Starter Skill Instructions

Provide clear, actionable instructions for your AI coding agent here.

## 1. Scope
- State what task or framework this skill is responsible for.

## 2. Guidelines & Best Practices
- Rule 1: Always verify assumptions before modifying existing code.
- Rule 2: Keep functions concise and test-covered.`
  }
];

export const SkillStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'builder'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem>(TEMPLATES[0]);
  
  // Builder State
  const [skillName, setSkillName] = useState('react-query-standards');
  const [description, setDescription] = useState('Production conventions for TanStack Query caching and mutations');
  const [tools, setTools] = useState('Read, Write, Grep');
  const [rules, setRules] = useState(
`- Always define query keys as hierarchical tuple arrays (e.g. ['users', userId]).
- Set staleTime explicitly to prevent redundant network background refetches.
- Use optimistic updates for snappy user interactions on mutation.`);

  const [copied, setCopied] = useState(false);

  // Computed generator content
  const generatedSkillMd = `---
name: ${skillName || 'my-skill'}
description: ${description || 'Agent skill guidelines'}
allowed-tools: ${tools || 'Read, Write'}
version: 1.0.0
---

# ${skillName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}

${description}

## Guidelines & Best Practices

${rules}
`;

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeTemplateFullMd = `---
name: ${selectedTemplate.name}
description: ${selectedTemplate.description}
allowed-tools: ${selectedTemplate.tools}
version: 1.0.0
---

${selectedTemplate.body}`;

  return (
    <section id="studio" className="py-16 md:py-24 bg-[#000000] border-b border-white/10 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Skill Studio & Templates
          </h2>
          <p className="text-zinc-400 text-sm">
            Inspect standard templates included with Skill Nexus, or visually generate a compliant <code className="text-white">SKILL.md</code>.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 border ${
              activeTab === 'templates'
                ? 'bg-zinc-800 text-white border-white/20'
                : 'bg-[#090a0d] text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 border ${
              activeTab === 'builder'
                ? 'bg-zinc-800 text-white border-white/20'
                : 'bg-[#090a0d] text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Skill Generator</span>
          </button>
        </div>

        {/* Tab 1: Templates */}
        <AnimatePresence mode="wait">
          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
              {/* List */}
              <div className="space-y-2">
                {TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      selectedTemplate.id === tmpl.id
                        ? 'bg-zinc-800/90 border-white/25 text-white'
                        : 'bg-[#090a0d] border-white/10 text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-semibold text-white">
                        {tmpl.name}
                      </span>
                      {selectedTemplate.id === tmpl.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1">{tmpl.description}</p>
                  </div>
                ))}

                <div className="p-3 rounded-lg bg-[#090a0d] border border-white/10 text-xs text-zinc-400 font-mono flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>sn new my-skill --from={selectedTemplate.name}</span>
                </div>
              </div>

              {/* Preview */}
              <div className="lg:col-span-2 rounded-xl bg-[#090a0d] border border-white/15 overflow-hidden flex flex-col justify-between font-mono">
                <div className="px-4 py-2.5 bg-[#050608] border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs text-zinc-300 font-mono">SKILL.md / {selectedTemplate.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyContent(activeTemplateFullMd)}
                      className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1.5 border border-white/10"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => downloadFile(activeTemplateFullMd, 'SKILL.md')}
                      className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1.5 border border-white/10"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 text-xs text-zinc-200 max-h-[420px] overflow-y-auto leading-relaxed">
                  <pre className="whitespace-pre-wrap">{activeTemplateFullMd}</pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Generator */}
          {activeTab === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {/* Form */}
              <div className="rounded-xl bg-[#090a0d] border border-white/10 p-5 space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1 font-semibold">
                    Skill Identifier
                  </label>
                  <input
                    type="text"
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="e.g. react-query-standards"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#000000] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1 font-semibold">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="When to apply this skill..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[#000000] border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1 font-semibold">
                    Allowed Tools
                  </label>
                  <input
                    type="text"
                    value={tools}
                    onChange={(e) => setTools(e.target.value)}
                    placeholder="Read, Write, Grep"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#000000] border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1 font-semibold">
                    Rules & Checklist
                  </label>
                  <textarea
                    rows={4}
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    placeholder="Rules..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[#000000] border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="rounded-xl bg-[#090a0d] border border-white/15 overflow-hidden flex flex-col justify-between font-mono">
                <div className="px-4 py-2.5 bg-[#050608] border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white font-semibold">Generated SKILL.md</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyContent(generatedSkillMd)}
                      className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1.5 border border-white/10"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => downloadFile(generatedSkillMd, `${skillName || 'skill'}.md`)}
                      className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1.5 border border-white/10"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 text-xs text-zinc-200 max-h-[340px] overflow-y-auto leading-relaxed">
                  <pre className="whitespace-pre-wrap">{generatedSkillMd}</pre>
                </div>

                <div className="p-2.5 bg-[#050608] border-t border-white/10 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Target: ~/.skill-nexus/skills/{skillName}/SKILL.md</span>
                  <span className="text-emerald-400 font-medium">Valid Schema</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
