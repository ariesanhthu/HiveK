---
name: security-review
description: Audits endpoints, guards, data masking, injection vulnerabilities, and secrets handling.
---

# Security Review Skill

## Instructions

1. Verify endpoint guard stack:
   - Default: `ApiKeyGuard` → `JwtAuthGuard` → `RolesGuard` → `UserVerifiedGuard`.
   - Explicit bypass: `@Public()` for public endpoints, `@WebHook()` for webhook callbacks.
2. Check input validation:
   - Every input payload must be validated with Zod DTO schema.
3. Check data exposure:
   - Ensure passwords, tokens, or PII are masked in logs, domain events, and response DTOs.
4. Verify secrets handling:
   - Ensure no credentials or API keys are committed in source code or `docs/`.
