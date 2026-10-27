import * as p from '@clack/prompts';
import pc from 'picocolors';
import { loadAgents, saveAgents, syncAgent, setAgentSkills, addAgent, uninstallAgent } from '../agent-manager.js';
import {
  getAllSkills,
  createNewSkill,
  listLocalSkills,
  adoptSkill,
  migrateSkill,
} from '../skill-manager.js';
import { loadPresets, createPreset, applyPreset, deletePreset } from '../preset-manager.js';
import { discoverAllAgents, autoRegisterDiscoveredAgents } from '../discovery.js';
import { installRemoteSkill, updateRemoteSkills } from '../remote-manager.js';
import { lintAllSkills, formatLintReport } from '../linter/index.js';
import { exportSkills, type TargetFormat } from '../converter/index.js';
import {
  initProject,
  findProjectRoot,
  getProjectSkills,
  createProjectSkill,
  syncProject,
} from '../project/index.js';
import { expandPath, contractPath } from '../config.js';

export async function runInteractive(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' 🚀 SKILL NEXUS - Centralized AI Agent Skill Management (sn) ')));

  let keepRunning = true;
  while (keepRunning) {
    const action = await p.select({
      message: 'What would you like to do?',
      options: [
        { value: 'status', label: '📊 View Status & Skill Distribution' },
        { value: 'auto_detect', label: '🔍 Auto-Detect Agents on this Machine' },
        { value: 'manage_agents', label: '🤖 Configure Agent Skills' },
        { value: 'install_remote', label: '🌐 Install Skill from GitHub / Remote' },
        { value: 'update_remote', label: '⬆️  Update Installed Remote Skills' },
        { value: 'new_skill', label: '✨ Create New Skill (Local)' },
        { value: 'adopt_skill', label: '📥 Adopt Local Skill from Agent' },
        { value: 'lint', label: '🛡️  Run Security & Quality Linter' },
        { value: 'export_ide', label: '🔀 Export Skills to IDE (Cursor / Copilot / Windsurf)' },
        { value: 'project_menu', label: '🏢 Workspace / Project Skills (.skills)' },
        { value: 'sync_all', label: '🔄 Sync Skills to All Agents' },
        { value: 'presets', label: '📑 Manage Skill Presets' },
        { value: 'exit', label: '🚪 Exit' },
      ],
    });

    if (p.isCancel(action) || action === 'exit') {
      p.outro(pc.green('Goodbye!'));
      break;
    }

    switch (action) {
      case 'status':
        await handleStatus();
        break;
      case 'auto_detect':
        await handleAutoDetect();
        break;
      case 'manage_agents':
        await handleManageAgents();
        break;
      case 'install_remote':
        await handleInstallRemote();
        break;
      case 'update_remote':
        await handleUpdateRemote();
        break;
      case 'new_skill':
        await handleNewSkill();
        break;
      case 'adopt_skill':
        await handleAdopt();
        break;
      case 'lint':
        await handleLint();
        break;
      case 'export_ide':
        await handleExportIDE();
        break;
      case 'project_menu':
        await handleProjectMenu();
        break;
      case 'sync_all':
        await handleSyncAll();
        break;
      case 'presets':
        await handlePresets();
        break;
    }
  }
}

async function handleStatus(): Promise<void> {
  const agents = await loadAgents();
  const skills = await getAllSkills();

  p.log.info(pc.bold(`Skills in Hub (${skills.length}):`));
  if (skills.length === 0) {
    p.log.warn('  No skills found in hub yet.');
  } else {
    for (const sk of skills) {
      const typeStr = sk.isProjectLinked
        ? pc.magenta(`[linked -> ${sk.targetPath ? contractPath(sk.targetPath) : 'repo'}]`)
        : pc.cyan('[central]');
      p.log.message(`  • ${pc.bold(sk.name)} ${typeStr} - ${sk.description || 'No description'}`);
    }
  }

  p.log.info(pc.bold(`\nAgents Registered (${agents.length}):`));
  if (agents.length === 0) {
    p.log.warn('  No agents registered. Run auto-detect to find agents on your machine.');
  } else {
    for (const ag of agents) {
      const skillStr =
        ag.skills === 'all'
          ? pc.green('all skills')
          : pc.yellow(`${ag.skills.length} skills (${ag.skills.join(', ')})`);
      p.log.message(`  🤖 ${pc.bold(ag.name)}: ${skillStr}\n     Path: ${pc.dim(ag.path)}`);
    }
  }
}

