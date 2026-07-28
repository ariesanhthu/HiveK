---
name: init-kit
description: Initialize or adapt the .agents/ kit for a project — scaffolds docs/ for new projects, or guides adaptation of rules/templates/hooks for existing projects.
---

# Command: init-kit

## Intent

Initialize the `.agents/` kit for a project. Works in two modes:

- **new-project**: Scaffold fresh `docs/` documentation for a brand new service.
- **adapt-existing**: Guide the user through customizing the kit's rules, templates, and hooks to match an existing project's conventions.

## Preconditions

- `.agents/` directory is present
- `.agents/AGENT.md` exists

---

## Mode Detection

```yaml
if docs/architecture/service.md exists:
  → adapt-existing mode (project docs already present)
else:
  → new-project mode (no project docs yet)
```

The user can also force a mode with flags:
- `init-kit --new` — Force new-project mode (overwrites existing with prompt)
- `init-kit --adapt` — Force adapt-existing mode even without existing docs

---

## Mode: new-project

Scaffold project documentation and configuration for a new service.

### Steps

1. Activate [`architect`](../agents/architect.md) agent.
2. Ask user for any missing identity parameters (or accept defaults from [`AGENT.md`](../AGENT.md)):
   - Service name, domain summary, target language, framework, datastore, auth mechanism
3. Scaffold `docs/` structure:
   - Copy [`templates/docs/service.md`](../templates/docs/service.md) → `docs/architecture/service.md` and fill identity
   - Create `docs/architecture/glossary.md` (blank table)
   - Copy [`templates/docs/adr.md`](../templates/docs/adr.md) → `docs/architecture/decisions/001-initial-architecture.md`
   - Create `docs/tech/stack.md` and `docs/tech/integrations.md`
   - Create `docs/domains/` directory and copy [`templates/docs/domain.md`](../templates/docs/domain.md) → `docs/domains/_template.md`
4. Run [`after-generate.sh`](../hooks/after-generate.sh) to confirm `docs/` readiness.
5. **Mark kit as configured** — Create or update [`kit.toml`](../kit.toml):
   - Set `status = "configured"`
   - Set `mode = "new-project"`
   - Set `initialized_at` to current date
   - Fill `project.name`, `project.language`, `project.framework` from user answers

### Deliverables

- Fully scaffolded `docs/` directory
- `docs/architecture/service.md` filled with project metadata
- ADR 001 recorded
- `docs/domains/_template.md` ready for new domains
- [`kit.toml`](../kit.toml) set to `configured`

### Stop Conditions

- If `docs/architecture/service.md` already exists and `--new` not passed, switch to `adapt-existing` mode instead.

---

## Mode: adapt-existing

Adapt the `.agents/` kit to match an existing project's conventions.

### Steps

1. **Inventory project** — Gather the project's directory structure, naming conventions, base classes, and framework patterns:
   - Run `find src/ -type d | sort` to map directories
   - Run `find src/ -type f -name "*.ts" | head -80` to sample file patterns
   - Check `package.json` for framework dependencies
   - Document conventions (aggregate root suffix, repository port pattern, DI token format, etc.)

2. **Customize rules** — Update `.agents/rules/` to match project conventions:
   - `rules/global/naming.md` — Update class/file naming matrix, directory paths, DI token format, path aliases
   - `rules/global/dependency-rule.md` — Verify layer directory names
   - `rules/languages/` — Replace if language differs (e.g., Python, Go, Rust)
   - `rules/frameworks/` — Replace if framework differs (e.g., Fastify, Gin, FastAPI)
   - `rules/architectures/` — Verify architecture references match project

3. **Customize templates** — Update `.agents/templates/` to use the project's:
   - Import paths and path aliases
   - Base class names and locations
   - ORM/ODM schema patterns
   - Controller and validation patterns
   - Auth guard patterns

4. **Customize hooks** — Update `.agents/hooks/` regex patterns:
   - `validate-boundaries.sh` — Framework packages and directory structure
   - `validate-imports.sh` — Application layer import rules
   - `check-health.py` — `CORE_FORBIDDEN` / `APP_FORBIDDEN` package lists

5. **Customize stack-specific skills & commands** — Replace or update:
   - Skills: `cqrs-generator`, `repository-design`, `uow-outbox`, `api-contract-design`, `event-contract-design`, `domain-modeling`, `testing-strategy`, `security-review`
   - Commands: `add-domain`, `add-use-case`, `add-endpoint`, `add-event`, `add-tech`, `add-migration`, `create-tests`

6. **Update `AGENT.md`** — Edit the `## Dedicated Technology Stack` section to match the project's language, framework, database, and messaging.

7. **Verify kit health**:
   - Run [`validate-links.sh`](../hooks/validate-links.sh) `--fix` to repair broken markdown links
   - Run [`after-generate.sh`](../hooks/after-generate.sh) for boundary validation

8. **Mark kit as configured** — Create or update [`kit.toml`](../kit.toml):
   - Set `status = "configured"`
   - Set `mode = "adapt-existing"`
   - Set `initialized_at` to current date
   - Fill `project.name`, `project.language`, `project.framework` from inventory

### Deliverables

- `.agents/` rules, templates, and hooks updated to match project conventions
- `AGENT.md` stack section aligned with project
- Clean link validation and boundary checks passing
- [`kit.toml`](../kit.toml) set to `configured`

### Notes

- The **Universal Meta-Kits** (`spec-*`, `refactor-*`, `review-architecture`, `repair-kit`) must NOT be modified — they are stack-agnostic and work identically across any project.
- Refer to the full [Customization Matrix](../README.md#-customization-checklist) in the kit README for detailed guidance.
---

## Related

- [`init-session`](init-session.md) — Warm up and anchor session context (run every session after `init-kit`)
- [`repair-kit`](repair-kit.md) — Validate and repair markdown links across `.agents/`
- [`review-architecture`](review-architecture.md) — Git-anchored health check for ongoing drift detection
