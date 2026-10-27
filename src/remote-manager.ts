import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { execSync } from 'node:child_process';
import { getPaths } from './config.js';
import { safeRemove } from './symlink.js';
import type { SkillOrigin } from './types.js';

export interface ParsedSource {
  url: string;
  branch?: string;
  subpath?: string;
  defaultName: string;
}

export function parseGitSource(source: string): ParsedSource {
  const trimmed = source.trim();

  // Pattern 1: GitHub URL with /tree/<branch>/<subpath>
  const treeMatch = trimmed.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/
  );
  if (treeMatch) {
    const [, owner, repo, branch, subpath] = treeMatch;
    const defaultName = path.basename(subpath).replace(/\.git$/, '');
    return {
      url: `https://github.com/${owner}/${repo}.git`,
      branch,
      subpath,
      defaultName,
    };
  }

  // Pattern 2: Normal Git URL (https or git@)
  if (trimmed.startsWith('https://') || trimmed.startsWith('git@') || trimmed.endsWith('.git')) {
    const cleanUrl = trimmed.endsWith('.git') ? trimmed : `${trimmed}.git`;
    const repoName = path.basename(trimmed, '.git');
    return {
      url: cleanUrl,
      defaultName: repoName,
    };
  }

  // Pattern 3: GitHub shorthand e.g. "owner/repo" or "owner/repo/sub/path"
  const parts = trimmed.split('/');
  if (parts.length === 2) {
    return {
      url: `https://github.com/${parts[0]}/${parts[1]}.git`,
      defaultName: parts[1],
    };
  } else if (parts.length > 2) {
    const owner = parts[0];
    const repo = parts[1];
    const subpath = parts.slice(2).join('/');
    return {
      url: `https://github.com/${owner}/${repo}.git`,
      subpath,
      defaultName: path.basename(subpath),
    };
  }

  throw new Error(`Invalid git source: "${source}". Expected owner/repo or git URL.`);
}

export async function loadOrigins(): Promise<Record<string, SkillOrigin>> {
  const { originsFile } = getPaths();
  if (!(await fs.pathExists(originsFile))) {
    return {};
  }
  try {
    return await fs.readJson(originsFile);
  } catch {
    return {};
  }
}

export async function saveOrigins(origins: Record<string, SkillOrigin>): Promise<void> {
  const { originsFile, dataDir } = getPaths();
  await fs.ensureDir(dataDir);
  await fs.writeJson(originsFile, origins, { spaces: 2 });
}

export async function installRemoteSkill(
  source: string,
  customName?: string
): Promise<{ installedSkills: string[]; targetPath: string }> {
  const parsed = parseGitSource(source);
  const { skillsDir } = getPaths();
  await fs.ensureDir(skillsDir);

  const tmpDir = path.join(os.tmpdir(), `skill-nexus-install-${Date.now()}`);

  try {
    // 1. Clone repository into temporary directory
    const branchArg = parsed.branch ? `-b ${parsed.branch}` : '';
    const cloneCmd = `git clone --depth 1 ${branchArg} "${parsed.url}" "${tmpDir}"`;
    execSync(cloneCmd, { stdio: 'ignore' });

    const origins = await loadOrigins();
    const installedSkills: string[] = [];

    if (parsed.subpath) {
      // Installing specific subfolder
      const subfolderPath = path.join(tmpDir, parsed.subpath);
      if (!(await fs.pathExists(subfolderPath))) {
        throw new Error(`Subpath '${parsed.subpath}' does not exist in repository.`);
      }

      const skillMd = path.join(subfolderPath, 'SKILL.md');
      if (!(await fs.pathExists(skillMd))) {
        throw new Error(`Missing SKILL.md in '${parsed.subpath}'.`);
      }

      const skillName = customName || parsed.defaultName;
      const destDir = path.join(skillsDir, skillName);
      if (await fs.pathExists(destDir)) {
        throw new Error(`Skill '${skillName}' already exists in hub.`);
      }

      await fs.copy(subfolderPath, destDir);
      installedSkills.push(skillName);

      origins[skillName] = {
        source,
        url: parsed.url,
        branch: parsed.branch,
        subpath: parsed.subpath,
        installedAt: new Date().toISOString(),
        type: 'subfolder',
      };
      await saveOrigins(origins);

      return { installedSkills, targetPath: destDir };
    }

    // Check if root of repo has SKILL.md
    const rootSkillMd = path.join(tmpDir, 'SKILL.md');
    if (await fs.pathExists(rootSkillMd)) {
      const skillName = customName || parsed.defaultName;
      const destDir = path.join(skillsDir, skillName);
      if (await fs.pathExists(destDir)) {
        throw new Error(`Skill '${skillName}' already exists in hub.`);
      }

      await fs.move(tmpDir, destDir);
      installedSkills.push(skillName);

      origins[skillName] = {
        source,
        url: parsed.url,
        branch: parsed.branch,
        installedAt: new Date().toISOString(),
        type: 'git-repo',
      };
      await saveOrigins(origins);

      return { installedSkills, targetPath: destDir };
    }

    // If root does not have SKILL.md, search immediate subdirectories for skills
    const entries = await fs.readdir(tmpDir, { withFileTypes: true });
    const foundSubSkills: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const subSkillMd = path.join(tmpDir, entry.name, 'SKILL.md');
        if (await fs.pathExists(subSkillMd)) {
          foundSubSkills.push(entry.name);
        }
      }
    }

    if (foundSubSkills.length === 0) {
      throw new Error(`No SKILL.md found in repository root or immediate subdirectories.`);
    }

    // Install all detected sub-skills
    for (const sub of foundSubSkills) {
      const destDir = path.join(skillsDir, sub);
      if (await fs.pathExists(destDir)) {
        // Skip or overwrite? Safe skip if already present
        continue;
      }
      await fs.copy(path.join(tmpDir, sub), destDir);
      installedSkills.push(sub);

      origins[sub] = {
        source,
        url: parsed.url,
        branch: parsed.branch,
        subpath: sub,
        installedAt: new Date().toISOString(),
        type: 'subfolder',
      };
    }

    await saveOrigins(origins);

    return {
      installedSkills,
      targetPath: skillsDir,
    };
  } finally {
    // Clean up tmpDir if still exists
    await safeRemove(tmpDir);
  }
}

