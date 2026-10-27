import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';

export function expandPath(inputPath: string): string {
  if (!inputPath) return inputPath;
  if (inputPath.startsWith('~/') || inputPath === '~') {
    return path.join(os.homedir(), inputPath.slice(1));
  }
  if (process.platform === 'win32' && inputPath.startsWith('%USERPROFILE%')) {
    return path.join(os.homedir(), inputPath.replace('%USERPROFILE%', ''));
  }
  return path.resolve(inputPath);
}

export function contractPath(inputPath: string): string {
  if (!inputPath) return inputPath;
  const home = os.homedir();
  if (inputPath.startsWith(home)) {
    return `~${inputPath.slice(home.length)}`;
  }
  return inputPath;
}

export function getDataDir(): string {
  if (process.env.SKILL_NEXUS_DATA) {
    return expandPath(process.env.SKILL_NEXUS_DATA);
  }
  if (process.env.SKILL_HUB_DATA) {
    return expandPath(process.env.SKILL_HUB_DATA);
  }
  const nexusDir = path.join(os.homedir(), '.skill-nexus');
  const legacyHubDir = path.join(os.homedir(), '.skill-hub');
  if (!fs.existsSync(nexusDir) && fs.existsSync(legacyHubDir)) {
    return legacyHubDir;
  }
  return nexusDir;
}

export function getPaths() {
  const dataDir = getDataDir();
  return {
    dataDir,
    skillsDir: path.join(dataDir, 'skills'),
    agentsFile: path.join(dataDir, 'agents.conf'),
    presetsFile: path.join(dataDir, 'presets.conf'),
    settingsFile: path.join(dataDir, 'settings.conf'),
    originsFile: path.join(dataDir, 'origins.json'),
  };
}

export async function getSetting(key: string, defaultValue = ''): Promise<string> {
  const { settingsFile } = getPaths();
  if (!(await fs.pathExists(settingsFile))) return defaultValue;
  const content = await fs.readFile(settingsFile, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    if (k?.trim() === key) {
      return v.join('=').trim();
    }
  }
  return defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { settingsFile, dataDir } = getPaths();
  await fs.ensureDir(dataDir);
  let lines: string[] = [];
  if (await fs.pathExists(settingsFile)) {
    lines = (await fs.readFile(settingsFile, 'utf-8')).split('\n');
  }

  let found = false;
  const updatedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return line;
    const [k] = trimmed.split('=');
    if (k?.trim() === key) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    updatedLines.push(`${key}=${value}`);
  }

  await fs.writeFile(settingsFile, updatedLines.join('\n').trim() + '\n', 'utf-8');
}
