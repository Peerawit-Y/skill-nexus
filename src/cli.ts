import { Command } from 'commander';
import path from 'node:path';
import fs from 'fs-extra';
import pc from 'picocolors';
import { getPaths, getDataDir, getSetting, setSetting, contractPath, expandPath } from './config.js';
import {
  getAllSkills,
  createNewSkill,
  linkProjectSkill,
  migrateSkill,
  listLocalSkills,
  adoptSkill,
  checkDependencies,
} from './skill-manager.js';
import {
  loadAgents,
  saveAgents,
  addAgent,
  setAgentSkills,
  enableSkill,
  disableSkill,
  copyAgent,
  resetAgent,
  moveSkill,
  syncAgent,
  uninstallAgent,
} from './agent-manager.js';
import {
  loadPresets,
  createPreset,
  getPreset,
  applyPreset,
  deletePreset,
} from './preset-manager.js';
import {
  installRemoteSkill,
  updateRemoteSkills,
  loadOrigins,
} from './remote-manager.js';
import { lintSkill, lintAllSkills, formatLintReport } from './linter/index.js';
import { exportSkills, type TargetFormat } from './converter/index.js';
import {
  initProject,
  findProjectRoot,
  getProjectSkills,
  createProjectSkill,
  syncProject,
} from './project/index.js';
import { discoverAllAgents, autoRegisterDiscoveredAgents } from './discovery.js';
import { runInteractive } from './tui/interactive.js';

const program = new Command();

program
  .name('skill-nexus')
  .description('Centralized skill management and auto-discovery for AI agents (alias: sn)')
  .version('1.1.0')
  .action(async () => {
    // If no command provided, run interactive mode
    await runInteractive();
  });

program
  .command('init')
  .description('Initialize ~/.skill-nexus/ data directory and auto-discover agents')
  .action(async () => {
    const { dataDir, skillsDir, agentsFile, presetsFile, settingsFile } = getPaths();
    await fs.ensureDir(dataDir);
    await fs.ensureDir(skillsDir);

    if (!(await fs.pathExists(agentsFile))) {
      await fs.writeFile(agentsFile, '# Format: name:path:skills\n', 'utf-8');
    }
    if (!(await fs.pathExists(presetsFile))) {
      await fs.writeFile(presetsFile, '# Saved presets\n', 'utf-8');
    }
    if (!(await fs.pathExists(settingsFile))) {
      await fs.writeFile(settingsFile, '# Settings\nproject_dir=~/p\ngit_init=false\n', 'utf-8');
    }

    console.log(pc.green(`✓ Initialized data directory at ${dataDir}`));

    // Auto-detect agents
    const existing = await loadAgents();
    const res = await autoRegisterDiscoveredAgents(existing);
    if (res.added.length > 0) {
      await saveAgents(res.total);
      console.log(pc.cyan(`✓ Auto-detected and registered ${res.added.length} agent(s):`));
      for (const a of res.added) {
        console.log(`  - ${a.name} (${a.path})`);
      }
    } else {
      console.log(pc.dim('No new agents detected automatically.'));
    }

    console.log(`\nNext steps:`);
    console.log(`  skill-nexus new my-first-skill  # Create a skill`);
    console.log(`  skill-nexus sync                # Sync skills to agents`);
    console.log(`  skill-nexus                     # Launch interactive menu (or run 'sn')`);
  });

program
  .command('i')
  .alias('interactive')
  .description('Launch interactive menu')
  .action(async () => {
    await runInteractive();
  });

program
  .command('status')
  .description('Show current skill distribution status')
  .action(async () => {
    const skills = await getAllSkills();
    const agents = await loadAgents();

    console.log(pc.bold(`\nSkills in Hub (${skills.length}):`));
    for (const sk of skills) {
      const typeStr = sk.isProjectLinked
        ? pc.magenta(`[linked -> ${sk.targetPath ? contractPath(sk.targetPath) : 'repo'}]`)
        : pc.cyan('[central]');
      console.log(`  • ${pc.bold(sk.name)} ${typeStr}${sk.description ? ` - ${sk.description}` : ''}`);
    }

    console.log(pc.bold(`\nAgents (${agents.length}):`));
    for (const ag of agents) {
      const skillStr =
        ag.skills === 'all'
          ? pc.green('all')
          : pc.yellow(`${ag.skills.length} (${ag.skills.join(', ')})`);
      console.log(`  🤖 ${pc.bold(ag.name)}: ${skillStr}`);
      console.log(`     Path: ${pc.dim(ag.path)}`);
    }
    console.log('');
  });

