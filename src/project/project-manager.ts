import path from 'node:path';
import fs from 'fs-extra';
import { getPaths, contractPath } from '../config.js';
import { createDirectorySymlink } from '../symlink.js';
import { getTemplateContent } from '../skill-manager.js';
import { parseSkillMarkdown } from '../utils/frontmatter.js';
import { exportSkills } from '../converter/exporter.js';
import type { ProjectConfig, ProjectSkill, ProjectSyncResult } from './types.js';
import type { TargetFormat } from '../converter/types.js';

export const CONFIG_FILE_NAME = '.skill-nexus.json';
export const DEFAULT_SKILLS_DIR = '.skills';

export async function findProjectRoot(startDir: string = process.cwd()): Promise<string | null> {
  let current = path.resolve(startDir);
  const root = path.parse(current).root;

  while (current !== root) {
    if (
      (await fs.pathExists(path.join(current, CONFIG_FILE_NAME))) ||
      (await fs.pathExists(path.join(current, DEFAULT_SKILLS_DIR))) ||
      (await fs.pathExists(path.join(current, '.git')))
    ) {
      return current;
    }
    current = path.dirname(current);
  }

  return null;
}

export async function initProject(
  targetDir: string = process.cwd(),
  options: Partial<ProjectConfig> = {}
): Promise<{ projectRoot: string; configPath: string; created: boolean }> {
  const projectRoot = path.resolve(targetDir);
  const configPath = path.join(projectRoot, CONFIG_FILE_NAME);
  const skillsDirPath = path.join(projectRoot, options.skillsDir || DEFAULT_SKILLS_DIR);

  await fs.ensureDir(projectRoot);
  await fs.ensureDir(skillsDirPath);

  const projectName = options.name || path.basename(projectRoot);
  const config: ProjectConfig = {
    name: projectName,
    skillsDir: options.skillsDir || DEFAULT_SKILLS_DIR,
    autoExport: options.autoExport || ['cursor', 'copilot'],
    linkToGlobal: options.linkToGlobal ?? false,
  };

  const alreadyExisted = await fs.pathExists(configPath);
  await fs.writeJson(configPath, config, { spaces: 2 });

  // Create default starter skill if .skills is empty
  const entries = await fs.readdir(skillsDirPath);
  if (entries.length === 0) {
    const starterDir = path.join(skillsDirPath, 'project-guidelines');
    await fs.ensureDir(starterDir);
    const starterSkillMd = path.join(starterDir, 'SKILL.md');
    const content = `---
name: project-guidelines
description: Core architecture and development conventions for ${projectName}
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# ${projectName} Guidelines

Team guidelines and coding standards for ${projectName}.

## Architecture & Conventions
- Maintain consistent code style and run tests before committing.
- Follow Git branching guidelines and project architecture.
`;
    await fs.writeFile(starterSkillMd, content, 'utf-8');
  }

  return {
    projectRoot,
    configPath,
    created: !alreadyExisted,
  };
}

export async function loadProjectConfig(projectRoot: string): Promise<ProjectConfig | null> {
  const configPath = path.join(projectRoot, CONFIG_FILE_NAME);
  if (!(await fs.pathExists(configPath))) {
    return null;
  }
  try {
    return await fs.readJson(configPath);
  } catch {
    return null;
  }
}

export async function saveProjectConfig(projectRoot: string, config: ProjectConfig): Promise<void> {
  const configPath = path.join(projectRoot, CONFIG_FILE_NAME);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

export async function getProjectSkills(projectRoot: string): Promise<ProjectSkill[]> {
  const config = await loadProjectConfig(projectRoot);
  const skillsDirName = config?.skillsDir || DEFAULT_SKILLS_DIR;
  const fullSkillsDir = path.join(projectRoot, skillsDirName);

  if (!(await fs.pathExists(fullSkillsDir))) {
    return [];
  }

  const entries = await fs.readdir(fullSkillsDir, { withFileTypes: true });
  const skills: ProjectSkill[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const skillPath = path.join(fullSkillsDir, entry.name);
    if (!entry.isDirectory()) continue;

    let description: string | undefined;
    const skillMd = path.join(skillPath, 'SKILL.md');
    if (await fs.pathExists(skillMd)) {
      try {
        const content = await fs.readFile(skillMd, 'utf-8');
        const parsed = parseSkillMarkdown(content);
        description = parsed.description;
      } catch {
        // ignore
      }
    }

    skills.push({
      name: entry.name,
      path: skillPath,
      description,
    });
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createProjectSkill(projectRoot: string, skillName: string): Promise<string> {
  const config = await loadProjectConfig(projectRoot);
  const skillsDirName = config?.skillsDir || DEFAULT_SKILLS_DIR;
  const targetDir = path.join(projectRoot, skillsDirName, skillName);

  if (await fs.pathExists(targetDir)) {
    throw new Error(`Project skill '${skillName}' already exists at ${targetDir}`);
  }

  await fs.ensureDir(targetDir);
  const template = await getTemplateContent();
  const filled = template.replaceAll('{{SKILL_NAME}}', skillName);
  const targetFile = path.join(targetDir, 'SKILL.md');
  await fs.writeFile(targetFile, filled, 'utf-8');

  return targetFile;
}

export async function syncProject(
  projectRoot: string,
  options: {
    exportFormats?: TargetFormat[];
    linkGlobal?: boolean;
  } = {}
): Promise<ProjectSyncResult> {
  const config = (await loadProjectConfig(projectRoot)) || {
    name: path.basename(projectRoot),
    skillsDir: DEFAULT_SKILLS_DIR,
    autoExport: ['cursor', 'copilot'],
  };

  const skills = await getProjectSkills(projectRoot);
  const linkedAgents: string[] = [];
  const exportedFormats: TargetFormat[] = [];

  // 1. Project-level Claude Code (.claude/skills)
  const projectClaudeSkills = path.join(projectRoot, '.claude', 'skills');
  if (await fs.pathExists(path.join(projectRoot, '.claude'))) {
    await fs.ensureDir(projectClaudeSkills);
    for (const sk of skills) {
      const dest = path.join(projectClaudeSkills, sk.name);
      await createDirectorySymlink(sk.path, dest);
    }
    linkedAgents.push('claude (.claude/skills)');
  }

  // 2. Export to IDE native formats (Cursor, Copilot, Windsurf)
  const formatsToExport = options.exportFormats || config.autoExport || [];
  const projectSkillsDir = path.join(projectRoot, config.skillsDir || DEFAULT_SKILLS_DIR);
  if (skills.length > 0) {
    for (const fmt of formatsToExport) {
      await exportSkills(fmt, projectRoot, skills.map((s) => s.name), {
        sourceSkillsDir: projectSkillsDir,
      });
      exportedFormats.push(fmt);
    }
  }

  // 3. Link project skills to global hub if enabled
  const shouldLinkGlobal = options.linkGlobal ?? config.linkToGlobal ?? false;
  if (shouldLinkGlobal) {
    const { skillsDir: globalSkillsDir } = getPaths();
    await fs.ensureDir(globalSkillsDir);

    for (const sk of skills) {
      const globalLinkName = `${config.name}-${sk.name}`;
      const globalDest = path.join(globalSkillsDir, globalLinkName);
      await createDirectorySymlink(sk.path, globalDest);
    }
  }

  return {
    projectRoot,
    skillsFound: skills.length,
    linkedAgents,
    exportedFormats,
    globalLinked: shouldLinkGlobal,
  };
}
