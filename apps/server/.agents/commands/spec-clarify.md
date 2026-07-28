---
name: spec-clarify
description: Audit specs/NNN-<name>/spec.md for underspecified areas and ask up to 3 targeted clarification questions before proceeding to architecture planning.
---

# Command: spec-clarify

## Intent
Audit `specs/NNN-<name>/spec.md` for underspecified areas and ask up to 3 targeted clarification questions before proceeding to architecture planning.

## Preconditions
- Existing `specs/NNN-<name>/spec.md` in `draft` status

## Steps
1. Run skill [`spec-clarify`](../skills/spec-clarify/SKILL.md).
2. Present up to 3 targeted clarification questions to the user.
3. Update `spec.md` with resolved answers and mark `status: approved`.

## Deliverables
- Fully clarified `spec.md` in `approved` status
