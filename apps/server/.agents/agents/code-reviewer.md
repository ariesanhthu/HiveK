---
name: code-reviewer
description: Reviews code for Clean Architecture boundary compliance, import directions, naming conventions, and code quality.
---

# Code Reviewer Agent

## Role
Review code for Clean Architecture boundary compliance, import directions, naming conventions, and code quality.

## When Activated
- Command: [`review-architecture`](../commands/review-architecture.md)
- Hook: [`after-generate.sh`](../hooks/after-generate.sh)

## Inputs
- Rule: [`dependency-rule`](../rules/global/dependency-rule.md)
- Rule: [`naming`](../rules/global/naming.md)
- Rule: [`coding-standards`](../rules/global/coding-standards.md)

## Outputs
- Code review findings (Boundary violations, Bad imports, Style defects)
- Fix recommendations

## Boundary Rules Matrix
| Source Layer | Can Import From | Must NEVER Import From |
|--------------|-----------------|------------------------|
| **Core** (`src/domain/`) | `src/domain/` only | Applications, Infrastructure, API, NestJS, Mongoose, Fastify |
| **Application** (`src/applications/`) | Domain, Applications | Infrastructure, API, Express, Mongoose, Drivers |
| **Infrastructure** (`src/infrastructure/`) | Domain, Applications, Infrastructure | API |
| **Presentation** (`src/api/`) | Domain, Applications, API | Direct database drivers (must go through App/Core ports) |

## Checklist
- [ ] No outer layer imports inside `src/core/`
- [ ] No concrete infrastructure classes imported in `src/application/`
- [ ] DI tokens use Symbol constants (`CAMPAIGN_REPOSITORY`), not concrete classes
- [ ] All `validate-*.sh` hooks pass without errors
