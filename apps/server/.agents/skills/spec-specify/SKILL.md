---
name: spec-specify
description: Creates a new feature specification at specs/NNN-<name>/spec.md from a high-level natural language description, focusing strictly on functional requirements, scenarios, and business rules.
---

# Spec Specify Skill

## Instructions

1. Parse user feature description.
2. Determine next sequential 3-digit prefix (`001`, `002`, ...) under `specs/`.
3. Create feature directory `specs/NNN-<short-name>/`.
4. Render [`templates/spec/spec.md`](../../templates/spec/spec.md) into `specs/NNN-<short-name>/spec.md`.
5. Extract user stories, scenarios, business invariants, and success criteria.
6. Set frontmatter `status: draft`.
7. DO NOT include technical implementation details (frameworks, database schemas, code paths) in `spec.md`. Keep it focused on business behavior.