program
  .command('list')
  .description('List all skills')
  .action(async () => {
    const skills = await getAllSkills();
    for (const sk of skills) {
      const tag = sk.isProjectLinked ? pc.magenta('(project)') : pc.cyan('(central)');
      console.log(`${sk.name} ${tag}`);
    }
  });

program
  .command('info <skill>')
  .description('Show detailed info about a skill')
  .action(async (skillName: string) => {
    const skills = await getAllSkills();
    const sk = skills.find((s) => s.name === skillName);
    if (!sk) {
      console.error(pc.red(`Skill '${skillName}' not found.`));
      process.exit(1);
    }

    console.log(pc.bold(`Skill: ${sk.name}`));
    console.log(`Type: ${sk.isProjectLinked ? 'Project-linked' : 'Central'}`);
    console.log(`Path: ${contractPath(sk.path)}`);
    if (sk.targetPath) {
      console.log(`Target: ${contractPath(sk.targetPath)}`);
    }
    if (sk.description) {
      console.log(`Description: ${sk.description}`);
    }
    if (sk.metadata) {
      console.log(`Metadata: ${JSON.stringify(sk.metadata, null, 2)}`);
    }
  });

program
  .command('new <name>')
  .description('Create a new skill from template')
  .option('-t, --template <type>', 'Template type: standard, code-review, workflow-automation, api-integration', 'standard')
  .action(async (name: string, opts?: { template?: string }) => {
    try {
      let tpl = opts?.template || 'skill-template';
      if (tpl === 'standard') tpl = 'skill-template';
      const filePath = await createNewSkill(name, tpl);
      console.log(pc.green(`✓ Created new skill '${name}' (template: ${opts?.template || 'standard'}) at ${contractPath(filePath)}`));
    } catch (err: unknown) {
      console.error(pc.red((err as Error).message));
      process.exit(1);
    }
  });

