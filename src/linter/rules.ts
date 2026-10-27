import type { LintIssue } from './types.js';
import { parseSkillMarkdown } from '../utils/frontmatter.js';

interface SecretPattern {
  name: string;
  regex: RegExp;
  description: string;
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: 'OpenAI API Key',
    regex: /\b(sk-(?!ant-)[a-zA-Z0-9_-]{20,}|sk-proj-[a-zA-Z0-9_-]{20,})\b/g,
    description: 'Potential hardcoded OpenAI API key',
  },
  {
    name: 'Anthropic API Key',
    regex: /\bsk-ant-[a-zA-Z0-9_-]{20,}\b/g,
    description: 'Potential hardcoded Anthropic API key',
  },
  {
    name: 'Google API Key',
    regex: /\bAIza[0-9A-Za-z\\-_]{35}\b/g,
    description: 'Potential hardcoded Google Cloud / Gemini API key',
  },
  {
    name: 'AWS Access Key',
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
    description: 'Potential hardcoded AWS Access Key ID',
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /\b(ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z_]{82})\b/g,
    description: 'Potential hardcoded GitHub Personal Access Token',
  },
  {
    name: 'Private Key',
    regex: /-----BEGIN (?:RSA|EC|OPENSSH|DSA|PGP|PRIVATE) KEY-----/g,
    description: 'Private cryptographic key embedded in plain text',
  },
  {
    name: 'Slack Token',
    regex: /\bxox[baprs]-[0-9]{12}-[0-9]{12}-[a-zA-Z0-9]{24}\b/g,
    description: 'Potential hardcoded Slack token',
  },
];

interface DangerousCommandPattern {
  name: string;
  regex: RegExp;
  description: string;
  recommendation: string;
}

const DANGEROUS_COMMANDS: DangerousCommandPattern[] = [
  {
    name: 'Catastrophic Recursive Delete',
    regex: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*|--recursive\s+--force)\s+(\/|~|\$HOME|\*|\/\*)(\s|$|;)/i,
    description: 'Dangerous recursive deletion targeting root or home directory',
    recommendation: 'Target specific folders only, never delete root or broad wildcard scopes.',
  },
  {
    name: 'Unsafe Remote Script Pipe Execution',
    regex: /\b(curl|wget)\s+[^|\n]+\|\s*(ba|z|k)?sh\b/i,
    description: 'Piping remote web scripts directly into a shell interpreter',
    recommendation: 'Download, inspect contents or verify checksum before execution.',
  },
  {
    name: 'Fork Bomb',
    regex: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/g,
    description: 'Shell fork bomb detected',
    recommendation: 'Remove fork bomb pattern immediately.',
  },
  {
    name: 'Direct Disk Formatting',
    regex: /\bmkfs\.[a-z0-9]+\s+\/dev\/[a-z0-9]+/i,
    description: 'Command directly formats a block device / disk partition',
    recommendation: 'Disk operations should require manual user verification.',
  },
  {
    name: 'System File Modification',
    regex: />\s*\/etc\/(passwd|shadow|sudoers|hosts)\b/i,
    description: 'Attempting to overwrite sensitive operating system configuration files',
    recommendation: 'Avoid mutating system security files directly.',
  },
];

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // A standard rule of thumb for English & code: 1 token ≈ 4 characters
  // or words * 1.3. We use the character ratio with whitespace consideration.
  return Math.ceil(text.length / 3.8);
}

export function checkSecrets(content: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = content.split('\n');

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    // Skip example lines that contain placeholders like "sk-ant-...your-key..."
    if (line.toLowerCase().includes('placeholder') || line.toLowerCase().includes('your_api_key')) {
      continue;
    }

    for (const pat of SECRET_PATTERNS) {
      pat.regex.lastIndex = 0;
      const match = pat.regex.exec(line);
      if (match) {
        issues.push({
          ruleId: 'security/no-hardcoded-secrets',
          severity: 'error',
          message: `${pat.description} (${pat.name})`,
          line: lineIdx + 1,
          snippet: line.trim().slice(0, 80),
          recommendation: 'Use environment variables (e.g. process.env or $API_KEY) instead of hardcoding secrets.',
        });
      }
    }
  }

  return issues;
}

