export type IssueSeverity = 'error' | 'warning' | 'info';

export interface LintIssue {
  ruleId: string;
  severity: IssueSeverity;
  message: string;
  line?: number;
  snippet?: string;
  recommendation?: string;
}

export interface SkillLintResult {
  skillName: string;
  path: string;
  valid: boolean;
  tokenEstimate: number;
  characterCount: number;
  lineCount: number;
  issues: LintIssue[];
}

export interface LintSummary {
  totalSkills: number;
  passedSkills: number;
  failedSkills: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfos: number;
  results: SkillLintResult[];
}
