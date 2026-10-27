export type TargetFormat = 'cursor' | 'copilot' | 'windsurf' | 'claude';

export interface ConvertOptions {
  globs?: string;
  alwaysApply?: boolean;
  sourceSkillsDir?: string;
}

export interface ConvertedFile {
  filename: string;
  relativePath: string;
  content: string;
  format: TargetFormat;
}

export interface ExportResult {
  format: TargetFormat;
  targetDir: string;
  filesWritten: string[];
}
