import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { DispatchShowcase } from './components/DispatchShowcase';
import { TerminalDemo } from './components/TerminalDemo';
import { AgentMatrix } from './components/AgentMatrix';
import { SkillPlayground } from './components/SkillPlayground';
import { ConverterPreview } from './components/ConverterPreview';
import { SkillStudio } from './components/SkillStudio';
import { ComparisonTable } from './components/ComparisonTable';
import { SecurityShowcase } from './components/SecurityShowcase';
import { Features } from './components/Features';
import { DocsSection } from './components/DocsSection';
import { InstallSection } from './components/InstallSection';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';

export const App: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      
      <main>
        <Hero />
        <DispatchShowcase />
        <TerminalDemo />
        <AgentMatrix />
        <SkillPlayground />
        <ConverterPreview />
        <SkillStudio />
        <ComparisonTable />
        <SecurityShowcase />
        <Features />
        <DocsSection />
        <InstallSection />
      </main>

      <Footer />

      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={scrollToSection}
      />
    </div>
  );
};

export default App;
