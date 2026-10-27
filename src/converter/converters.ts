import yaml from 'yaml';
import { parseSkillMarkdown } from '../utils/frontmatter.js';
import type { ConvertedFile, ConvertOptions } from './types.js';

export function convertToCursorMdc(
  skillName: string,
  content: string,
  options: ConvertOptions = {}
): ConvertedFile {
  const parsed = parseSkillMarkdown(content);
  const description = parsed.description || `Guidelines and instructions for ${skillName}`;
  const globs = options.globs || '*';
  const alwaysApply = options.alwaysApply ?? false;

  const mdcFrontmatter = {
    description,
    globs,
    alwaysApply,
  };

  const frontmatterStr = yaml.stringify(mdcFrontmatter).trim();
  const body = parsed.body.trim();

  const mdcContent = `---\n${frontmatterStr}\n---\n\n${body}\n`;

  return {
    filename: `${skillName}.mdc`,
    relativePath: `.cursor/rules/${skillName}.mdc`,
    content: mdcContent,
    format: 'cursor',
  };
}

export function convertToCopilot(
  skills: { name: string; content: string }[]
): ConvertedFile {
  const sections: string[] = [
    '# GitHub Copilot Instructions\n',
    'These instructions are compiled by Skill Nexus to guide GitHub Copilot across project conventions and skills.\n',
  ];

  for (const sk of skills) {
    const parsed = parseSkillMarkdown(sk.content);
    sections.push(`## Skill: ${parsed.name || sk.name}`);
    if (parsed.description) {
      sections.push(`> ${parsed.description}\n`);
    }
    sections.push(parsed.body.trim());
    sections.push('\n---\n');
  }

  return {
    filename: 'copilot-instructions.md',
    relativePath: '.github/copilot-instructions.md',
    content: sections.join('\n').trim() + '\n',
    format: 'copilot',
  };
}

export function convertToWindsurf(
  skills: { name: string; content: string }[]
): ConvertedFile {
  const sections: string[] = [
    '# Windsurf Global Rules & Skills\n',
    'Compiled by Skill Nexus for Codeium Windsurf Cascade Agent.\n',
  ];

  for (const sk of skills) {
    const parsed = parseSkillMarkdown(sk.content);
    const descAttr = parsed.description ? ` description="${parsed.description.replaceAll('"', '&quot;')}"` : '';
    sections.push(`<rule name="${parsed.name || sk.name}"${descAttr}>`);
    sections.push(parsed.body.trim());
    sections.push('</rule>\n');
  }

  return {
    filename: '.windsurfrules',
    relativePath: '.windsurfrules',
    content: sections.join('\n').trim() + '\n',
    format: 'windsurf',
  };
}
