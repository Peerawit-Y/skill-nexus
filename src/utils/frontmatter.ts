import yaml from 'yaml';
import type { SkillMetadata } from '../types.js';

export interface ParsedFrontmatter {
  name?: string;
  description?: string;
  allowedTools?: string;
  metadata?: SkillMetadata;
  attributes: Record<string, unknown>;
  body: string;
}

export function parseSkillMarkdown(content: string): ParsedFrontmatter {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return {
      attributes: {},
      body: content,
    };
  }

  const rawYaml = match[1];
  const body = match[2];

  let attributes: Record<string, unknown> = {};
  try {
    attributes = (yaml.parse(rawYaml) as Record<string, unknown>) || {};
  } catch {
    attributes = {};
  }

  // Handle inline metadata if stringified json
  let metadata: SkillMetadata | undefined;
  if (typeof attributes.metadata === 'string') {
    try {
      metadata = JSON.parse(attributes.metadata) as SkillMetadata;
    } catch {
      // ignore
    }
  } else if (typeof attributes.metadata === 'object' && attributes.metadata !== null) {
    metadata = attributes.metadata as SkillMetadata;
  }

  return {
    name: (attributes.name as string) || undefined,
    description: (attributes.description as string) || undefined,
    allowedTools: (attributes['allowed-tools'] as string) || undefined,
    metadata,
    attributes,
    body,
  };
}

export function formatSkillMarkdown(
  frontmatter: Record<string, unknown>,
  body: string
): string {
  const yamlStr = yaml.stringify(frontmatter).trim();
  return `---\n${yamlStr}\n---\n\n${body.trim()}\n`;
}
