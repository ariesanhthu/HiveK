---
name: spec-specify
description: Create a new feature spec directory at specs/NNN-<name>/spec.md from a natural language request, capturing functional requirements, acceptance scenarios, and business rules.
---

# Command: spec-specify

## Intent
Bootstrap a new feature specification directory under `specs/NNN-<name>/spec.md` from a natural language feature request.

## Preconditions
- Natural language feature description

## Steps
1. Activate [`domain-modeler`](../agents/domain-modeler.md) agent.
2. Run skill [`spec-specify`](../skills/spec-specify/SKILL.md).
3. Generate `specs/NNN-<short-name>/spec.md` with `status: draft`.
4. Output spec directory location for user review.

## Deliverables
- `specs/NNN-<short-name>/spec.md` specification file
