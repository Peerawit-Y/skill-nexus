# Skill Nexus

Centralized skill management and auto-discovery for distributing skills across AI agents (Claude Code, Antigravity, Cursor, Windsurf, Codex, Clawdbot).

Cross-platform support for **macOS**, **Linux**, and native **Windows** (via NTFS junctions without requiring WSL or admin elevation).

## Installation

### Standalone Binary (Zero Dependencies - No Node.js Required)

**macOS & Linux (One-line install):**
```bash
curl -fsSL https://raw.githubusercontent.com/Peerawit-Y/skill-nexus/main/install.sh | bash
```

**Windows & Direct Downloads:**
Download pre-compiled native binaries from [GitHub Releases](https://github.com/Peerawit-Y/skill-nexus/releases):
- **Windows (x64):** `skill-nexus-windows-x64.exe`
- **macOS (Apple Silicon M1/M2/M3/M4):** `skill-nexus-macos-arm64`
- **macOS (Intel):** `skill-nexus-macos-x64`
- **Linux (x64):** `skill-nexus-linux-x64`

### NPM (Cross-Platform: Windows, macOS, Linux)

```bash
# Run directly without install:
npx skill-nexus

# Or install globally:
npm install -g skill-nexus
```

### Homebrew (macOS)

```bash
brew tap Peerawit-Y/tap
brew install skill-nexus
```

### Manual Install (Development)

```bash
# Clone the repo
git clone https://github.com/Peerawit-Y/skill-nexus.git
cd skill-nexus

# Install dependencies and build
npm install
npm run build
npm link
```

### First-Time Setup

```bash
skill-nexus init                # Creates ~/.skill-nexus/
skill-nexus new my-first-skill  # Create your first skill
skill-nexus sync                # Sync skills to agents
```

## Quick Start

```bash
skill-nexus                     # Launch interactive menu (requires gum)
skill-nexus status              # Detailed status
```

The interactive menu lets you:
- Configure which skills each agent gets
- Manage skills (view info, migrate to project repos)
- Create and apply skill presets

## Commands

### Setup & Creation

```bash
skill-nexus init                      # Initialize ~/.skill-nexus/ data directory & auto-detect agents
skill-nexus new <name>                # Create a new skill from template
skill-nexus install <source> [name]   # Install remote skill (GitHub repo or subfolder)
skill-nexus update [skill]            # Update installed remote skills via git pull
skill-nexus path                      # Print data directory path
```

### Project-Level Skills (Workspace / Team Scoping)

Manage skills scoped to a specific repository or team workspace (`.skills/`):

```bash
skill-nexus project init              # Initialize .skills/ and .skill-nexus.json in repo
skill-nexus project new <name>        # Create a new skill in project's .skills/ folder
skill-nexus project list              # List all skills defined in current project
skill-nexus project sync              # Sync project skills to Cursor (.cursor/rules), Copilot, Windsurf
skill-nexus project sync --global     # Also link project skills into your global hub
```

### View & Edit

```bash
skill-nexus                     # Interactive menu - default when no command (or run 'sn')
skill-nexus i                   # Same as above
skill-nexus status              # Show skills and agent distribution
skill-nexus list                # List all skills (shows central vs project-linked)
skill-nexus info <skill>        # Show detailed info about a skill
skill-nexus lint [skill]        # Audit skills for API key leaks, dangerous commands, syntax & token size
```

### Skill Distribution & Export

```bash
skill-nexus set <agent> <skills>      # Set skills ("all" or comma-separated)
skill-nexus enable <agent> <skill>    # Add a skill to an agent
skill-nexus disable <agent> <skill>   # Remove a skill from an agent
skill-nexus copy <from> <to>          # Copy skills from one agent to another
skill-nexus reset <agent>             # Reset agent to all skills
skill-nexus sync [agent]              # Apply config to filesystem (create/update symlinks)
skill-nexus export --format <format>  # Compile skills to IDE rules (cursor, copilot, windsurf)
skill-nexus uninstall [agent]         # Detach agents from hub (copy skills locally)
```

### Presets

```bash
skill-nexus preset create <name> <skills>   # Create a preset skill bundle
skill-nexus preset list                     # List all presets
skill-nexus preset show <name>              # Show skills in a preset
skill-nexus preset apply <agent> <preset>   # Apply preset to an agent
skill-nexus preset delete <name>            # Delete a preset
```

### Agent Management

```bash
skill-nexus add-agent <name> <path> [skills]     # Add agent target
skill-nexus discover                             # Discover agents from clawdbot.json
skill-nexus link-project <skill> <project-path>  # Link skill to project repo
skill-nexus migrate <skill> [path]               # Move skill to its own project repo
skill-nexus deps [install]                       # Check/install dependencies
skill-nexus config [key] [value]                 # Get/set configuration
```

### Remote Skills (Install & Update from GitHub)

You can install skills directly from any public GitHub repository or subfolder in a monorepo:

```bash
# 1. Install a standalone skill repo
skill-nexus install owner/my-skill

# 2. Install a specific skill from a monorepo subfolder
skill-nexus install owner/skills-repo/tree/main/skills/pdf-cleaner

# 3. Rename skill during install and automatically sync to agents
skill-nexus install https://github.com/owner/repo.git custom-name --sync

# 4. Check and pull updates for all installed remote skills
skill-nexus update

# 5. Update a specific skill
skill-nexus update my-skill
```

### Adopting Agent-Created Skills

When agents create skills locally in their workspace, you can import them into skill-nexus:

```bash
skill-nexus local <agent>              # List local (non-symlinked) skills
skill-nexus adopt <agent> <skill>      # Import skill into skill-nexus
```

## Configuration

Edit `~/.skill-nexus/agents.conf`:

```bash
# Format: name:path:skills
# skills: "all" or comma-separated list

claude-code:~/.claude/skills:all
codex:~/.codex/skills:bird,ynab,spreadsheet
clawdbot:~/.clawdbot/skills:all
```

- `all` = symlink entire directory (agent gets everything)
- `skill1,skill2` = individual symlinks (agent only gets listed skills)
- `skills/.system` holds Codex system skills; it is included when `skills: all` is used (directory symlink) but is hidden from explicit skill lists

## Creating Skills

Skills are stored in `~/.skill-nexus/skills/`. Each skill needs a `SKILL.md` file with YAML frontmatter:

```bash
skill-nexus new my-skill   # Creates ~/.skill-nexus/skills/my-skill/SKILL.md
```

### SKILL.md Format

```yaml
---
name: my-skill
description: Brief description
allowed-tools: Bash, Read, Write, Edit
---

# My Skill

Instructions for the AI agent...
```

### Remote Skills (Install & Update from GitHub)

You can install skills directly from any public GitHub repository or subfolder in a monorepo:

```bash
# 1. Install a standalone skill repo
skill-nexus install owner/my-skill

# 2. Install a specific skill from a monorepo subfolder
skill-nexus install owner/skills-repo/tree/main/skills/pdf-cleaner

# 3. Rename skill during install and automatically sync to agents
skill-nexus install https://github.com/owner/repo.git custom-name --sync

# 4. Check and pull updates for all installed remote skills
skill-nexus update

# 5. Update a specific skill
skill-nexus update my-skill
```

### Adopting Agent-Created Skills

When an AI agent creates a skill in its local workspace (not through skill-nexus), you can adopt it into the central hub:

```bash
# 1. See what local skills exist in an agent's workspace
skill-nexus local clawdbot-main
#   meeting-researcher    [has SKILL.md]
#   my-new-skill          [has SKILL.md]

# 2. Adopt a skill into skill-nexus
skill-nexus adopt clawdbot-main meeting-researcher
# Copies to: ~/.skill-nexus/skills/meeting-researcher/
# Replaces local with symlink

# 3. Enable for other agents
skill-nexus enable claude-code meeting-researcher
skill-nexus enable clawdbot meeting-researcher
```

The `sync` command will warn you if it detects local skills that aren't managed by skill-nexus, giving you a chance to adopt them first.

### Project-Linked Skills

Skills can live in two places:
- **Central** (`~/.skill-nexus/skills/`) - Simple, all skills together
- **Project-linked** (your own repo) - Skill versions with its project

#### Migrating a Skill to Its Own Repo

When a skill grows complex enough to warrant its own repo:

```bash
# Configure your project directory (during init, or manually)
skill-nexus config project_dir ~/p
skill-nexus config git_init true

# Migrate a skill to its own repo
skill-nexus migrate my-skill
# Creates: ~/p/my-skill/SKILL.md
# Symlink: ~/.skill-nexus/skills/my-skill -> ~/p/my-skill

# Then push to GitHub if desired
cd ~/p/my-skill
gh repo create my-skill --private --source=. --push
```

#### Linking an Existing Repo

If you already have a skill in a project repo:

```bash
skill-nexus link-project ynab-review ~/p/ynab-review
```

### Skill Security & Quality Linter

Scan all installed skills (or a specific skill) for security leaks, dangerous shell commands, frontmatter syntax errors, and prompt context size:

```bash
# Run security audit across all skills
skill-nexus lint

# Lint a specific skill
skill-nexus lint my-skill

# Strict mode for CI/CD (fails on warnings as well as errors)
skill-nexus lint --strict
```

Checks performed:
- 🛑 **Secrets & API Keys**: Scans for leaked OpenAI, Anthropic, Google Cloud, AWS, GitHub, and private keys.
- 🛑 **Dangerous Commands**: Catches `rm -rf /`, `curl | bash`, fork bombs, disk formatting, and system file overwrites.
- ⚠️ **Schema & Quality**: Validates YAML frontmatter, `name` matching, description existence, and markdown structure.
- ℹ️ **Token Estimation**: Estimates token footprint (~4 chars/token) and warns if prompts exceed 1,500 or 3,500 tokens.

### Exporting Skills to IDE Native Formats

Skills in Skill Nexus can be compiled and exported into the native rule formats of different AI IDEs:

```bash
# 1. Export as Cursor Rules (.cursor/rules/*.mdc)
skill-nexus export --format cursor
skill-nexus export my-skill --format cursor --globs "src/**/*.ts"

# 2. Export as GitHub Copilot Instructions (.github/copilot-instructions.md)
skill-nexus export --format copilot

# 3. Export as Windsurf Cascade Rules (.windsurfrules)
skill-nexus export --format windsurf
```

### Skill Dependencies

Add a `metadata:` line in SKILL.md to declare dependencies:

```
metadata: {"clawdbot":{"requires":{"bins":["yt-dlp","ffmpeg"],"env":["API_KEY"]}}}
```

## Architecture

```
~/.skill-nexus/                        # User data directory
├── skills/                          # Your skills
│   ├── .system/                     # Codex system skills
│   ├── my-skill/                    # Central skill (directory)
│   │   └── SKILL.md
│   └── ynab-review -> ~/p/ynab-review  # Project-linked skill (symlink)
├── agents.conf                      # Agent configuration
├── presets.conf                     # Saved presets
└── settings.conf                    # User settings (project_dir, git_init)

~/p/ynab-review/                     # Project repo for a skill
├── SKILL.md                         # Skill definition at repo root
└── ...                              # Other project files

~/.claude/skills/my-skill -> ~/.skill-nexus/skills/my-skill   # Agent symlinks
~/.codex/skills/my-skill -> ~/.skill-nexus/skills/my-skill
```

## Detaching (Uninstall)

To return to per-agent, local skill folders:

```bash
skill-nexus uninstall          # All agents
skill-nexus uninstall codex    # Single agent
```

This replaces directory or per-skill symlinks with local copies in each agent's skills directory. Project-linked skills remain symlinks to their repos.
Running `skill-nexus sync` later will re-apply whatever `agents.conf` specifies.
Note: `uninstall` has not been tested yet.

## Version Control Your Skills

Your skills live in `~/.skill-nexus/` and can be version controlled independently:

```bash
cd ~/.skill-nexus
git init
git add -A && git commit -m "My skills"
gh repo create my-skills --private --source=.
```

## Environment Variables

- `SKILL_NEXUS_DATA` - Override the data directory (default: `~/.skill-nexus`)

## License

MIT