export function checkDangerousCommands(content: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = content.split('\n');

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    for (const cmd of DANGEROUS_COMMANDS) {
      cmd.regex.lastIndex = 0;
      if (cmd.regex.test(line)) {
        issues.push({
          ruleId: 'security/dangerous-command',
          severity: 'error',
          message: `${cmd.description} (${cmd.name})`,
          line: lineIdx + 1,
          snippet: line.trim().slice(0, 80),
          recommendation: cmd.recommendation,
        });
      }
    }
  }

  return issues;
}

export function checkSchemaAndQuality(content: string, expectedSkillName?: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const parsed = parseSkillMarkdown(content);

  // 1. YAML Frontmatter existence
  const hasFrontmatter = content.startsWith('---');
  if (!hasFrontmatter) {
    issues.push({
      ruleId: 'schema/missing-frontmatter',
      severity: 'error',
      message: 'SKILL.md must begin with YAML frontmatter fenced by "---".',
      recommendation: 'Add "---" frontmatter with "name" and "description" at the top of the file.',
    });
    return issues;
  }

  // 2. Name field validation
  if (!parsed.name || typeof parsed.name !== 'string' || !parsed.name.trim()) {
    issues.push({
      ruleId: 'schema/missing-name',
      severity: 'error',
      message: 'Frontmatter is missing required "name" property.',
      recommendation: 'Define a concise skill name (e.g. name: my-skill).',
    });
  } else {
    const trimmedName = parsed.name.trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
      issues.push({
        ruleId: 'schema/invalid-name-format',
        severity: 'warning',
        message: `Skill name "${trimmedName}" should only contain alphanumeric characters, hyphens, and underscores.`,
      });
    }

    if (expectedSkillName && trimmedName !== expectedSkillName) {
      issues.push({
        ruleId: 'schema/name-folder-mismatch',
        severity: 'warning',
        message: `Skill name in frontmatter ("${trimmedName}") does not match directory name ("${expectedSkillName}").`,
      });
    }
  }

  // 3. Description field validation
  if (!parsed.description || typeof parsed.description !== 'string' || !parsed.description.trim()) {
    issues.push({
      ruleId: 'schema/missing-description',
      severity: 'warning',
      message: 'Frontmatter is missing "description" property. AI agents use descriptions to decide when to activate skills.',
      recommendation: 'Add a clear one-sentence summary of what this skill does.',
    });
  } else if (parsed.description.trim().length < 10) {
    issues.push({
      ruleId: 'quality/short-description',
      severity: 'info',
      message: 'Skill description is very short. Provide more context for AI agents.',
    });
  }

  // 4. Instructions body quality
  const body = parsed.body.trim();
  if (!body) {
    issues.push({
      ruleId: 'quality/empty-instructions',
      severity: 'error',
      message: 'Skill markdown has no instructions body.',
      recommendation: 'Add clear guidance, commands, and rules for the AI agent.',
    });
  } else if (!body.includes('#')) {
    issues.push({
      ruleId: 'quality/missing-headings',
      severity: 'info',
      message: 'Skill instructions do not contain markdown headings (# Header). Structure helps agents parse rules.',
    });
  }

  // 5. Token context size checks
  const tokenEst = estimateTokenCount(content);
  if (tokenEst > 3500) {
    issues.push({
      ruleId: 'performance/excessive-token-size',
      severity: 'error',
      message: `Skill size is excessively large (~${tokenEst.toLocaleString()} tokens). This will consume significant agent context window.`,
      recommendation: 'Break this skill down into smaller focused skills or move reference documents to separate files.',
    });
  } else if (tokenEst > 1500) {
    issues.push({
      ruleId: 'performance/large-token-size',
      severity: 'warning',
      message: `Skill size is relatively large (~${tokenEst.toLocaleString()} tokens).`,
      recommendation: 'Consider streamlining prompt instructions to preserve agent context space.',
    });
  }

  return issues;
}