async function handleAutoDetect(): Promise<void> {
  const s = p.spinner();
  s.start('Scanning system for AI agents (Claude, Antigravity, Cursor, Windsurf, Codex, Clawdbot)...');
  const discovered = await discoverAllAgents();
  s.stop(`Scan completed. Found ${discovered.length} agent target(s).`);

  if (discovered.length === 0) {
    p.log.warn('No active agents detected in standard locations.');
    return;
  }

  for (const ag of discovered) {
    const status = ag.exists ? pc.green('Active (folder exists)') : pc.yellow('App found, skills path ready');
    p.log.message(`• ${pc.bold(ag.name)} [${ag.type}]: ${status}\n  Path: ${pc.dim(ag.path)}`);
  }

  const shouldRegister = await p.confirm({
    message: 'Register these agents into skill-nexus configuration?',
    initialValue: true,
  });

  if (p.isCancel(shouldRegister) || !shouldRegister) return;

  const current = await loadAgents();
  const res = await autoRegisterDiscoveredAgents(current);
  await saveAgents(res.total);

  p.log.success(
    `Saved! Added ${res.added.length} new agent(s). Total configured: ${res.total.length}.`
  );
}

async function handleManageAgents(): Promise<void> {
  const agents = await loadAgents();
  const allSkills = await getAllSkills();

  if (agents.length === 0) {
    p.log.warn('No agents registered. Please auto-detect or add an agent first.');
    return;
  }

  const agentName = await p.select({
    message: 'Select an agent to configure:',
    options: agents.map((a) => ({
      value: a.name,
      label: `${a.name} (${Array.isArray(a.skills) ? `${a.skills.length} skills` : 'all'})`,
    })),
  });

  if (p.isCancel(agentName)) return;

  const agent = agents.find((a) => a.name === agentName)!;

  const mode = await p.select({
    message: `Configure skills for ${pc.cyan(agent.name)}:`,
    options: [
      { value: 'all', label: 'Give ALL skills (directory symlink)' },
      { value: 'select', label: 'Select specific skills...' },
      { value: 'sync', label: 'Sync now' },
      { value: 'uninstall', label: 'Detach / Uninstall from hub' },
    ],
  });

  if (p.isCancel(mode)) return;

  if (mode === 'all') {
    await setAgentSkills(agent.name, 'all');
    p.log.success(`Set ${agent.name} to receive all skills.`);
  } else if (mode === 'select') {
    if (allSkills.length === 0) {
      p.log.warn('No skills available to select.');
      return;
    }
    const initialValues = Array.isArray(agent.skills)
      ? agent.skills
      : allSkills.map((s) => s.name);

    const selected = await p.multiselect({
      message: 'Choose skills to enable for this agent:',
      options: allSkills.map((s) => ({
        value: s.name,
        label: s.name,
      })),
      initialValues,
      required: false,
    });

    if (p.isCancel(selected)) return;

    await setAgentSkills(agent.name, selected as string[]);
    p.log.success(`Updated ${agent.name} to ${(selected as string[]).length} skills.`);
  } else if (mode === 'sync') {
    const s = p.spinner();
    s.start(`Syncing ${agent.name}...`);
    const res = await syncAgent(agent, { force: true });
    s.stop(res.message);
  } else if (mode === 'uninstall') {
    const confirm = await p.confirm({
      message: `Convert ${agent.name}'s symlinks into local copies?`,
    });
    if (confirm && !p.isCancel(confirm)) {
      const res = await uninstallAgent(agent);
      p.log.success(res.message);
    }
  }
}

async function handleNewSkill(): Promise<void> {
  const name = await p.text({
    message: 'Skill name (e.g. "pdf-parser" or "data-cleaning"):',
    validate: (val) => {
      if (!val || !val.trim()) return 'Skill name cannot be empty.';
      if (!/^[a-zA-Z0-9_-]+$/.test(val.trim())) return 'Use alphanumeric, dashes, or underscores only.';
    },
  });

  if (p.isCancel(name) || !name) return;

  try {
    const createdFile = await createNewSkill(name.trim());
    p.log.success(`Skill created at ${pc.dim(contractPath(createdFile))}`);
  } catch (err: unknown) {
    p.log.error((err as Error).message);
  }
}

async function handleAdopt(): Promise<void> {
  const agents = await loadAgents();
  if (agents.length === 0) {
    p.log.warn('No agents registered.');
    return;
  }

  const agentName = await p.select({
    message: 'Select agent workspace to inspect for local skills:',
    options: agents.map((a) => ({ value: a.name, label: a.name })),
  });

  if (p.isCancel(agentName)) return;
  const agent = agents.find((a) => a.name === agentName)!;

  const localSkills = await listLocalSkills(agent.path);
  if (localSkills.length === 0) {
    p.log.info(`No unmanaged local skills found in ${agent.name}.`);
    return;
  }

  const skillToAdopt = await p.select({
    message: `Found ${localSkills.length} local skill(s). Select one to adopt:`,
    options: localSkills.map((s) => ({ value: s, label: s })),
  });

  if (p.isCancel(skillToAdopt)) return;

  const s = p.spinner();
  s.start(`Adopting ${skillToAdopt}...`);
  try {
    await adoptSkill(agent.path, skillToAdopt as string);
    s.stop(`Skill '${skillToAdopt}' adopted into central hub and symlinked back!`);
  } catch (err: unknown) {
    s.stop('Failed to adopt skill');
    p.log.error((err as Error).message);
  }
}

