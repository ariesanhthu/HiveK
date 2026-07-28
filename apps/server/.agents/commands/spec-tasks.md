---
name: spec-tasks
description: Generate a dependency-ordered implementation checklist at specs/NNN-<name>/tasks.md from the approved plan.md, ready for sequential execution by spec-implement.
---

# Command: spec-tasks

## Intent
Generate dependency-ordered implementation task checklist in `specs/NNN-<name>/tasks.md`.

## Preconditions
- Proposed `specs/NNN-<name>/plan.md`

## Steps
1. Activate [`architect`](../agents/architect.md) agent.
2. Run skill [`spec-tasks`](../skills/spec-tasks/SKILL.md).
3. Generate `specs/NNN-<name>/tasks.md` broken into 4 dependency-ordered phases.

## Deliverables
- `specs/NNN-<name>/tasks.md` checklist
