# Skill Nexus Official Website

Modern showcase and documentation website for **Skill Nexus** (Universal AI Skill Hub & Auto-Discovery).

Built with:
- **Vite**
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React Icons**

---

## Features & Highlights

1. **Command Palette (`Cmd + K` / `Ctrl + K`)**:
   - Instant search across all CLI commands, supported AI agents, documentation topics, and templates with quick copy and smooth keyboard navigation.

2. **Interactive Skill Studio & Template Explorer**:
   - Browse built-in templates (`code-review`, `api-integration`, `workflow-automation`, `starter-skill`).
   - Visual **SKILL.md Generator**: Fill in skill identifier, prompt context, allowed tools, and rules to generate compliant markdown with 1-click copy and download.

3. **Multi-IDE Rule Exporter (Side-by-Side Converter)**:
   - Live split-view showing standard `SKILL.md` dynamically compiled into:
     - Cursor MDC rules (`.cursor/rules/*.mdc`)
     - GitHub Copilot instructions (`.github/copilot-instructions.md`)
     - Windsurf cascade rules (`.windsurfrules`)

4. **Comparison Matrix**:
   - Side-by-side benchmark of Skill Nexus vs. Manual Copy-Pasting, Git Submodules, and Isolated Agent Configs.

5. **Security & Token Linter Showcase**:
   - Live interactive audit rules showing Secret Key leak detection, dangerous shell script warnings, and prompt token budget estimation.

6. **Interactive Terminal Simulator**:
   - Run realistic commands (`sn init`, `sn status`, `sn install`, `sn lint`, `sn export`) or type commands into the simulator.

7. **Agent Matrix & Live Distribution Simulator (Playground)**:
   - Toggle skills across Claude Code, Google Antigravity, and Cursor in real-time.

8. **Automated CI/CD**:
   - GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) auto-builds and deploys to GitHub Pages upon push to `main`.

---

## Local Development

```bash
# From workspace root:
npm run web:dev

# Or inside website directory:
cd website
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build

```bash
# From workspace root:
npm run web:build

# Output is generated in website/dist/
```
