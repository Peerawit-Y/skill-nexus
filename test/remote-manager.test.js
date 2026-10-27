import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseGitSource } from '../dist/index.js';

describe('parseGitSource', () => {
  test('parses shorthand owner/repo', () => {
    const res = parseGitSource('anthropics/sample-skill');
    assert.equal(res.url, 'https://github.com/anthropics/sample-skill.git');
    assert.equal(res.defaultName, 'sample-skill');
    assert.equal(res.subpath, undefined);
  });

  test('parses shorthand with subpath', () => {
    const res = parseGitSource('anthropics/skills/pdf-tool');
    assert.equal(res.url, 'https://github.com/anthropics/skills.git');
    assert.equal(res.defaultName, 'pdf-tool');
    assert.equal(res.subpath, 'pdf-tool');
  });

  test('parses full https github url', () => {
    const res = parseGitSource('https://github.com/Peerawit-Y/my-skill.git');
    assert.equal(res.url, 'https://github.com/Peerawit-Y/my-skill.git');
    assert.equal(res.defaultName, 'my-skill');
  });

  test('parses github url with /tree/branch/subpath', () => {
    const res = parseGitSource('https://github.com/owner/monorepo/tree/main/skills/excel-parser');
    assert.equal(res.url, 'https://github.com/owner/monorepo.git');
    assert.equal(res.branch, 'main');
    assert.equal(res.subpath, 'skills/excel-parser');
    assert.equal(res.defaultName, 'excel-parser');
  });
});
