import path from 'node:path';
import fs from 'fs-extra';
import { getPaths, expandPath, contractPath } from './config.js';
import {
  isSymlink,
  getSymlinkTarget,
  createDirectorySymlink,
  safeRemove,
  convertSymlinkToRealDirectory,
} from './symlink.js';
import { listLocalSkills, getAllSkills } from './skill-manager.js';
import type { Agent, SkillAssignment } from './types.js';

export async function loadAgents(): Promise<Agent[]> {
  const { agentsFile } = getPaths();
  if (!(await fs.pathExists(agentsFile))) {
    return [];
  }

  const content = await fs.readFile(agentsFile, 'utf-8');
  const agents: Agent[] = [];

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const parts = trimmed.split(':');
    if (parts.length < 2) continue;

    const name = parts[0].trim();
    const agentPath = parts[1].trim();
    const rawSkills = parts.slice(2).join(':').trim();

    let skills: SkillAssignment = 'all';
    if (rawSkills && rawSkills !== 'all') {
      skills = rawSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    agents.push({
      name,
      path: agentPath,
      skills,
    });
  }

  return agents;
}

export async function saveAgents(agents: Agent[]): Promise<void> {
  const { agentsFile, dataDir } = getPaths();
  await fs.ensureDir(dataDir);

  const lines = agents.map((ag) => {
    const skillsStr = Array.isArray(ag.skills) ? ag.skills.join(',') : ag.skills;
    return `${ag.name}:${contractPath(ag.path)}:${skillsStr}`;
  });

  await fs.writeFile(agentsFile, lines.join('\n') + '\n', 'utf-8');
}

export async function getAgent(name: string): Promise<Agent | undefined> {
  const agents = await loadAgents();
  return agents.find((a) => a.name === name);
}

export async function addAgent(
  name: string,
  targetPath: string,
  skills: SkillAssignment = 'all'
): Promise<void> {
  const agents = await loadAgents();
  const existing = agents.find((a) => a.name === name);
  if (existing) {
    existing.path = targetPath;
    existing.skills = skills;
  } else {
    agents.push({
      name,
      path: targetPath,
      skills,
    });
  }
  await saveAgents(agents);
}

export async function setAgentSkills(name: string, skills: SkillAssignment): Promise<void> {
  const agents = await loadAgents();
  const agent = agents.find((a) => a.name === name);
  if (!agent) throw new Error(`Agent '${name}' not found.`);
  agent.skills = skills;
  await saveAgents(agents);
}

export async function enableSkill(name: string, skill: string): Promise<void> {
  const agents = await loadAgents();
  const agent = agents.find((a) => a.name === name);
  if (!agent) throw new Error(`Agent '${name}' not found.`);

  if (agent.skills === 'all') {
    // Already has all skills
    return;
  }

  if (!agent.skills.includes(skill)) {
    agent.skills.push(skill);
    await saveAgents(agents);
  }
}

export async function disableSkill(name: string, skill: string): Promise<void> {
  const agents = await loadAgents();
  const agent = agents.find((a) => a.name === name);
  if (!agent) throw new Error(`Agent '${name}' not found.`);

  if (agent.skills === 'all') {
    // Convert 'all' to list of all existing skills minus this one
    const all = await getAllSkills();
    agent.skills = all.map((s) => s.name).filter((s) => s !== skill);
  } else {
    agent.skills = agent.skills.filter((s) => s !== skill);
  }
  await saveAgents(agents);
}

export async function copyAgent(fromName: string, toName: string): Promise<void> {
  const agents = await loadAgents();
  const fromAgent = agents.find((a) => a.name === fromName);
  if (!fromAgent) throw new Error(`Source agent '${fromName}' not found.`);

  const toAgent = agents.find((a) => a.name === toName);
  if (!toAgent) throw new Error(`Target agent '${toName}' not found.`);

  toAgent.skills = Array.isArray(fromAgent.skills) ? [...fromAgent.skills] : fromAgent.skills;
  await saveAgents(agents);
}

