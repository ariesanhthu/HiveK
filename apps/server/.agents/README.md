# Practical Backend Agent Kit (`.agents/`)

This repository contains the backend agent kit structured into **Specialized Stack Components** and **Universal Reusable Meta-Kits**.

---

## 📌 Table of Contents

- [1. Specialized Tech-Stack Foundation](#-1-specialized-tech-stack-foundation)
- [2. Universal Reusable Meta-Kits (Tech-Stack Agnostic)](#-2-universal-reusable-meta-kits-tech-stack--framework-agnostic)
  - [A. Spec-Driven Development Kit (`specs/`)](#a--universal-spec-driven-development-kit-specs)
  - [B. Legacy Refactoring Kit (`docs/refactor/`)](#b--universal-legacy-refactoring-kit-docsrefactor)
  - [C. Architecture Health Check Kit (`docs/health/`)](#c--universal-architecture-health-check-kit-docshealth)
  - [D. Kit Link Self-Repair Engine](#d--universal-kit-link-self-repair-engine)
- [3. Adapting & Customizing the Kit for New Demands](#-3-adapting--customizing-the-kit-for-new-demands)
  - [Customization Matrix](#-customization-checklist)
  - [Post-Customization Check](#-post-customization-check)

---

## 🎯 1. Specialized Tech-Stack Foundation

These components are specialized for **TypeScript + NestJS + Hexagonal Architecture + DDD + CQRS + MongoDB + Transactional Outbox**:

* **Root Entrypoint**: [`AGENT.md`](AGENT.md)
* **Specialist Agents**: [`architect`](agents/architect.md), [`domain-modeler`](agents/domain-modeler.md), [`api-designer`](agents/api-designer.md), [`database-engineer`](agents/database-engineer.md), [`event-designer`](agents/event-designer.md), [`security-reviewer`](agents/security-reviewer.md), [`test-engineer`](agents/test-engineer.md), [`code-reviewer`](agents/code-reviewer.md)
* **Foundation Commands**: [`init-kit`](commands/init-kit.md), [`add-domain`](commands/add-domain.md), [`add-use-case`](commands/add-use-case.md), [`add-endpoint`](commands/add-endpoint.md), [`add-event`](commands/add-event.md), [`add-tech`](commands/add-tech.md), [`add-migration`](commands/add-migration.md), [`create-tests`](commands/create-tests.md)
* **Specialized Skills**: [`cqrs-generator`](skills/cqrs-generator/SKILL.md), [`repository-design`](skills/repository-design/SKILL.md), [`uow-outbox`](skills/uow-outbox/SKILL.md), [`api-contract-design`](skills/api-contract-design/SKILL.md), [`event-contract-design`](skills/event-contract-design/SKILL.md), [`domain-modeling`](skills/domain-modeling/SKILL.md), [`security-review`](skills/security-review/SKILL.md), [`testing-strategy`](skills/testing-strategy/SKILL.md)
* **Specialized Blueprints**: [`templates/domain/`](templates/domain/aggregate.md), [`templates/application/`](templates/application/command-handler.md), [`templates/infrastructure/`](templates/infrastructure/mongoose-schema.md), [`templates/api/`](templates/api/controller.md)
* **Architecture Boundary Hooks**:
  * [`validate-boundaries.sh`](hooks/validate-boundaries.sh) — Checks `src/core/` for NestJS / Mongoose framework leaks
  * [`validate-imports.sh`](hooks/validate-imports.sh) — Checks `src/application/` import direction
  * [`validate-contracts.sh`](hooks/validate-contracts.sh) — Checks API documentation & controller contract consistency
  * [`after-generate.sh`](hooks/after-generate.sh) — Post-generation validation runner

---

## ♻️ 2. Universal Reusable Meta-Kits (Mostly Stack-Agnostic)

These kits handle workflow lifecycle, specification, refactoring, and health check logic. **The workflow logic (commands, skills) is stack-agnostic**, but the templates they reference (specs, tasks, refactor notes, health reports) may carry project-specific path conventions, layer names, or file patterns from adaptation. When switching stacks, review these templates too — they're easy to update.

### A. 📋 Spec-Driven Development Kit (`specs/`)
Handles complex multi-step feature development with granular task tracking and a traceability graph (`ref.md`).

* **Commands**:
  * [`spec-specify`](commands/spec-specify.md) — Create feature specification at `specs/NNN-<name>/spec.md`
  * [`spec-clarify`](commands/spec-clarify.md) — Audit requirements and ask up to 3 targeted questions
  * [`spec-plan`](commands/spec-plan.md) — Generate architectural plan & `ref.md` link graph
  * [`spec-tasks`](commands/spec-tasks.md) — Generate dependency-ordered granular task checklist
  * [`spec-implement`](commands/spec-implement.md) — Execute tasks with real-time `[x]` task updates
  * [`spec-converge`](commands/spec-converge.md) — Sync architectural changes back to `docs/` and lock spec
* **Skills**:
  * [`spec-specify`](skills/spec-specify/SKILL.md), [`spec-clarify`](skills/spec-clarify/SKILL.md), [`spec-plan`](skills/spec-plan/SKILL.md), [`spec-tasks`](skills/spec-tasks/SKILL.md), [`spec-implement`](skills/spec-implement/SKILL.md), [`spec-converge`](skills/spec-converge/SKILL.md)
* **Templates**:
  * [`spec.md`](templates/spec/spec.md), [`plan.md`](templates/spec/plan.md), [`ref.md`](templates/spec/ref.md), [`tasks.md`](templates/spec/tasks.md)

---

### B. 🔄 Universal Legacy Refactoring Kit (`docs/refactor/`)
Refactors messy legacy codebases into clean layer structures without losing business logic.

* **Commands**:
  * [`refactor-align`](commands/refactor-align.md) — **Phase 1**: Restructure layers, blank tangled logic, insert backlinks (`// see: docs/refactor/...`), write Refactor Notes
  * [`refactor-restore`](commands/refactor-restore.md) — **Phase 2**: Re-implement blanked logic inside-out into correct layers & run tests
* **Skills**:
  * [`refactor-engine`](skills/refactor-engine/SKILL.md) — Decision rules matrix for blanking & inside-out restoration
* **Templates**:
  * [`refactor-note`](templates/refactor/note.md) — Refactor note blueprint preserving raw legacy code snippets
* **Hooks**:
  * [`validate-refactor.sh`](hooks/validate-refactor.sh) — Audits open refactor notes in `docs/refactor/`

---

### C. 📊 Universal Architecture Health Check Kit (`docs/health/`)
On-demand Git-anchored incremental health audits detecting architectural drift.

* **Commands**:
  * [`review-architecture`](commands/review-architecture.md) — Run Git-anchored health check (Bootstrap or Incremental mode)
* **Templates**:
  * [`health-report`](templates/health/report.md) — Baseline health report (`docs/health/{YYYYMMDD}-{short_hash}.md`)
* **Hooks**:
  * [`check-health.py`](hooks/check-health.py) — Core diff scanner classifying NEW, PERSISTING, and RESOLVED violations
  * [`check-health.sh`](hooks/check-health.sh) — Clean Git precondition wrapper

---

### D. 🛠️ Universal Kit Link Self-Repair Engine
* **Commands**:
  * [`repair-kit`](commands/repair-kit.md) — Verify and auto-repair broken markdown relative links across `.agents/`
* **Hooks**:
  * [`validate-links.py`](hooks/validate-links.py) & [`validate-links.sh`](hooks/validate-links.sh) — Universal markdown relative link repair engine

---

## 🛠️ 3. Adapting & Customizing the Kit for New Demands

When adapting this kit for a **new project demand** (e.g. switching to **Go + Gin + PostgreSQL**, **Python + FastAPI**, or a different architecture style), start with **Section 1 (The Stack Layer)** — this is where the bulk of the work is. The meta-kit workflows (spec-*, refactor-*, etc.) stay as-is, but their **templates** may reference project-specific paths from a previous adaptation and should be reviewed.

### 📋 Customization Checklist

| Component | Action | Details |
|-----------|--------|---------|
| **`AGENT.md`** | ✏️ Update | Edit the `## Dedicated Technology Stack` section to declare the new language, framework, and datastore. |
| **`templates/`** | ✏️ Replace | Replace code blueprints in `domain/`, `application/`, `infrastructure/`, and `api/` with working code templates for the new stack. |
| **`rules/`** | ✏️ Replace | Swap `rules/languages/` and `rules/frameworks/` files with coding standards for the new language/framework. |
| **`skills/`** | ✏️ Replace | Replace stack-specific skills (`cqrs-generator`, `repository-design`, `uow-outbox`) with skills matching the new stack libraries (e.g. `gorm-repository` or `sqlalchemy`). |
| **`commands/`** | ✏️ Update | Update `add-domain.md`, `add-use-case.md`, and `add-endpoint.md` to reference the new templates and file target paths. |
| **`hooks/`** | ✏️ Update | Edit `validate-boundaries.sh` and `validate-imports.sh` regex patterns to match the new folder structure. |
| **Meta-kit templates** | 🔍 **Review** | `templates/spec/*`, `templates/refactor/*`, `templates/health/*` — the workflow logic is stack-agnostic, but these templates may contain path references from a previous project adaptation. Update paths if needed. |
| **Meta-kit commands & skills** | 🔒 **Keep** | `spec-*`, `refactor-*`, `review-architecture`, `repair-kit` commands and skills — their workflow logic is fully stack-agnostic and needs no changes. |

### 🛠️ Post-Customization Check
After customizing `.agents/` for a new stack, run the self-repair command to verify all markdown links resolve cleanly:
```bash
.agents/hooks/validate-links.sh --fix
```
