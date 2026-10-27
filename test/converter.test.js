import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  convertToCursorMdc,
  convertToCopilot,
  convertToWindsurf,
} from '../dist/index.js';

describe('Cross-Agent Format Converter', () => {
  const sampleSkill = `---
name: code-formatter
description: Formats code according to project style guide
allowed-tools: Bash, Edit
---

# Code Formatter
Always run prettier before submitting pull requests.
`;

  test('converts SKILL.md to Cursor .mdc format', () => {
    const res = convertToCursorMdc('code-formatter', sampleSkill, { globs: '*.ts,*.js' });
    assert.equal(res.filename, 'code-formatter.mdc');
    assert.equal(res.relativePath, '.cursor/rules/code-formatter.mdc');
    assert.equal(res.format, 'cursor');
    assert(res.content.includes('description: Formats code according to project style guide'));
    assert(res.content.includes('globs: "*.ts,*.js"'));
    assert(res.content.includes('alwaysApply: false'));
    assert(res.content.includes('# Code Formatter'));
  });

  test('converts skills to GitHub Copilot instructions', () => {
    const res = convertToCopilot([
      { name: 'code-formatter', content: sampleSkill },
    ]);
    assert.equal(res.filename, 'copilot-instructions.md');
    assert.equal(res.relativePath, '.github/copilot-instructions.md');
    assert.equal(res.format, 'copilot');
    assert(res.content.includes('# GitHub Copilot Instructions'));
    assert(res.content.includes('## Skill: code-formatter'));
    assert(res.content.includes('> Formats code according to project style guide'));
    assert(res.content.includes('Always run prettier before submitting'));
  });

  test('converts skills to Windsurf rules', () => {
    const res = convertToWindsurf([
      { name: 'code-formatter', content: sampleSkill },
    ]);
    assert.equal(res.filename, '.windsurfrules');
    assert.equal(res.relativePath, '.windsurfrules');
    assert.equal(res.format, 'windsurf');
    assert(res.content.includes('<rule name="code-formatter" description="Formats code according to project style guide">'));
    assert(res.content.includes('Always run prettier before submitting'));
    assert(res.content.includes('</rule>'));
  });
});