export interface UpdateResult {
  skill: string;
  updated: boolean;
  message: string;
}

export async function updateRemoteSkills(specificSkill?: string): Promise<UpdateResult[]> {
  const { skillsDir } = getPaths();
  if (!(await fs.pathExists(skillsDir))) {
    return [];
  }
  const origins = await loadOrigins();
  const results: UpdateResult[] = [];

  const targets = specificSkill
    ? [specificSkill]
    : await fs.readdir(skillsDir);

  for (const name of targets) {
    if (name.startsWith('.')) continue;

    const skillPath = path.join(skillsDir, name);
    if (!(await fs.pathExists(skillPath))) {
      if (specificSkill) {
        results.push({ skill: name, updated: false, message: 'Skill not found in hub' });
      }
      continue;
    }

    // Case 1: Skill has a .git repository inside it
    const gitDir = path.join(skillPath, '.git');
    if (await fs.pathExists(gitDir)) {
      try {
        const out = execSync('git pull', { cwd: skillPath, encoding: 'utf-8' });
        const isUpToDate = out.includes('Already up to date');
        results.push({
          skill: name,
          updated: !isUpToDate,
          message: isUpToDate ? 'Already up to date' : 'Updated to latest commit',
        });
        continue;
      } catch (err: unknown) {
        results.push({
          skill: name,
          updated: false,
          message: `Git pull failed: ${(err as Error).message}`,
        });
        continue;
      }
    }

    // Case 2: Origin recorded in origins.json (subfolder from remote repo)
    const origin = origins[name];
    if (origin && origin.type === 'subfolder') {
      const tmpDir = path.join(os.tmpdir(), `skill-nexus-update-${name}-${Date.now()}`);
      try {
        const branchArg = origin.branch ? `-b ${origin.branch}` : '';
        execSync(`git clone --depth 1 ${branchArg} "${origin.url}" "${tmpDir}"`, {
          stdio: 'ignore',
        });

        const subfolderPath = origin.subpath ? path.join(tmpDir, origin.subpath) : tmpDir;
        if (await fs.pathExists(subfolderPath)) {
          await fs.copy(subfolderPath, skillPath);
          results.push({
            skill: name,
            updated: true,
            message: 'Updated from remote repository',
          });
        } else {
          results.push({
            skill: name,
            updated: false,
            message: `Remote subpath '${origin.subpath}' no longer exists`,
          });
        }
      } catch (err: unknown) {
        results.push({
          skill: name,
          updated: false,
          message: `Update failed: ${(err as Error).message}`,
        });
      } finally {
        await safeRemove(tmpDir);
      }
      continue;
    }

    if (specificSkill) {
      results.push({
        skill: name,
        updated: false,
        message: 'Not a remote skill (no .git or recorded origin)',
      });
    }
  }

  return results;
}
