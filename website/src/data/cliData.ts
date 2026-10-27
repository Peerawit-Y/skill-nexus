export interface AgentInfo {
  id: string;
  name: string;
  badge: string;
  iconName: string;
  defaultPath: string;
  winPath?: string;
  method: 'Symlink' | 'NTFS Junction' | 'Export (MDC/Rules)';
  status: 'Auto-Detected' | 'Supported';
  description: string;
  highlightColor: string;
}

export const SUPPORTED_AGENTS: AgentInfo[] = [
  {
    id: 'claude',
    name: 'Claude Code',
    badge: 'Official CLI',
    iconName: 'Terminal',
    defaultPath: '~/.claude/skills',
    winPath: '%USERPROFILE%\\.claude\\skills',
    method: 'Symlink',
    status: 'Auto-Detected',
    description: "Anthropic's agentic command-line interface. Instant symlink mapping.",
    highlightColor: 'from-amber-500/20 to-orange-500/20 text-orange-400 border-orange-500/30'
  },
  {
    id: 'antigravity',
    name: 'Google Antigravity',
    badge: 'IDE & Agent',
    iconName: 'Sparkles',
    defaultPath: '~/.gemini/antigravity/skills',
    winPath: '%USERPROFILE%\\.gemini\\antigravity\\skills',
    method: 'Symlink',
    status: 'Auto-Detected',
    description: "Google's next-gen AI coding environment & Gemini agent skills.",
    highlightColor: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'cursor',
    name: 'Cursor',
    badge: 'AI Code Editor',
    iconName: 'Code2',
    defaultPath: '~/.cursor/skills or .cursor/rules',
    winPath: '%USERPROFILE%\\.cursor\\skills',
    method: 'Export (MDC/Rules)',
    status: 'Supported',
    description: 'Symlink global skills or compile them directly into .cursor/rules/*.mdc format.',
    highlightColor: 'from-purple-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    badge: 'Codeium Cascade',
    iconName: 'Wind',
    defaultPath: '~/.windsurf/skills or .windsurfrules',
    winPath: '%USERPROFILE%\\.windsurf\\skills',
    method: 'Export (MDC/Rules)',
    status: 'Supported',
    description: 'Native directory symlinks or auto-compiled into root .windsurfrules.',
    highlightColor: 'from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30'
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    badge: 'CLI Agent',
    iconName: 'Cpu',
    defaultPath: '~/.codex/skills',
    winPath: '%USERPROFILE%\\.codex\\skills',
    method: 'Symlink',
    status: 'Supported',
    description: 'CLI and editor agent integrations using directory linking.',
    highlightColor: 'from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'clawdbot',
    name: 'Clawdbot',
    badge: 'Autonomous',
    iconName: 'Bot',
    defaultPath: '~/.clawdbot/skills',
    winPath: '%USERPROFILE%\\.clawdbot\\skills',
    method: 'Symlink',
    status: 'Supported',
    description: 'Autonomous workspace agent with full central skill resolution.',
    highlightColor: 'from-pink-500/20 to-rose-500/20 text-rose-400 border-rose-500/30'
  }
];

export interface TerminalDemoCommand {
  id: string;
  command: string;
  description: string;
  output: string;
}

