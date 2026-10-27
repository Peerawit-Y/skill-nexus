---
name: {{SKILL_NAME}}
description: Integration patterns, authentication, and error handling for {{SKILL_NAME}} API services.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
metadata:
  requires:
    bins: [curl]
    env: [API_KEY]
---

# {{SKILL_NAME}} - API Integration

Guidelines and best practices for integrating, authenticating, and handling responses from {{SKILL_NAME}} API services.

## 1. Trigger & Scope

### When to Use
- When calling external endpoints or creating client adapters for `{{SKILL_NAME}}`.
- When debugging API response status codes, payload formatting, or authorization issues.

---

## 2. Authentication & Security

- Store API credentials strictly in environment variables (`$API_KEY`).
- Never log raw headers or query parameters containing sensitive tokens or passwords.
- Implement exponential backoff retry logic for rate limits (HTTP 429).

---

## 3. Standard Request & Response Patterns

```bash
# Example health check / auth verification
curl -fsSL -H "Authorization: Bearer $API_KEY" "https://api.example.com/v1/health"
```

---

## 4. Error Handling Guidelines

| Status Code | Meaning | Handling Strategy |
| :--- | :--- | :--- |
| `400 Bad Request` | Invalid payload or missing parameters | Validate request schema before sending |
| `401 Unauthorized` | Invalid or expired token | Check environment variable and refresh token |
| `404 Not Found` | Resource does not exist | Verify endpoint path and resource ID |
| `429 Rate Limited` | Rate limit exceeded | Implement exponential backoff retry |
| `5xx Server Error` | Upstream service failure | Retry with backoff, fall back to cached data if applicable |
