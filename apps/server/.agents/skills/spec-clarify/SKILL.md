---
name: spec-clarify
description: Identifies underspecified areas or ambiguities in specs/NNN-<name>/spec.md and formulates up to 3 targeted clarification questions before planning.
---

# Spec Clarify Skill

## Instructions

1. Read target `specs/NNN-<name>/spec.md`.
2. Audit spec for ambiguous requirements, missing edge cases, or underspecified business rules.
3. If ambiguities exist:
   - Formulate **up to 3 targeted, high-impact clarification questions**.
   - Present options clearly to the user.
4. Once user responds, encode answers into `spec.md` and set frontmatter `status: approved`.
5. If the resolved answers change feature boundaries or external dependencies, re-sync `specs/NNN-<name>/ref.md` to reflect these updates.
