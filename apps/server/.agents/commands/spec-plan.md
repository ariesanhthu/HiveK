---
name: spec-plan
description: Generate the architectural implementation plan (plan.md) and traceability link graph (ref.md) for a feature spec, mapping impact across all four layers.
---

# Command: spec-plan

## Intent
Generate implementation plan `plan.md` and traceability link graph `ref.md` for a feature.

## Preconditions
- Approved `specs/NNN-<name>/spec.md`

## Steps
1. Activate [`architect`](../agents/architect.md) agent.
2. Run skill [`spec-plan`](../skills/spec-plan/SKILL.md).
3. Generate `specs/NNN-<name>/plan.md` (layer impact & strategy).
4. Generate `specs/NNN-<name>/ref.md` (traceability graph linking touched `docs/` and ADRs).

## Deliverables
- `specs/NNN-<name>/plan.md`
- `specs/NNN-<name>/ref.md` link graph