program
  .command('install <source> [name]')
  .description('Install skill from GitHub repository (e.g. "owner/repo" or Git URL)')
  .option('-s, --sync', 'Automatically sync to agents after installation')
  .action(async (source: string, customName?: string, opts?: { sync?: boolean }) => {
    console.log(pc.cyan(`Installing skill from ${source}...`));
    try {
      const res = await installRemoteSkill(source, customName);
      console.log(
        pc.green(`✓ Successfully installed ${res.installedSkills.length} skill(s): ${res.installedSkills.join(', ')}`)
      );

      if (opts?.sync) {
        console.log(pc.dim('Syncing to agents...'));
        const agents = await loadAgents();
        for (const ag of agents) {
          await syncAgent(ag, { force: true });
        }
        console.log(pc.green('✓ Agents updated.'));
      } else {
        console.log(pc.dim("Run 'skill-nexus sync' to distribute to configured agents."));
      }
    } catch (err: unknown) {
      console.error(pc.red(`Installation failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });

program
  .command('update [skill]')
  .description('Update installed remote skills from their upstream git repositories')
  .option('-s, --sync', 'Automatically sync to agents after update')
  .action(async (skillName?: string, opts?: { sync?: boolean }) => {
    console.log(pc.cyan(skillName ? `Checking updates for '${skillName}'...` : 'Checking updates for all remote skills...'));
    const results = await updateRemoteSkills(skillName);

    if (results.length === 0) {
      console.log(pc.dim('No remote skills found to update.'));
      return;
    }

    let hasChanges = false;
    for (const r of results) {
      const symbol = r.updated ? pc.green('✓') : pc.dim('•');
      console.log(`  ${symbol} ${pc.bold(r.skill)}: ${r.message}`);
      if (r.updated) hasChanges = true;
    }

    if (hasChanges && opts?.sync) {
      const agents = await loadAgents();
      for (const ag of agents) {
        await syncAgent(ag, { force: true });
      }
      console.log(pc.green('✓ Agents resynced.'));
    }
  });

program
  .command('discover')
  .description('Scan system and auto-discover AI agents')
  .option('-u, --update', 'Update agents.conf automatically with discovered agents')
  .action(async (opts) => {
    console.log(pc.cyan('Scanning for active agents on system...'));
    const discovered = await discoverAllAgents();
    console.log(pc.bold(`\nFound ${discovered.length} agent target(s):`));

    for (const d of discovered) {
      const status = d.exists ? pc.green('Active (folder exists)') : pc.yellow('App found');
      console.log(`  • ${pc.bold(d.name)} [${d.type}]: ${status}`);
      console.log(`    Path: ${pc.dim(d.path)}`);
      console.log(`    Info: ${pc.dim(d.description)}`);
    }

    if (opts.update) {
      const existing = await loadAgents();
      const res = await autoRegisterDiscoveredAgents(existing);
      await saveAgents(res.total);
      console.log(pc.green(`\n✓ Updated agents.conf. Added ${res.added.length} agent(s).`));
    } else {
      console.log(pc.dim('\nRun with --update to add these to agents.conf automatically.'));
    }
  });

program
  .command('sync [agent]')
  .description('Apply config to filesystem (create/update symlinks)')
  .option('-f, --force', 'Force sync even if local unmanaged skills exist')
  .action(async (agentFilter?: string, opts?: { force?: boolean }) => {
    const agents = await loadAgents();
    const targets = agentFilter ? agents.filter((a) => a.name === agentFilter) : agents;

    if (targets.length === 0) {
      console.error(pc.red(agentFilter ? `Agent '${agentFilter}' not found.` : 'No agents to sync.'));
      process.exit(1);
    }

    for (const ag of targets) {
      const res = await syncAgent(ag, { force: opts?.force });
      if (res.success) {
        console.log(pc.green(`✓ ${ag.name}: ${res.message}`));
      } else {
        console.log(pc.yellow(`! ${ag.name}: ${res.message}`));
      }
      if (res.warnings) {
        for (const w of res.warnings) {
          console.log(pc.yellow(`  Warning: ${w}`));
        }
      }
    }
  });

program
  .command('uninstall [agent]')
  .description('Detach agents from the hub (replaces symlinks with local copies)')
  .action(async (agentFilter?: string) => {
    const agents = await loadAgents();
    const targets = agentFilter ? agents.filter((a) => a.name === agentFilter) : agents;

    for (const ag of targets) {
      const res = await uninstallAgent(ag);
      console.log(pc.green(`✓ ${ag.name}: ${res.message}`));
    }
  });

program
  .command('set <agent> <skills>')
  .description('Set skills for an agent ("all" or comma-separated list)')
  .action(async (agentName: string, skillsStr: string) => {
    const skills = skillsStr === 'all' ? 'all' : skillsStr.split(',').map((s) => s.trim());
    await setAgentSkills(agentName, skills);
    console.log(pc.green(`✓ Updated skills for ${agentName}`));
  });

program
  .command('enable <agent> <skill>')
  .description('Add a skill to an agent')
  .action(async (agentName: string, skill: string) => {
    await enableSkill(agentName, skill);
    console.log(pc.green(`✓ Enabled '${skill}' for ${agentName}`));
  });

program
  .command('disable <agent> <skill>')
  .description('Remove a skill from an agent')
  .action(async (agentName: string, skill: string) => {
    await disableSkill(agentName, skill);
    console.log(pc.green(`✓ Disabled '${skill}' for ${agentName}`));
  });

program
  .command('copy <from> <to>')
  .description('Copy skills from one agent to another')
  .action(async (from: string, to: string) => {
    await copyAgent(from, to);
    console.log(pc.green(`✓ Copied skills from ${from} to ${to}`));
  });

program
  .command('reset <agent>')
  .description('Reset agent to all skills')
  .action(async (agentName: string) => {
    await resetAgent(agentName);
    console.log(pc.green(`✓ Reset ${agentName} to all skills`));
  });

program
  .command('move-skill <skill> <from> <to>')
  .description('Move a skill between agents')
  .action(async (skill: string, from: string, to: string) => {
    await moveSkill(skill, from, to);
    console.log(pc.green(`✓ Moved '${skill}' from ${from} to ${to}`));
  });

program
  .command('add-agent <name> <path> [skills]')
  .description('Add agent target (skills: "all" or comma-separated)')
  .action(async (name: string, targetPath: string, skillsStr?: string) => {
    const skills = !skillsStr || skillsStr === 'all' ? 'all' : skillsStr.split(',').map((s) => s.trim());
    await addAgent(name, targetPath, skills);
    console.log(pc.green(`✓ Added agent '${name}' -> ${targetPath}`));
  });

program
  .command('link-project <skill> <project-path>')
  .description('Link a skill to a project repo')
  .action(async (skill: string, projectPath: string) => {
    await linkProjectSkill(skill, projectPath);
    console.log(pc.green(`✓ Linked skill '${skill}' to ${projectPath}`));
  });

program
  .command('migrate <skill> [path]')
  .description('Move skill to its own project repo')
  .action(async (skill: string, destPath?: string) => {
    const res = await migrateSkill(skill, destPath);
    console.log(pc.green(`✓ Migrated '${skill}' to ${contractPath(res.projectPath)}`));
    console.log(pc.dim(`  Symlinked back to ${contractPath(res.symlinkPath)}`));
  });

program
  .command('local <agent>')
  .description('List local (non-symlinked) skills in agent workspace')
  .action(async (agentName: string) => {
    const agents = await loadAgents();
    const ag = agents.find((a) => a.name === agentName);
    if (!ag) {
      console.error(pc.red(`Agent '${agentName}' not found.`));
      process.exit(1);
    }
    const locals = await listLocalSkills(ag.path);
    if (locals.length === 0) {
      console.log(pc.dim(`No local unmanaged skills found in ${agentName}.`));
    } else {
      console.log(pc.bold(`Local unmanaged skills in ${agentName}:`));
      for (const loc of locals) {
        console.log(`  • ${loc}`);
      }
      console.log(pc.dim(`Run 'skill-nexus adopt ${agentName} <skill>' to import them.`));
    }
  });

program
  .command('adopt <agent> <skill>')
  .description('Import a skill from agent workspace into skill-nexus')
  .action(async (agentName: string, skill: string) => {
    const agents = await loadAgents();
    const ag = agents.find((a) => a.name === agentName);
    if (!ag) {
      console.error(pc.red(`Agent '${agentName}' not found.`));
      process.exit(1);
    }
    const res = await adoptSkill(ag.path, skill);
    console.log(pc.green(`✓ Adopted '${skill}' into hub at ${contractPath(res.hubPath)}`));
    console.log(pc.dim(`  Symlinked back to ${contractPath(res.agentSkillPath)}`));
  });

program
  .command('preset')
  .description('Manage skill presets')
  .argument('<action>', 'create | list | show | apply | delete')
  .argument('[arg1]', 'name (for create, show, delete) or agent (for apply)')
  .argument('[arg2]', 'skills (for create) or preset name (for apply)')
  .action(async (action: string, arg1?: string, arg2?: string) => {
    if (action === 'list') {
      const presets = await loadPresets();
      for (const p of presets) {
        console.log(`${pc.bold(p.name)}: ${p.skills.join(', ')}`);
      }
    } else if (action === 'create') {
      if (!arg1 || !arg2) {
        console.error(pc.red('Usage: skill-nexus preset create <name> <skill1,skill2>'));
        process.exit(1);
      }
      const skills = arg2.split(',').map((s) => s.trim());
      await createPreset(arg1, skills);
      console.log(pc.green(`✓ Preset '${arg1}' created.`));
    } else if (action === 'show') {
      if (!arg1) {
        console.error(pc.red('Usage: skill-nexus preset show <name>'));
        process.exit(1);
      }
      const preset = await getPreset(arg1);
      if (!preset) {
        console.error(pc.red(`Preset '${arg1}' not found.`));
        process.exit(1);
      }
      console.log(`${pc.bold(preset.name)}: ${preset.skills.join(', ')}`);
    } else if (action === 'apply') {
      if (!arg1 || !arg2) {
        console.error(pc.red('Usage: skill-nexus preset apply <agent> <preset>'));
        process.exit(1);
      }
      await applyPreset(arg1, arg2);
      console.log(pc.green(`✓ Applied preset '${arg2}' to agent '${arg1}'`));
    } else if (action === 'delete') {
      if (!arg1) {
        console.error(pc.red('Usage: skill-nexus preset delete <name>'));
        process.exit(1);
      }
      await deletePreset(arg1);
      console.log(pc.green(`✓ Deleted preset '${arg1}'`));
    } else {
      console.error(pc.red(`Unknown preset action: ${action}`));
    }
  });

program
  .command('deps')
  .description('Check dependencies required by skills')
  .action(async () => {
    const deps = await checkDependencies();
    if (deps.length === 0) {
      console.log(pc.dim('No special tool/env dependencies declared in skills.'));
      return;
    }

    for (const d of deps) {
      console.log(pc.bold(`Skill: ${d.skill}`));
      for (const b of d.bins) {
        const status = b.found ? pc.green('✓ installed') : pc.red('✗ missing');
        console.log(`  Binary ${b.name}: ${status}`);
      }
      for (const e of d.env) {
        const status = e.found ? pc.green('✓ set') : pc.yellow('✗ not set');
        console.log(`  Env ${e.name}: ${status}`);
      }
    }
  });

program
  .command('lint [skill]')
  .description('Audit skill(s) for security leaks, dangerous commands, syntax and token bloat')
  .option('--strict', 'Fail with exit code 1 on warnings as well as errors')
  .action(async (skillName?: string, opts?: { strict?: boolean }) => {
    let summary;
    if (skillName) {
      const single = await lintSkill(skillName);
      summary = {
        totalSkills: 1,
        passedSkills: single.valid ? 1 : 0,
        failedSkills: single.valid ? 0 : 1,
        totalErrors: single.issues.filter((i) => i.severity === 'error').length,
        totalWarnings: single.issues.filter((i) => i.severity === 'warning').length,
        totalInfos: single.issues.filter((i) => i.severity === 'info').length,
        results: [single],
      };
    } else {
      summary = await lintAllSkills();
    }

    console.log(formatLintReport(summary));

    const shouldFail = summary.totalErrors > 0 || (opts?.strict && summary.totalWarnings > 0);
    if (shouldFail) {
      process.exit(1);
    }
  });

program
  .command('export [skill]')
  .description('Export/compile skills into IDE native rule formats (cursor, copilot, windsurf)')
  .requiredOption('-f, --format <format>', 'Target format: "cursor" (.mdc), "copilot" (.github), "windsurf"')
  .option('-o, --out <dir>', 'Output directory (default: current directory)')
  .option('-g, --globs <pattern>', 'Glob pattern for Cursor .mdc rules (default: "*")')
  .action(async (skillName?: string, opts?: { format: string; out?: string; globs?: string }) => {
    const fmt = opts?.format?.toLowerCase() as TargetFormat;
    if (!['cursor', 'copilot', 'windsurf'].includes(fmt)) {
      console.error(pc.red(`Invalid format "${opts?.format}". Expected "cursor", "copilot", or "windsurf".`));
      process.exit(1);
    }

    try {
      const skillsFilter = skillName ? [skillName] : undefined;
      const res = await exportSkills(fmt, opts?.out, skillsFilter, { globs: opts?.globs });

      console.log(pc.green(`✓ Exported ${res.filesWritten.length} file(s) for ${res.format} at ${res.targetDir}:`));
      for (const f of res.filesWritten) {
        console.log(`  - ${contractPath(f)}`);
      }
    } catch (err: unknown) {
      console.error(pc.red(`Export failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });

const projectCmd = program.command('project').description('Manage workspace/project-scoped skills (.skills)');

projectCmd
  .command('init [dir]')
  .description('Initialize .skills/ directory and .skill-nexus.json in project')
  .option('-n, --name <name>', 'Project name override')
  .action(async (targetDir?: string, opts?: { name?: string }) => {
    try {
      const res = await initProject(targetDir || process.cwd(), { name: opts?.name });
      console.log(pc.green(`✓ Initialized project skills at ${contractPath(res.projectRoot)}`));
      console.log(`  Config: ${contractPath(res.configPath)}`);
      console.log(pc.dim(`  Run 'skill-nexus project new <name>' to create project-specific skills.`));
    } catch (err: unknown) {
      console.error(pc.red(`Project init failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });

projectCmd
  .command('list')
  .alias('ls')
  .description('List skills defined in current project workspace')
  .action(async () => {
    const root = await findProjectRoot();
    if (!root) {
      console.error(pc.red('No project root found (no .skills or .skill-nexus.json). Run "skill-nexus project init" first.'));
      process.exit(1);
    }
    const skills = await getProjectSkills(root);
    console.log(pc.bold(`\nProject Skills in ${contractPath(root)} (${skills.length}):`));
    for (const sk of skills) {
      console.log(`  • ${pc.bold(sk.name)}${sk.description ? ` - ${sk.description}` : ''}`);
    }
    console.log('');
  });

projectCmd
  .command('new <name>')
  .description('Create a new skill inside project .skills/ directory')
  .option('-t, --template <type>', 'Template type: standard, code-review, workflow-automation, api-integration', 'standard')
  .action(async (skillName: string, opts?: { template?: string }) => {
    const root = await findProjectRoot();
    if (!root) {
      console.error(pc.red('No project root found. Run "skill-nexus project init" first.'));
      process.exit(1);
    }
    try {
      let tpl = opts?.template || 'skill-template';
      if (tpl === 'standard') tpl = 'skill-template';
      const filePath = await createProjectSkill(root, skillName, tpl);
      console.log(pc.green(`✓ Created project skill '${skillName}' (template: ${opts?.template || 'standard'}) at ${contractPath(filePath)}`));
    } catch (err: unknown) {
      console.error(pc.red((err as Error).message));
      process.exit(1);
    }
  });

projectCmd
  .command('sync')
  .description('Sync project skills to IDE rules (Cursor, Copilot, Windsurf) and project-level agents')
  .option('-g, --global', 'Also link project skills to global hub (~/.skill-nexus/skills)')
  .action(async (opts?: { global?: boolean }) => {
    const root = await findProjectRoot();
    if (!root) {
      console.error(pc.red('No project root found. Run "skill-nexus project init" first.'));
      process.exit(1);
    }
    try {
      const res = await syncProject(root, { linkGlobal: opts?.global });
      console.log(pc.green(`✓ Synced ${res.skillsFound} project skill(s) for ${contractPath(res.projectRoot)}:`));
      if (res.exportedFormats.length > 0) {
        console.log(`  - Exported IDE rules: ${res.exportedFormats.join(', ')}`);
      }
      if (res.linkedAgents.length > 0) {
        console.log(`  - Linked agents: ${res.linkedAgents.join(', ')}`);
      }
      if (res.globalLinked) {
        console.log(pc.cyan(`  - Linked to global skill-nexus hub`));
      }
    } catch (err: unknown) {
      console.error(pc.red(`Project sync failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });

program
  .command('config [key] [value]')
  .description('Get or set configuration')
  .action(async (key?: string, value?: string) => {
    if (!key) {
      const pDir = await getSetting('project_dir', '~/p');
      const gInit = await getSetting('git_init', 'false');
      console.log(`project_dir=${pDir}`);
      console.log(`git_init=${gInit}`);
    } else if (value === undefined) {
      const v = await getSetting(key);
      console.log(v);
    } else {
      await setSetting(key, value);
      console.log(pc.green(`✓ Set ${key}=${value}`));
    }
  });

program
  .command('path')
  .description('Print data directory path')
  .action(() => {
    console.log(getDataDir());
  });

program.parseAsync(process.argv);
