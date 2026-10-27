import path from 'node:path';
import fs from 'fs-extra';
import { getPaths, expandPath } from '../config.js';
import { getAllSkills } from '../skill-manager.js';
import { convertToCursorMdc, convertToCopilot, convertToWindsurf } from './converters.js';
import type { TargetFormat, ExportResult, ConvertOptions } from './types.js';

export async function exportSkills(
  format: TargetFormat,
  outputDir: string = process.cwd(),
  skillFilter?: string[],
  options: ConvertOptions = {}
): Promise<ExportResult> {
  const sourceDir = options.sourceSkillsDir ? expandPath(options.sourceSkillsDir) : getPaths().skillsDir;
  
  if (!(await fs.pathExists(sourceDir))) {
    throw new Error(`Skills source directory does not exist: ${sourceDir}`);
  }

  // Find all skill subdirectories with SKILL.md
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const availableSkillNames: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(sourceDir, entry.name);
    if ((entry.isDirectory() || entry.isSymbolicLink()) && (await fs.pathExists(path.join(full, 'SKILL.md')))) {
      availableSkillNames.push(entry.name);
    }
  }

  const selectedSkills = skillFilter && skillFilter.length > 0
    ? availableSkillNames.filter((s) => skillFilter.includes(s))
    : availableSkillNames;

  if (selectedSkills.length === 0) {
    throw new Error('No skills found to export.');
  }

  // Load content for each skill
  const skillContents: { name: string; content: string }[] = [];
  for (const skName of selectedSkills) {
    const skillMd = path.join(sourceDir, skName, 'SKILL.md');
    if (await fs.pathExists(skillMd)) {
      const content = await fs.readFile(skillMd, 'utf-8');
      skillContents.push({ name: skName, content });
    }
  }

  if (skillContents.length === 0) {
    throw new Error('No valid SKILL.md files found in selected skills.');
  }

  const resolvedOutDir = expandPath(outputDir);
  const filesWritten: string[] = [];

  if (format === 'cursor') {
    // Generates individual .mdc files inside .cursor/rules/
    const rulesDir = path.join(resolvedOutDir, '.cursor', 'rules');
    await fs.ensureDir(rulesDir);

    for (const sk of skillContents) {
      const converted = convertToCursorMdc(sk.name, sk.content, options);
      const filePath = path.join(rulesDir, converted.filename);
      await fs.writeFile(filePath, converted.content, 'utf-8');
      filesWritten.push(filePath);
    }
  } else if (format === 'copilot') {
    // Generates .github/copilot-instructions.md
    const githubDir = path.join(resolvedOutDir, '.github');
    await fs.ensureDir(githubDir);

    const converted = convertToCopilot(skillContents);
    const filePath = path.join(githubDir, converted.filename);
    await fs.writeFile(filePath, converted.content, 'utf-8');
    filesWritten.push(filePath);
  } else if (format === 'windsurf') {
    // Generates .windsurfrules in root of outputDir
    await fs.ensureDir(resolvedOutDir);

    const converted = convertToWindsurf(skillContents);
    const filePath = path.join(resolvedOutDir, converted.filename);
    await fs.writeFile(filePath, converted.content, 'utf-8');
    filesWritten.push(filePath);
  } else {
    throw new Error(`Unsupported format: ${format}. Use 'cursor', 'copilot', or 'windsurf'.`);
  }

  return {
    format,
    targetDir: resolvedOutDir,
    filesWritten,
  };
}
