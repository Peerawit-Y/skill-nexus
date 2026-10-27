import path from 'node:path';
import fs from 'fs-extra';
import { execSync } from 'node:child_process';
import { getPaths, expandPath, contractPath, getSetting } from './config.js';
import { isSymlink, getSymlinkTarget, createDirectorySymlink } from './symlink.js';
import { parseSkillMarkdown } from './utils/frontmatter.js';
import type { Skill, SkillMetadata } from './types.js';

export async function getTemplateContent(): Promise<string> {
  // Check local project template first
  const localTemplate = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '../../templates/skill-template/SKILL.md'
  );
  if (await fs.pathExists(localTemplate)) {
    return await fs.readFile(localTemplate, 'utf-8');
  }

  return `---
name: {{SKILL_NAME}}
description: Brief description of what this skill does
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# {{SKILL_NAME}}

Instructions for the AI agent go here.

## Overview

Describe what this skill enables the agent to do.

## Usage

How to use this skill.

## Commands

List any specific commands or workflows.
`;
}

export async function getAllSkills(): Promise<Skill[]> {
  const { skillsDir } = getPaths();
  if (!(await fs.pathExists(skillsDir))) {
    return [];
  }

  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const skills: Skill[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue; // ignore hidden like .system

    const fullPath = path.join(skillsDir, entry.name);
    const isLink = entry.isSymbolicLink() || (await isSymlink(fullPath));

    let isProjectLinked = false;
    let targetPath: string | undefined;

    if (isLink) {
      isProjectLinked = true;
      targetPath = (await getSymlinkTarget(fullPath)) || undefined;
    } else if (!entry.isDirectory()) {
      continue;
    }

    // Try reading description from SKILL.md
    let description: string | undefined;
    let metadata: SkillMetadata | undefined;
    const skillMdPath = path.join(fullPath, 'SKILL.md');
    if (await fs.pathExists(skillMdPath)) {
      try {
        const content = await fs.readFile(skillMdPath, 'utf-8');
        const parsed = parseSkillMarkdown(content);
        description = parsed.description;
        metadata = parsed.metadata;
      } catch {
        // ignore
      }
    }

    skills.push({
      name: entry.name,
      isProjectLinked,
      path: fullPath,
      targetPath,
      description,
      metadata,
    });
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createNewSkill(name: string): Promise<string> {
  const { skillsDir } = getPaths();
  const targetDir = path.join(skillsDir, name);

  if (await fs.pathExists(targetDir)) {
    throw new Error(`Skill '${name}' already exists at ${targetDir}`);
  }

  await fs.ensureDir(targetDir);
  const template = await getTemplateContent();
  const filled = template.replaceAll('{{SKILL_NAME}}', name);
  const targetFile = path.join(targetDir, 'SKILL.md');
  await fs.writeFile(targetFile, filled, 'utf-8');

  return targetFile;
}

export async function linkProjectSkill(skillName: string, projectPathInput: string): Promise<void> {
  const { skillsDir } = getPaths();
  const projectPath = expandPath(projectPathInput);

  if (!(await fs.pathExists(projectPath))) {
    throw new Error(`Project directory does not exist: ${projectPath}`);
  }

  const skillMd = path.join(projectPath, 'SKILL.md');
  if (!(await fs.pathExists(skillMd))) {
    throw new Error(`Target project repo is missing SKILL.md at root: ${projectPath}`);
  }

  const destination = path.join(skillsDir, skillName);
  await createDirectorySymlink(projectPath, destination);
}

export async function migrateSkill(
  skillName: string,
  destinationProjectDir?: string
): Promise<{ projectPath: string; symlinkPath: string }> {
  const { skillsDir } = getPaths();
  const skillPath = path.join(skillsDir, skillName);

  if (!(await fs.pathExists(skillPath))) {
    throw new Error(`Skill '${skillName}' not found in hub.`);
  }

  if (await isSymlink(skillPath)) {
    throw new Error(`Skill '${skillName}' is already project-linked.`);
  }

  let baseDir = destinationProjectDir;
  if (!baseDir) {
    baseDir = await getSetting('project_dir', '~/p');
  }
  const expandedBaseDir = expandPath(baseDir);
  const targetProjectPath = path.join(expandedBaseDir, skillName);

  if (await fs.pathExists(targetProjectPath)) {
    throw new Error(`Destination directory already exists: ${targetProjectPath}`);
  }

  await fs.ensureDir(expandedBaseDir);
  await fs.move(skillPath, targetProjectPath);

  // Link back
  await createDirectorySymlink(targetProjectPath, skillPath);

  // Check git_init setting
  const gitInit = await getSetting('git_init', 'false');
  if (gitInit === 'true') {
    try {
      execSync('git init', { cwd: targetProjectPath, stdio: 'ignore' });
      execSync('git add -A && git commit -m "Initial skill commit"', {
        cwd: targetProjectPath,
        stdio: 'ignore',
      });
    } catch {
      // ignore git error if git not available or user not configured
    }
  }

  return {
    projectPath: targetProjectPath,
    symlinkPath: skillPath,
  };
}

export async function listLocalSkills(agentSkillsDir: string): Promise<string[]> {
  const expanded = expandPath(agentSkillsDir);
  if (!(await fs.pathExists(expanded))) return [];
  if (await isSymlink(expanded)) return [];

  const entries = await fs.readdir(expanded, { withFileTypes: true });
  const localSkills: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(expanded, entry.name);
    const link = entry.isSymbolicLink() || (await isSymlink(full));
    if (!link && entry.isDirectory()) {
      localSkills.push(entry.name);
    }
  }

  return localSkills;
}

export async function adoptSkill(
  agentSkillsDir: string,
  skillName: string
): Promise<{ hubPath: string; agentSkillPath: string }> {
  const { skillsDir } = getPaths();
  const expanded = expandPath(agentSkillsDir);
  const localSkillDir = path.join(expanded, skillName);

  if (!(await fs.pathExists(localSkillDir))) {
    throw new Error(`Local skill '${skillName}' not found in ${contractPath(expanded)}`);
  }

  if (await isSymlink(localSkillDir)) {
    throw new Error(`'${skillName}' is already a symlink, cannot adopt.`);
  }

  const hubSkillDir = path.join(skillsDir, skillName);
  if (await fs.pathExists(hubSkillDir)) {
    throw new Error(`Skill '${skillName}' already exists in central skill-nexus.`);
  }

  await fs.ensureDir(skillsDir);
  await fs.move(localSkillDir, hubSkillDir);
  await createDirectorySymlink(hubSkillDir, localSkillDir);

  return {
    hubPath: hubSkillDir,
    agentSkillPath: localSkillDir,
  };
}

export async function checkDependencies(): Promise<{
  skill: string;
  bins: { name: string; found: boolean }[];
  env: { name: string; found: boolean }[];
}[]> {
  const skills = await getAllSkills();
  const results = [];

  for (const skill of skills) {
    const meta = skill.metadata;
    const requires = meta?.requires || meta?.clawdbot?.requires;
    if (!requires) continue;

    const bins = (requires.bins || []).map((bin) => {
      let found = false;
      try {
        const cmd = process.platform === 'win32' ? `where ${bin}` : `command -v ${bin}`;
        execSync(cmd, { stdio: 'ignore' });
        found = true;
      } catch {
        found = false;
      }
      return { name: bin, found };
    });

    const env = (requires.env || []).map((key) => ({
      name: key,
      found: Boolean(process.env[key]),
    }));

    if (bins.length > 0 || env.length > 0) {
      results.push({
        skill: skill.name,
        bins,
        env,
      });
    }
  }

  return results;
}