export async function resetAgent(name: string): Promise<void> {
  await setAgentSkills(name, 'all');
}

export async function moveSkill(skill: string, fromName: string, toName: string): Promise<void> {
  await disableSkill(fromName, skill);
  await enableSkill(toName, skill);
}

export interface SyncResult {
  agent: string;
  success: boolean;
  message: string;
  warnings?: string[];
}

export async function syncAgent(agent: Agent, options: { force?: boolean } = {}): Promise<SyncResult> {
  const { skillsDir } = getPaths();
  const expandedPath = expandPath(agent.path);
  const warnings: string[] = [];

  // 1. Check for unmanaged local skills
  const localSkills = await listLocalSkills(expandedPath);
  if (localSkills.length > 0) {
    warnings.push(
      `Found ${localSkills.length} local skill(s) not managed by skill-nexus: ${localSkills.join(', ')}`
    );
    if (!options.force) {
      // Return with warning if not forced
      return {
        agent: agent.name,
        success: false,
        message: `Local skills exist in ${agent.name}. Use --force to proceed or adopt them with 'skill-nexus adopt'.`,
        warnings,
      };
    }
  }

  // 2. Perform Sync
  if (agent.skills === 'all') {
    // Mode: directory symlink to entire skillsDir
    const isLink = await isSymlink(expandedPath);
    if (isLink) {
      const target = await getSymlinkTarget(expandedPath);
      const resolvedTarget = target ? path.resolve(path.dirname(expandedPath), target) : null;
      if (resolvedTarget === path.resolve(skillsDir)) {
        return {
          agent: agent.name,
          success: true,
          message: 'Already symlinked to hub directory',
        };
      }
    }

    await safeRemove(expandedPath);
    await createDirectorySymlink(skillsDir, expandedPath);

    return {
      agent: agent.name,
      success: true,
      message: 'Linked entire skills hub directory',
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } else {
    // Mode: Individual skill symlinks inside agent folder
    if (await isSymlink(expandedPath)) {
      // Was a directory symlink, convert to real directory
      await safeRemove(expandedPath);
    }

    await fs.ensureDir(expandedPath);
    const assigned = agent.skills;

    for (const skillName of assigned) {
      const hubSkillPath = path.join(skillsDir, skillName);
      const agentSkillPath = path.join(expandedPath, skillName);

      if (!(await fs.pathExists(hubSkillPath))) {
        warnings.push(`Skill '${skillName}' not found in central hub`);
        continue;
      }

      await createDirectorySymlink(hubSkillPath, agentSkillPath);
    }

    // Clean up removed symlinks
    const entries = await fs.readdir(expandedPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(expandedPath, entry.name);
      if (entry.isSymbolicLink() || (await isSymlink(full))) {
        if (!assigned.includes(entry.name)) {
          await safeRemove(full);
        }
      }
    }

    return {
      agent: agent.name,
      success: true,
      message: `Linked ${assigned.length} skill(s)`,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}

export async function uninstallAgent(agent: Agent): Promise<{ success: boolean; message: string }> {
  const expandedPath = expandPath(agent.path);
  if (!(await fs.pathExists(expandedPath)) && !(await isSymlink(expandedPath))) {
    return { success: true, message: `Path does not exist: ${expandedPath}` };
  }

  // If full directory symlink:
  if (await isSymlink(expandedPath)) {
    await convertSymlinkToRealDirectory(expandedPath);
    return {
      success: true,
      message: `Converted ${agent.name} directory symlink into real local copy.`,
    };
  }

  // If individual symlinks inside directory:
  const entries = await fs.readdir(expandedPath, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    const full = path.join(expandedPath, entry.name);
    if (entry.isSymbolicLink() || (await isSymlink(full))) {
      await convertSymlinkToRealDirectory(full);
      count++;
    }
  }

  return {
    success: true,
    message: `Converted ${count} symlinked skill(s) into local copies for ${agent.name}.`,
  };
}
