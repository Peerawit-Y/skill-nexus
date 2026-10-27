import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { expandPath, contractPath, getPaths } from './config.js';
import type { Agent, DiscoveredAgent } from './types.js';

interface AgentProbe {
  id: string;
  name: string;
  type: string;
  skillsPath: string;
  appDir: string;
  description: string;
}

const KNOWN_AGENTS: AgentProbe[] = [
  {
    id: 'claude-code',
    name: 'claude-code',
    type: 'Claude Code',
    skillsPath: '~/.claude/skills',
    appDir: '~/.claude',
    description: 'Anthropic Claude Code CLI & Desktop Agent',
  },
  {
    id: 'antigravity-config',
    name: 'antigravity',
    type: 'Antigravity / Gemini',
    skillsPath: '~/.gemini/config/skills',
    appDir: '~/.gemini',
    description: 'Google Antigravity & Gemini CLI configuration skills',
  },
  {
    id: 'antigravity-user',
    name: 'antigravity-user',
    type: 'Antigravity App',
    skillsPath: '~/.gemini/antigravity/skills',
    appDir: '~/.gemini/antigravity',
    description: 'Antigravity App user skills',
  },
  {
    id: 'cursor',
    name: 'cursor',
    type: 'Cursor AI',
    skillsPath: '~/.cursor/skills',
    appDir: '~/.cursor',
    description: 'Cursor AI IDE global skills/rules directory',
  },
  {
    id: 'windsurf',
    name: 'windsurf',
    type: 'Windsurf / Codeium',
    skillsPath: '~/.codeium/windsurf/skills',
    appDir: '~/.codeium',
    description: 'Codeium Windsurf IDE Cascade agent skills',
  },
  {
    id: 'codex',
    name: 'codex',
    type: 'OpenAI Codex',
    skillsPath: '~/.codex/skills',
    appDir: '~/.codex',
    description: 'OpenAI Codex CLI agent skills directory',
  },
  {
    id: 'clawdbot',
    name: 'clawdbot',
    type: 'Clawdbot',
    skillsPath: '~/.clawdbot/skills',
    appDir: '~/.clawdbot',
    description: 'Clawdbot Agent main skills directory',
  },
  {
    id: 'cline',
    name: 'cline',
    type: 'Cline',
    skillsPath: '~/.cline/skills',
    appDir: '~/.cline',
    description: 'Cline Autonomous Coding Agent',
  },
  {
    id: 'copilot',
    name: 'copilot',
    type: 'GitHub Copilot',
    skillsPath: '~/.copilot/skills',
    appDir: '~/.copilot',
    description: 'GitHub Copilot CLI skills directory',
  },
];

export async function discoverClawdbotSubagents(): Promise<DiscoveredAgent[]> {
  const configLocations = [
    expandPath('~/.clawdbot/clawdbot.json'),
    expandPath('~/.config/clawdbot/clawdbot.json'),
    expandPath('~/Library/Application Support/clawdbot/clawdbot.json'),
  ];

  for (const configPath of configLocations) {
    if (await fs.pathExists(configPath)) {
      try {
        const raw = await fs.readFile(configPath, 'utf-8');
        const data = JSON.parse(raw);
        const agentsSection = data.agents || {};
        const defaultWorkspace = agentsSection.defaults?.workspace;
        const list = Array.isArray(agentsSection.list) ? agentsSection.list : [];
        const results: DiscoveredAgent[] = [];
        const seen = new Set<string>();

        for (const entry of list) {
          const agentId = entry.id || entry.name;
          if (!agentId) continue;
          let workspace = entry.workspace || defaultWorkspace;
          if (!workspace) continue;

          workspace = expandPath(workspace);
          if (!path.isAbsolute(workspace)) {
            workspace = path.resolve(path.dirname(configPath), workspace);
          }

          const name = `clawdbot-${agentId}`;
          if (seen.has(name)) continue;
          seen.add(name);

          const targetSkillsPath = path.join(workspace, 'skills');
          results.push({
            id: name,
            name,
            type: 'Clawdbot Subagent',
            path: contractPath(targetSkillsPath),
            exists: await fs.pathExists(targetSkillsPath),
            description: `Workspace: ${contractPath(workspace)}`,
          });
        }
        return results;
      } catch {
        // Ignore json parse errors
      }
    }
  }
  return [];
}

export async function discoverAllAgents(): Promise<DiscoveredAgent[]> {
  const discovered: DiscoveredAgent[] = [];

  for (const probe of KNOWN_AGENTS) {
    const fullSkillsPath = expandPath(probe.skillsPath);
    const fullAppDir = expandPath(probe.appDir);

    const skillsExist = await fs.pathExists(fullSkillsPath);
    const appDirExists = await fs.pathExists(fullAppDir);

    // If either the skills folder or the agent application exists, we surface it
    if (skillsExist || appDirExists) {
      discovered.push({
        id: probe.id,
        name: probe.name,
        type: probe.type,
        path: probe.skillsPath,
        exists: skillsExist,
        description: probe.description,
      });
    }
  }

  // Also discover Clawdbot subagents if configured
  const subagents = await discoverClawdbotSubagents();
  discovered.push(...subagents);

  return discovered;
}

export async function autoRegisterDiscoveredAgents(
  existingAgents: Agent[],
  defaultSkills: 'all' | string[] = 'all'
): Promise<{ added: Agent[]; updated: Agent[]; total: Agent[] }> {
  const discovered = await discoverAllAgents();
  const agentMap = new Map<string, Agent>();

  for (const ag of existingAgents) {
    agentMap.set(ag.name, ag);
  }

  const added: Agent[] = [];
  const updated: Agent[] = [];

  for (const disc of discovered) {
    if (!agentMap.has(disc.name)) {
      const newAgent: Agent = {
        name: disc.name,
        path: disc.path,
        skills: defaultSkills,
      };
      agentMap.set(disc.name, newAgent);
      added.push(newAgent);
    } else {
      // If path changed or was missing
      const existing = agentMap.get(disc.name)!;
      if (existing.path !== disc.path && disc.exists) {
        existing.path = disc.path;
        updated.push(existing);
      }
    }
  }

  return {
    added,
    updated,
    total: Array.from(agentMap.values()),
  };
}
