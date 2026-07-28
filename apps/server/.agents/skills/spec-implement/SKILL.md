---
name: spec-implement
description: Executes tasks.md sequentially item by item, updating tasks.md immediately after each item completes to support seamless interruption recovery.
---

# Spec Implement Skill

## Instructions

1. Read `specs/NNN-<name>/tasks.md` and `specs/NNN-<name>/plan.md`.
2. Check `tasks.md` for already completed items (`[x]`). Resume execution at the first uncompleted item (`[ ]`).
3. **Execution & Immediate Checklist Checkpoint Rule**:
   - Process tasks item by item in exact sequential order.
   - For each task item:
     - Render template / write target code file.
     - Verify code compiles / passes lint.
     - **CRITICAL**: **IMMEDIATELY update `specs/NNN-<name>/tasks.md` to mark the task item completed (`[x]`) BEFORE moving to the next task item.**
     - *Rationale*: If the agent session is interrupted, a new agent session can resume immediately from the exact checkpoint without re-doing completed work.
4. Execute [`.agents/hooks/after-generate.sh`](../../hooks/after-generate.sh) to validate boundary rules after completing each phase.