export const TERMINAL_COMMANDS: TerminalDemoCommand[] = [
  {
    id: 'init',
    command: 'npx skill-nexus init',
    description: 'Initialize hub directory & auto-discover installed agents',
    output: `⚡ Initializing Skill Nexus v1.1.0...
✔ Created data directory: ~/.skill-nexus/
✔ Created hub skills folder: ~/.skill-nexus/skills/
✔ Auto-detecting installed AI agents...
  Found: Claude Code (~/.claude/skills)
  Found: Google Antigravity (~/.gemini/antigravity/skills)
  Found: Cursor (~/.cursor/skills)
✔ Generated config: ~/.skill-nexus/config.json
✨ Skill Nexus is ready! Run 'sn' to open the interactive dashboard.`
  },
  {
    id: 'status',
    command: 'sn status',
    description: 'Check active skill distribution matrix across all agents',
    output: `┌────────────────────────────────────────────────────────────────────────┐
│                        SKILL NEXUS DISTRIBUTION                       │
├─────────────────┬──────────┬─────────────────┬─────────────────────────┤
│ Agent           │ Status   │ Active Skills   │ Path                    │
├─────────────────┼──────────┼─────────────────┼─────────────────────────┤
│ claude          │ Linked   │ 5/5 enabled     │ ~/.claude/skills        │
│ antigravity     │ Linked   │ 5/5 enabled     │ ~/.gemini/.../skills    │
│ cursor          │ Linked   │ 4/5 enabled     │ ~/.cursor/skills        │
│ windsurf        │ Ready    │ (Unlinked)      │ ~/.windsurf/skills      │
└─────────────────┴──────────┴─────────────────┴─────────────────────────┘
Skills in Hub: [ api-integration, code-review, git-flow, security-lint, docker-ops ]
All symlinks verified and valid (0 broken).`
  },
  {
    id: 'install',
    command: 'sn install anthropics/skills/react-best-practices',
    description: 'Clone and install remote skills directly from GitHub',
    output: `Cloning anthropics/skills into cache...
Resolving path: /react-best-practices
Parsing SKILL.md metadata...
  Name: react-best-practices
  Version: 1.0.0
  Author: Anthropic
Installing to ~/.skill-nexus/skills/react-best-practices...
Auto-syncing to 3 active agents (claude, antigravity, cursor)...
Symlink created: ~/.claude/skills/react-best-practices -> hub
Symlink created: ~/.gemini/antigravity/skills/react-best-practices -> hub
Symlink created: ~/.cursor/skills/react-best-practices -> hub
Skill "react-best-practices" successfully installed and distributed!`
  },
  {
    id: 'lint',
    command: 'sn lint',
    description: 'Audit skills for token usage, exposed API keys & dangerous commands',
    output: `Auditing 6 installed skills in hub...

  api-integration       OK      ~340 tokens   Valid frontmatter
  code-review           OK      ~520 tokens   Valid frontmatter
  react-best-practices  OK      ~890 tokens   Valid frontmatter
  security-lint         OK      ~210 tokens   Valid frontmatter
  custom-deploy         WARN    ~1,420 tokens Large context warning
    Warning: High token count. Consider breaking into sub-skills.
  test-skill            PASS    ~180 tokens   Zero leaked secrets

0 Errors, 1 Warning. All skills safe to distribute.`
  },
  {
    id: 'export',
    command: 'sn export --format cursor',
    description: 'Compile SKILL.md into Cursor .cursor/rules/*.mdc rules',
    output: `Compiling skills to Cursor MDC format...
Export target directory: ./.cursor/rules/
✔ Converted api-integration -> .cursor/rules/api-integration.mdc
✔ Converted code-review -> .cursor/rules/code-review.mdc
✔ Converted react-best-practices -> .cursor/rules/react-best-practices.mdc
Export complete! 3 Cursor MDC rule files generated.`
  }
];

export interface DocTopic {
  id: string;
  title: string;
  category: 'Getting Started' | 'CLI Reference' | 'Architecture' | 'Guides';
  content: string;
}

