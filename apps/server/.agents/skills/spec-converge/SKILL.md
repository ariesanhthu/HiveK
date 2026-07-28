---
name: spec-converge
description: Assesses completed implementation against spec.md, syncs architectural changes back to permanent docs/domains/, and locks the spec directory as complete.
---

# Spec Converge Skill

## Instructions

1. Verify all items in `specs/NNN-<name>/tasks.md` are completed (`[x]`).
2. Run validation hooks: [`after-generate.sh`](../../hooks/after-generate.sh) and verification tests (`.agents/hooks/run-tests.sh`).
   - If hooks or tests fail, DO NOT complete convergence. Update `spec.md` status to `status: partial` or revert back to `status: in-progress` until errors are resolved.
3. Activate [`domain-modeler`](../../agents/domain-modeler.md) agent to sync new domain state back to permanent documentation in `docs/domains/<domain>/domain.md`.
4. Update `specs/NNN-<name>/spec.md` frontmatter to `status: completed`.
5. The spec directory `specs/NNN-<name>/` is now locked as an immutable historical record.