async function handleSyncAll(): Promise<void> {
  const agents = await loadAgents();
  if (agents.length === 0) {
    p.log.warn('No agents configured to sync.');
    return;
  }

  const s = p.spinner();
  s.start('Syncing skills to all agents...');
  for (const ag of agents) {
    await syncAgent(ag, { force: true });
  }
  s.stop(`Synced skills to ${agents.length} agent(s) successfully!`);
}

async function handlePresets(): Promise<void> {
  const presets = await loadPresets();
  const allSkills = await getAllSkills();

  const action = await p.select({
    message: 'Preset options:',
    options: [
      { value: 'list', label: `List Presets (${presets.length})` },
      { value: 'create', label: 'Create New Preset' },
      { value: 'apply', label: 'Apply Preset to an Agent' },
      { value: 'delete', label: 'Delete a Preset' },
    ],
  });

  if (p.isCancel(action)) return;

  if (action === 'list') {
    if (presets.length === 0) {
      p.log.info('No presets created yet.');
    } else {
      for (const pr of presets) {
        p.log.message(`• ${pc.bold(pr.name)}: ${pr.skills.join(', ')}`);
      }
    }
  } else if (action === 'create') {
    const name = await p.text({ message: 'Preset name:' });
    if (p.isCancel(name) || !name) return;

    const selected = await p.multiselect({
      message: 'Select skills to include in preset:',
      options: allSkills.map((s) => ({ value: s.name, label: s.name })),
      required: true,
    });
    if (p.isCancel(selected)) return;

    await createPreset(name.trim(), selected as string[]);
    p.log.success(`Preset '${name}' saved.`);
  } else if (action === 'apply') {
    if (presets.length === 0) {
      p.log.warn('No presets available.');
      return;
    }
    const agents = await loadAgents();
    const presetName = await p.select({
      message: 'Choose preset:',
      options: presets.map((pr) => ({ value: pr.name, label: pr.name })),
    });
    if (p.isCancel(presetName)) return;

    const agentName = await p.select({
      message: 'Choose agent to apply to:',
      options: agents.map((ag) => ({ value: ag.name, label: ag.name })),
    });
    if (p.isCancel(agentName)) return;

    await applyPreset(agentName as string, presetName as string);
    p.log.success(`Applied preset '${presetName}' to ${agentName}.`);
  } else if (action === 'delete') {
    if (presets.length === 0) return;
    const presetName = await p.select({
      message: 'Select preset to delete:',
      options: presets.map((pr) => ({ value: pr.name, label: pr.name })),
    });
    if (p.isCancel(presetName)) return;

    await deletePreset(presetName as string);
    p.log.success(`Deleted preset '${presetName}'.`);
  }
}

async function handleInstallRemote(): Promise<void> {
  const source = await p.text({
    message: 'Enter GitHub repo or URL (e.g. "owner/repo" or "owner/repo/tree/main/skill"):',
    validate: (val) => {
      if (!val || !val.trim()) return 'Source cannot be empty.';
    },
  });

  if (p.isCancel(source) || !source) return;

  const customName = await p.text({
    message: 'Custom skill name (optional, press Enter to use default):',
  });

  if (p.isCancel(customName)) return;

  const s = p.spinner();
  s.start(`Cloning and installing from ${source.trim()}...`);
  try {
    const res = await installRemoteSkill(
      source.trim(),
      customName && customName.trim() ? customName.trim() : undefined
    );
    s.stop(`Installed ${res.installedSkills.length} skill(s): ${res.installedSkills.join(', ')}`);

    const shouldSync = await p.confirm({
      message: 'Sync skills to configured agents now?',
      initialValue: true,
    });
    if (shouldSync && !p.isCancel(shouldSync)) {
      await handleSyncAll();
    }
  } catch (err: unknown) {
    s.stop('Installation failed');
    p.log.error((err as Error).message);
  }
}