export const DOC_TOPICS: DocTopic[] = [
  {
    id: 'quickstart',
    title: 'Quickstart & Installation',
    category: 'Getting Started',
    content: `### Instant Zero-Install
You can run Skill Nexus immediately using \`npx\` without permanent installation:
\`\`\`bash
npx skill-nexus init    # Auto-detect agents & setup ~/.skill-nexus/
npx skill-nexus         # Launch interactive TUI menu
\`\`\`

### Global Installation (Recommended)
Install globally to get both \`skill-nexus\` and the short \`sn\` alias:
\`\`\`bash
# Via NPM
npm install -g skill-nexus

# Via Homebrew (macOS)
brew tap Peerawit-Y/tap
brew install skill-nexus

# Via Standalone Binary (Zero Node.js dependency)
curl -fsSL https://raw.githubusercontent.com/Peerawit-Y/skill-nexus/main/install.sh | bash
\`\`\`
`
  },
  {
    id: 'commands',
    title: 'CLI Commands Reference',
    category: 'CLI Reference',
    content: `### Core Commands
| Command | Description |
|---|---|
| \`sn\` | Launch interactive TUI dashboard |
| \`sn init\` | Initialize hub & auto-detect agents |
| \`sn status\` | Display active agent distribution matrix |
| \`sn list\` | List all central & project-linked skills |
| \`sn new <name>\` | Create a skill from standard template |
| \`sn install <repo>\` | Install remote skill from GitHub |
| \`sn update [name]\` | Update remote git-based skills |
| \`sn lint [name]\` | Security & token audit scanner |
| \`sn sync [agent]\` | Apply and rebuild symlinks |
| \`sn export --format <cursor|copilot|windsurf>\` | Convert to IDE rules |

### Agent Management
| Command | Description |
|---|---|
| \`sn enable <agent> <skill>\` | Enable specific skill for an agent |
| \`sn disable <agent> <skill>\` | Disable skill for an agent |
| \`sn set <agent> <skills>\` | Assign specific skills or "all" |
| \`sn copy <from> <to>\` | Copy configuration between agents |
| \`sn reset <agent>\` | Reset agent to all available skills |
| \`sn uninstall [agent]\` | Detach agent and restore standalone copies |
`
  },
  {
    id: 'project-skills',
    title: 'Project-Level Skills (.skills/)',
    category: 'Guides',
    content: `### Scoping Skills to Repositories & Teams
Skill Nexus supports local repository scoping so teams can version control agent skills inside their codebases:

\`\`\`bash
# Inside your project repository:
sn project init
\`\`\`
This creates:
- \`.skills/\` - Directory for project-specific skills
- \`.skill-nexus.json\` - Local configuration committed to Git

### Syncing Project Skills
\`\`\`bash
# Create a team skill
sn project new react-query-standards

# Sync to local editor configurations (.cursor/rules, Copilot, etc.)
sn project sync

# Optionally link project skills into your global ~/.skill-nexus/ hub
sn project sync --global
\`\`\`
`
  },
  {
    id: 'cross-platform',
    title: 'Cross-Platform & Windows NTFS',
    category: 'Architecture',
    content: `### True Cross-Platform Architecture
Unlike tools that fail on Windows or demand administrator elevation, Skill Nexus provides robust cross-platform symlink management:

- **macOS & Linux**: Standard POSIX directory symbolic links (\`ln -s\`).
- **Windows**: Native **NTFS Junctions** (\`mklink /J\`).
  - No Administrator elevation required!
  - Fully compatible with Command Prompt, PowerShell, Git Bash, and WSL.
  - Transparently resolved by all Windows-native AI tools and editors.

### Safe Unlinking & Detach
Skill Nexus uses non-destructive unlinking. Disabling or uninstalling never deletes your original skill files—only the links are cleanly removed.
`
  },
  {
    id: 'security-linter',
    title: 'Security Linter & Token Auditor',
    category: 'Guides',
    content: `### Built-In Safety Scanner
Before distributing skills to AI models, Skill Nexus audits your skills for safety and quality:

1. **Secret Detection**: Scans for accidental API keys (OpenAI \`sk-*\`, Anthropic \`sk-ant-*\`, GitHub PATs, AWS Access Keys).
2. **Dangerous Commands**: Flags high-risk scripts such as \`rm -rf /\`, \`chmod 777\`, or blind curl-piping without hash checks.
3. **Token Estimation**: Calculates prompt token weight to prevent skills from blowing up your agent context window.
4. **Frontmatter Schema Validation**: Enforces valid YAML metadata (\`name\`, \`description\`, \`version\`).

Run anytime:
\`\`\`bash
sn lint
\`\`\`
`
  }
];
