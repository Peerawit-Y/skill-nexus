import React, { useState } from 'react';
import { DOC_TOPICS, DocTopic } from '../data/cliData';
import { BookOpen, Copy, Check, ChevronRight, Terminal, Shield, FolderGit2, Cpu } from 'lucide-react';

export const DocsSection: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<DocTopic>(DOC_TOPICS[0]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getTopicIcon = (category: string) => {
    switch (category) {
      case 'Getting Started': return <Terminal className="w-4 h-4 text-zinc-300" />;
      case 'CLI Reference': return <BookOpen className="w-4 h-4 text-zinc-300" />;
      case 'Guides': return <FolderGit2 className="w-4 h-4 text-zinc-300" />;
      case 'Architecture': return <Cpu className="w-4 h-4 text-zinc-300" />;
      default: return <Shield className="w-4 h-4 text-zinc-300" />;
    }
  };

  return (
    <section id="docs" className="py-16 md:py-24 bg-[#000000] border-b border-white/10 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Documentation & CLI Reference
          </h2>
          <p className="text-zinc-400 text-sm">
            Setup instructions, command specifications, team scoping guides, and Windows configuration.
          </p>
        </div>

        {/* Docs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold px-2 py-1">
              Guides
            </div>
            {DOC_TOPICS.map((topic) => {
              const isSelected = activeTopic.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between border ${
                    isSelected
                      ? 'bg-zinc-800 text-white border-white/20'
                      : 'bg-transparent text-zinc-400 hover:text-white border-transparent hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getTopicIcon(topic.category)}
                    <span>{topic.title}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-zinc-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Content Pane */}
          <div className="lg:col-span-3 rounded-xl bg-[#090a0d] border border-white/15 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  {activeTopic.category}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {activeTopic.title}
                </h3>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="text-zinc-300 text-xs sm:text-sm leading-relaxed space-y-4">
              {activeTopic.content.split('\n\n').map((block, idx) => {
                if (block.startsWith('### ')) {
                  return (
                    <h4 key={idx} className="text-sm font-bold text-white mt-6 mb-2 border-b border-white/10 pb-1">
                      {block.replace('### ', '')}
                    </h4>
                  );
                }

                if (block.startsWith('```')) {
                  const lines = block.split('\n');
                  const code = lines.slice(1, -1).join('\n');
                  const id = `code-${idx}`;
                  return (
                    <div key={idx} className="relative rounded-lg bg-[#000000] border border-white/10 p-4 font-mono text-xs overflow-x-auto my-3">
                      <button
                        onClick={() => copyToClipboard(code, id)}
                        className="absolute top-2.5 right-2.5 p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-white/10"
                        title="Copy code"
                      >
                        {copiedCode === id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <pre className="text-zinc-200">{code}</pre>
                    </div>
                  );
                }

                if (block.startsWith('|')) {
                  const rows = block.split('\n').filter(r => r.trim().startsWith('|'));
                  const headers = rows[0].split('|').map(c => c.trim()).filter(Boolean);
                  const dataRows = rows.slice(2).map(r => r.split('|').map(c => c.trim()).filter(Boolean));

                  return (
                    <div key={idx} className="overflow-x-auto my-3">
                      <table className="w-full text-left text-xs font-mono border-collapse border border-white/10">
                        <thead>
                          <tr className="bg-zinc-900 text-white border-b border-white/10">
                            {headers.map((h, i) => (
                              <th key={i} className="py-2.5 px-3 font-semibold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {dataRows.map((r, i) => (
                            <tr key={i} className="hover:bg-white/[0.02]">
                              {r.map((cell, j) => (
                                <td key={j} className="py-2 px-3 text-zinc-300">
                                  {cell.startsWith('`') && cell.endsWith('`') ? (
                                    <code className="text-white bg-zinc-900 px-1.5 py-0.5 rounded border border-white/10">
                                      {cell.slice(1, -1)}
                                    </code>
                                  ) : (
                                    cell
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                return (
                  <p key={idx} className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    {block}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
