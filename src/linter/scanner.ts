import path from 'node:path';
import fs from 'fs-extra';
import pc from 'picocolors';
import { getPaths, contractPath } from '../config.js';
import { getAllSkills } from '../skill-manager.js';
import { checkSecrets, checkDangerousCommands, checkSchemaAndQuality, estimateTokenCount } from './rules.js';
import type { SkillLintResult, LintSummary, LintIssue } from './types.js';

export function lintSkillContent(
  content: string,
  skillName: string,
  filePath: string
): SkillLintResult {
  const issues: LintIssue[] = [
    ...checkSecrets(content),
    ...checkDangerousCommands(content),
    ...checkSchemaAndQuality(content, skillName),
  ];

  const hasErrors = issues.some((i) => i.severity === 'error');
  const tokenEstimate = estimateTokenCount(content);

  return {
    skillName,
    path: filePath,
    valid: !hasErrors,
    tokenEstimate,
    characterCount: content.length,
    lineCount: content.split('\n').length,
    issues,
  };
}

export async function lintSkill(skillName: string): Promise<SkillLintResult> {
  const { skillsDir } = getPaths();
  const skillDir = path.join(skillsDir, skillName);
  const skillMd = path.join(skillDir, 'SKILL.md');

  if (!(await fs.pathExists(skillMd))) {
    return {
      skillName,
      path: skillDir,
      valid: false,
      tokenEstimate: 0,
      characterCount: 0,
      lineCount: 0,
      issues: [
        {
          ruleId: 'filesystem/missing-skill-file',
          severity: 'error',
          message: `SKILL.md not found in ${contractPath(skillDir)}`,
        },
      ],
    };
  }

  const content = await fs.readFile(skillMd, 'utf-8');
  return lintSkillContent(content, skillName, skillMd);
}

export async function lintAllSkills(): Promise<LintSummary> {
  const skills = await getAllSkills();
  const results: SkillLintResult[] = [];

  for (const s of skills) {
    const res = await lintSkill(s.name);
    results.push(res);
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfos = 0;
  let passedSkills = 0;

  for (const r of results) {
    if (r.valid) passedSkills++;
    for (const issue of r.issues) {
      if (issue.severity === 'error') totalErrors++;
      if (issue.severity === 'warning') totalWarnings++;
      if (issue.severity === 'info') totalInfos++;
    }
  }

  return {
    totalSkills: skills.length,
    passedSkills,
    failedSkills: skills.length - passedSkills,
    totalErrors,
    totalWarnings,
    totalInfos,
    results,
  };
}

export function formatLintReport(summary: LintSummary): string {
  const lines: string[] = [];

  lines.push(pc.bold('\n🔍 SKILL NEXUS LINTER & SECURITY REPORT'));
  lines.push(pc.dim('───────────────────────────────────────────────────────'));

  if (summary.totalSkills === 0) {
    lines.push(pc.dim('No skills found in hub to lint.'));
    return lines.join('\n');
  }

  for (const res of summary.results) {
    const statusIcon = res.valid ? pc.green('✓ PASS') : pc.red('✗ FAIL');
    const tokenInfo = pc.dim(`~${res.tokenEstimate.toLocaleString()} tokens | ${res.lineCount} lines`);
    lines.push(`\n${statusIcon} ${pc.bold(res.skillName)} (${tokenInfo})`);
    lines.push(`  Path: ${pc.dim(contractPath(res.path))}`);

    if (res.issues.length === 0) {
      lines.push(pc.dim('  No issues detected. Security & syntax clean.'));
    } else {
      for (const issue of res.issues) {
        let tag = pc.blue('[INFO]');
        if (issue.severity === 'warning') tag = pc.yellow('[WARN]');
        if (issue.severity === 'error') tag = pc.red('[ERROR]');

        const loc = issue.line ? pc.dim(`:L${issue.line}`) : '';
        lines.push(`  ${tag} ${issue.message}${loc}`);
        if (issue.snippet) {
          lines.push(`    ${pc.dim('>')} ${pc.italic(issue.snippet)}`);
        }
        if (issue.recommendation) {
          lines.push(`    ${pc.cyan('💡 Recommendation:')} ${issue.recommendation}`);
        }
      }
    }
  }

  lines.push(pc.dim('\n───────────────────────────────────────────────────────'));
  const errorText = summary.totalErrors > 0 ? pc.red(`${summary.totalErrors} errors`) : pc.green('0 errors');
  const warnText = summary.totalWarnings > 0 ? pc.yellow(`${summary.totalWarnings} warnings`) : pc.dim('0 warnings');
  lines.push(
    `Summary: ${pc.bold(summary.passedSkills)} passed, ${pc.bold(summary.failedSkills)} failed (${errorText}, ${warnText})\n`
  );

  return lines.join('\n');
}
