import fs from 'fs-extra';
import { getPaths } from './config.js';
import { setAgentSkills } from './agent-manager.js';
import type { Preset } from './types.js';

export async function loadPresets(): Promise<Preset[]> {
  const { presetsFile } = getPaths();
  if (!(await fs.pathExists(presetsFile))) {
    return [];
  }

  const content = await fs.readFile(presetsFile, 'utf-8');
  const presets: Preset[] = [];

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [name, ...rest] = trimmed.split(':');
    if (!name) continue;

    const skillsStr = rest.join(':').trim();
    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    presets.push({
      name: name.trim(),
      skills,
    });
  }

  return presets;
}

export async function savePresets(presets: Preset[]): Promise<void> {
  const { presetsFile, dataDir } = getPaths();
  await fs.ensureDir(dataDir);

  const lines = presets.map((p) => `${p.name}:${p.skills.join(',')}`);
  await fs.writeFile(presetsFile, lines.join('\n') + '\n', 'utf-8');
}

export async function createPreset(name: string, skills: string[]): Promise<void> {
  const presets = await loadPresets();
  const existing = presets.find((p) => p.name === name);
  if (existing) {
    existing.skills = skills;
  } else {
    presets.push({ name, skills });
  }
  await savePresets(presets);
}

export async function getPreset(name: string): Promise<Preset | undefined> {
  const presets = await loadPresets();
  return presets.find((p) => p.name === name);
}

export async function deletePreset(name: string): Promise<boolean> {
  const presets = await loadPresets();
  const filtered = presets.filter((p) => p.name !== name);
  if (filtered.length !== presets.length) {
    await savePresets(filtered);
    return true;
  }
  return false;
}

export async function applyPreset(agentName: string, presetName: string): Promise<void> {
  const preset = await getPreset(presetName);
  if (!preset) {
    throw new Error(`Preset '${presetName}' not found.`);
  }
  await setAgentSkills(agentName, preset.skills);
}
