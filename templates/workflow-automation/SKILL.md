---
name: {{SKILL_NAME}}
description: Automated workflow and CI/CD operations for {{SKILL_NAME}}. Trigger when running repetitive build, test, or deployment tasks.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
metadata:
  requires:
    bins: [git]
    env: []
---

# {{SKILL_NAME}} - Workflow Automation

Operational instructions for orchestrating build, test, and release pipelines for {{SKILL_NAME}}.

## 1. Trigger & Scope

### When to Use
- When running automated build, packaging, or deployment workflows for `{{SKILL_NAME}}`.
- When diagnosing failure in CI/CD pipeline steps or test executions.

---

## 2. Prerequisites & Dependencies

Before running automated workflows, ensure required tools are installed:
- Check required CLI tools in `metadata.requires.bins`.
- Verify necessary environment variables are set before triggering actions.

---

## 3. Automation Steps

1. **Environment Verification**:
   - Check tool versions and active branches.
2. **Pre-flight Checks**:
   - Run linting and unit tests before executing builds.
3. **Execution**:
   - Trigger build, bundle, or release steps.
4. **Post-execution Verification**:
   - Inspect build artifacts and exit codes.
   - Report status and output logs if failures occur.

---

## 4. Standard Operational Commands

```bash
# Pre-flight check
npm run lint && npm test

# Build step
npm run build
```
