---
name: {{SKILL_NAME}}
description: Expert guidance and actionable workflow for {{SKILL_NAME}}. Trigger when working on {{SKILL_NAME}} tasks.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
metadata:
  requires:
    bins: []
    env: []
---

# {{SKILL_NAME}}

Detailed guidelines and actionable instructions for AI agents when performing {{SKILL_NAME}}.

## 1. Trigger & Scope

### When to Use
- When the user asks to implement, refactor, debug, or automate tasks related to `{{SKILL_NAME}}`.
- When specific conventions, patterns, or workflows for `{{SKILL_NAME}}` are required.

### When NOT to Use
- For general questions unrelated to `{{SKILL_NAME}}`.
- When simple, built-in commands suffice without specialized multi-step guidance.

---

## 2. Guardrails & Safety Rules

- **Idempotency**: Ensure commands and operations are safe to run repeatedly without unintended side effects.
- **Verification First**: Always inspect the current workspace state and relevant files before taking action.
- **Data Protection**: Never run destructive or irreversible commands (e.g. broad deletion, dropping databases) without explicit confirmation.
- **Secrets Management**: Never log, hardcode, or commit sensitive credentials, tokens, or API keys.

---

## 3. Step-by-Step Workflow

1. **Context Discovery**:
   - Locate and inspect relevant configuration files, dependencies, and existing code patterns.
2. **Implementation / Execution**:
   - Apply modifications incrementally with precision.
   - Maintain documentation integrity and preserve unrelated existing code.
3. **Verification & Testing**:
   - Run typecheck, unit tests, or lint commands to verify all changes pass cleanly.
4. **Summary & Delivery**:
   - Provide a clear, concise summary of changes made with clickable file links.

---

## 4. Commands & Reference Code

```bash
# Example verification command
echo "Checking prerequisites for {{SKILL_NAME}}..."
```

---

## 5. Troubleshooting & Edge Cases

| Issue / Error | Likely Cause | Recommended Resolution |
| :--- | :--- | :--- |
| Command not found | Missing CLI dependency | Check `metadata.requires.bins` and install prerequisite tool |
| Permission denied | Insufficient file permissions | Verify write access or run with appropriate user privileges |
| Syntax / Type Error | Incompatible interface | Check recent changes and run local typecheck |
