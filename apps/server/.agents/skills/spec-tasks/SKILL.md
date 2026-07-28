---
name: spec-tasks
description: Generates a dependency-ordered checklist of fine-grained, granular implementation tasks at specs/NNN-<name>/tasks.md based on plan.md.
---

# Spec Tasks Skill

## Instructions

1. Read `specs/NNN-<name>/plan.md` and `specs/NNN-<name>/spec.md`.
2. Render [`templates/spec/tasks.md`](../../templates/spec/tasks.md) into `specs/NNN-<name>/tasks.md`.
3. **Granular Task Decomposition**:
   - Break implementation down into small, fine-grained, atomic task items.
   - Each task item should cover a single specific file or single small concern (e.g. *"Define `EStatus` enum"*, *"Implement `CampaignRoot.create()` factory"*, *"Implement `CreateCampaignCommand` & DTO"*).
   - Avoid broad, multi-file tasks (e.g., avoid *"Implement core domain"*).
4. Organize tasks into 4 ordered phases:
   - **Phase 1: Core Domain** (Enums → Value Objects → Entities → Aggregate Root → Domain Events → Repository Port)
   - **Phase 2: Application Layer** (Command DTOs & Handlers → Query Handlers → Mappers)
   - **Phase 3: Infrastructure & Presentation** (Mongoose Schema → Repository Adapter → Read Service → Module → Controller)
   - **Phase 4: Verification & Docs Convergence** (Unit Tests → Integration Tests → Validation Hooks → Sync `docs/`)