async function handleUpdateRemote(): Promise<void> {
  const s = p.spinner();
  s.start('Checking for updates from remote repositories...');
  try {
    const results = await updateRemoteSkills();
    s.stop(`Checked ${results.length} remote skill(s).`);

    if (results.length === 0) {
      p.log.info('No remote-installed skills found.');
      return;
    }

    let hasUpdates = false;
    for (const r of results) {
      if (r.updated) {
        hasUpdates = true;
        p.log.success(`• ${pc.bold(r.skill)}: ${r.message}`);
      } else {
        p.log.message(`• ${pc.bold(r.skill)}: ${pc.dim(r.message)}`);
      }
    }

    if (hasUpdates) {
      const shouldSync = await p.confirm({
        message: 'Some skills were updated. Sync to agents now?',
        initialValue: true,
      });
      if (shouldSync && !p.isCancel(shouldSync)) {
        await handleSyncAll();
      }
    }
  } catch (err: unknown) {
    s.stop('Update check failed');
    p.log.error((err as Error).message);
  }
}

async function handleLint(): Promise<void> {
  const s = p.spinner();
  s.start('Running security & quality audit across all skills...');
  try {
    const summary = await lintAllSkills();
    s.stop(`Audit complete. ${summary.passedSkills}/${summary.totalSkills} skill(s) passed.`);

    console.log(formatLintReport(summary));
  } catch (err: unknown) {
    s.stop('Audit failed');
    p.log.error((err as Error).message);
  }
}

async function handleExportIDE(): Promise<void> {
  const format = await p.select({
    message: 'Select target IDE / Agent format:',
    options: [
      { value: 'cursor', label: 'Cursor Rules (.cursor/rules/*.mdc)' },
      { value: 'copilot', label: 'GitHub Copilot (.github/copilot-instructions.md)' },
      { value: 'windsurf', label: 'Windsurf Cascade (.windsurfrules)' },
    ],
  });

  if (p.isCancel(format)) return;

  const targetDir = await p.text({
    message: 'Destination directory path (leave blank for current workspace):',
    initialValue: '.',
  });

  if (p.isCancel(targetDir)) return;

  const s = p.spinner();
  s.start(`Compiling skills to ${format} format...`);
  try {
    const res = await exportSkills(format as TargetFormat, targetDir.trim() || '.');
    s.stop(`Exported ${res.filesWritten.length} file(s) for ${format}!`);
    for (const f of res.filesWritten) {
      p.log.message(`  • ${pc.cyan(contractPath(f))}`);
    }
  } catch (err: unknown) {
    s.stop('Export failed');
    p.log.error((err as Error).message);
  }
}

async function handleProjectMenu(): Promise<void> {
  const root = await findProjectRoot();

  const options = [];
  if (!root) {
    options.push({ value: 'init', label: '🚀 Initialize .skills in this Project' });
  } else {
    options.push(
      { value: 'list', label: '📋 List Project Skills' },
      { value: 'new', label: '✨ Create New Project Skill' },
      { value: 'sync', label: '🔄 Sync Project Skills to IDE Rules & Agents' }
    );
  }

  const action = await p.select({
    message: `Project Skills (${root ? pc.cyan(contractPath(root)) : 'No project initialized'}):`,
    options,
  });

  if (p.isCancel(action)) return;

  if (action === 'init') {
    const s = p.spinner();
    s.start('Initializing project skills...');
    try {
      const res = await initProject(process.cwd());
      s.stop(`Initialized project skills at ${contractPath(res.projectRoot)}`);
    } catch (err: unknown) {
      s.stop('Init failed');
      p.log.error((err as Error).message);
    }
  } else if (action === 'list') {
    if (!root) return;
    const skills = await getProjectSkills(root);
    p.log.info(pc.bold(`Project Skills (${skills.length}):`));
    for (const sk of skills) {
      p.log.message(`  • ${pc.bold(sk.name)}${sk.description ? ` - ${sk.description}` : ''}`);
    }
  } else if (action === 'new') {
    if (!root) return;
    const name = await p.text({
      message: 'Project skill name (e.g. "api-conventions"):',
      validate: (v) => (!v || !v.trim() ? 'Name required' : undefined),
    });
    if (p.isCancel(name) || !name) return;

    try {
      const filePath = await createProjectSkill(root, name.trim());
      p.log.success(`Created project skill at ${contractPath(filePath)}`);
    } catch (err: unknown) {
      p.log.error((err as Error).message);
    }
  } else if (action === 'sync') {
    if (!root) return;
    const s = p.spinner();
    s.start('Syncing project skills...');
    try {
      const res = await syncProject(root);
      s.stop(`Synced ${res.skillsFound} project skill(s)!`);
      if (res.exportedFormats.length > 0) {
        p.log.message(`  Exported IDE rules: ${res.exportedFormats.join(', ')}`);
      }
      if (res.linkedAgents.length > 0) {
        p.log.message(`  Linked agents: ${res.linkedAgents.join(', ')}`);
      }
    } catch (err: unknown) {
      s.stop('Sync failed');
      p.log.error((err as Error).message);
    }
  }
}
