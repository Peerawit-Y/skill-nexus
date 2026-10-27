export type SkillAssignment = 'all' | string[];

export interface Agent {
  name: string;
  path: string;
  skills: SkillAssignment;
}

export interface Skill {
  name: string;
  isProjectLinked: boolean;
  path: string;
  targetPath?: string;
  description?: string;
  metadata?: SkillMetadata;
}

export interface SkillMetadata {
  requires?: {
    bins?: string[];
    env?: string[];
  };
  clawdbot?: {
    requires?: {
      bins?: string[];
      env?: string[];
    };
  };
  [key: string]: unknown;
}

export interface SkillOrigin {
  source: string;
  url: string;
  branch?: string;
  subpath?: string;
  installedAt: string;
  type: 'git-repo' | 'subfolder';
}

export interface Preset {
  name: string;
  skills: string[];
}

export interface DiscoveredAgent {
  id: string;
  name: string;
  type: string;
  path: string;
  exists: boolean;
  description: string;
}
