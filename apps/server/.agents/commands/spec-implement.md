---
name: spec-implement
description: Execute tasks.md sequentially item by item, marking each completed immediately to support seamless resumption after session interruption.
---

# Command: spec-implement

## Intent
Execute implementation tasks in `specs/NNN-<name>/tasks.md` sequentially, marking items complete immediately after generation to ensure seamless session interruption recovery.

## Preconditions
- Task checklist `specs/NNN-<name>/tasks.md`

## Steps
1. Activate specialist agents based on phase ([`domain-modeler`](../agents/domain-modeler.md), [`database-engineer`](../agents/database-engineer.md), [`api-designer`](../agents/api-designer.md)).
2. Run skill [`spec-implement`](../skills/spec-implement/SKILL.md).
3. Check `tasks.md` for uncompleted items (`[ ]`) and resume from the first uncompleted task item.
4. Process each granular task item sequentially:
   - Generate code from `.agents/templates/`.
   - **Immediately update `tasks.md` (mark `[x]`) after each item completes**.
5. Run [`after-generate.sh`](../hooks/after-generate.sh) after completing each phase.

## Deliverables
- Fully generated & tested code implementation
- Real-time updated `tasks.md` checklist checkpoint
