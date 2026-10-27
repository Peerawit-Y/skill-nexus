---
name: {{SKILL_NAME}}
description: Code quality, security review, and architecture validation standards for {{SKILL_NAME}}.
allowed-tools: Bash, Read, Grep, Glob
metadata:
  requires:
    bins: []
    env: []
---

# {{SKILL_NAME}} - Code Review & Quality Standards

Comprehensive guidelines for reviewing code changes, ensuring security, type safety, and architectural consistency for {{SKILL_NAME}}.

## 1. Trigger & Scope

### When to Use
- When reviewing pull requests, diffs, or newly implemented features for `{{SKILL_NAME}}`.
- When auditing code for security vulnerabilities, edge cases, and performance bottlenecks.

### When NOT to Use
- When only writing new prototype code without review requirements.

---

## 2. Review Checklist

### Security & Privacy
- [ ] No hardcoded credentials, API keys, or private tokens.
- [ ] Inputs are sanitized and validated against injection attacks (SQL, Command, XSS).
- [ ] Principle of least privilege applied for permissions and environment access.

### Correctness & Robustness
- [ ] Edge cases handled (null/undefined values, empty arrays, network timeouts).
- [ ] Error handling does not swallow unexpected exceptions silently.
- [ ] Asynchronous operations properly awaited with error boundaries.

### Performance & Clean Architecture
- [ ] No redundant queries, N+1 lookups, or unindexed database filters.
- [ ] Single Responsibility Principle followed for functions and modules.
- [ ] Code is DRY (Don't Repeat Yourself) without excessive premature abstraction.

---

## 3. Review Workflow

1. **Analyze Diff Scope**: Check git status or diff for modified files.
2. **Run Automated Checks**: Execute linter, test suites, and type checkers.
3. **Inspect Implementation Details**: Verify logic against the checklist above.
4. **Deliver Constructive Feedback**: Provide specific file references, explanations, and suggested improvements.
