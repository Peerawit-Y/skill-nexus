import type { TargetFormat } from '../converter/types.js';

export interface ProjectConfig {
  name: string;
  skillsDir: string;
  autoExport?: TargetFormat[];
  linkToGlobal?: boolean;
}

export interface ProjectSkill {
  name: string;
  path: string;
  description?: string;
  isProjectLinked?: boolean;
}

export interface ProjectSyncResult {
  projectRoot: string;
  skillsFound: number;
  linkedAgents: string[];
  exportedFormats: TargetFormat[];
  globalLinked: boolean;
}
