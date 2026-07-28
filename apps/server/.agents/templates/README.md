# Code & Doc Templates Blueprint

Templates in `.agents/templates/` are **annotated markdown blueprints** used by agents to render production-grade code and documentation.

## Format Standard

Every template is a Markdown file structured as follows:

```markdown
---
template: aggregate
placeholders: [DomainName, domainName, DOMAIN_NAME]
generates: src/core/aggregate-roots/{{domainName}}.aggregate.ts
---

# {{DomainName}} Aggregate Root Template

Short explanation of what this blueprint generates and WHY non-obvious design decisions were made.

## Code Blueprint

```typescript
// Production-ready TypeScript code with {{placeholders}}
// Annotated with # WHY: inline comments
```

## Post-Generation Checklist
- [ ] List of checks the agent must verify after rendering
```

## Variable Substitutions

| Placeholder | Example (`Campaign`) | Example (`FacebookPage`) |
|-------------|----------------------|--------------------------|
| `{{DomainName}}` | `Campaign` | `FacebookPage` |
| `{{domainName}}` | `campaign` | `facebook-page` |
| `{{DOMAIN_NAME}}` | `CAMPAIGN` | `FACEBOOK_PAGE` |
| `{{propertyName}}` | `campaignName` | `facebookPage` |
