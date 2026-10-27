import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import {
  initProject,
  getProjectSkills,
  createProjectSkill,
  syncProject,
  loadProjectConfig,
} from '../dist/index.js';

describe('Workspace / Project Scoping', () => {
  const testProjectDir = path.join(os.tmpdir(), `skill-nexus-test-project-${Date.now()}`);

  afterEach(async () => {
    await fs.remove(testProjectDir);
  });

  test('initializes project with .skills and config', async () => {
    const res = await initProject(testProjectDir, { name: 'demo-app' });
    assert.equal(res.projectRoot, testProjectDir);
    assert.equal(await fs.pathExists(path.join(testProjectDir, '.skill-nexus.json')), true);
    assert.equal(await fs.pathExists(path.join(testProjectDir, '.skills')), true);

    const config = await loadProjectConfig(testProjectDir);
    assert.equal(config?.name, 'demo-app');

    const skills = await getProjectSkills(testProjectDir);
    assert.equal(skills.length, 1);
    assert.equal(skills[0].name, 'project-guidelines');
  });

  test('creates new project skill inside .skills', async () => {
    await initProject(testProjectDir, { name: 'demo-app' });
    const createdFile = await createProjectSkill(testProjectDir, 'db-migration');
    assert.equal(await fs.pathExists(createdFile), true);

    const skills = await getProjectSkills(testProjectDir);
    assert.equal(skills.length, 2);
    const names = skills.map((s) => s.name);
    assert(names.includes('db-migration'));
  });

  test('syncs project skills into IDE native formats', async () => {
    await initProject(testProjectDir, { name: 'demo-app', autoExport: ['cursor', 'copilot'] });
    const syncRes = await syncProject(testProjectDir);

    assert.equal(syncRes.skillsFound, 1);
    assert(syncRes.exportedFormats.includes('cursor'));
    assert(syncRes.exportedFormats.includes('copilot'));

    // Check files created
    assert.equal(
      await fs.pathExists(path.join(testProjectDir, '.cursor', 'rules', 'project-guidelines.mdc')),
      true
    );
    assert.equal(
      await fs.pathExists(path.join(testProjectDir, '.github', 'copilot-instructions.md')),
      true
    );
  });
});
