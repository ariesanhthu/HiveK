---
template: refactor-note
placeholders: [DateStr, SeqNum, ShortDescription]
generates: docs/refactor/{{DateStr}}-{{SeqNum}}-{{ShortDescription}}.md
---

# Refactor Note: {{ShortDescription}}

**Date**: {{DateStr}}  
**Sequence**: {{SeqNum}}  
**Phase**: Architecture Alignment  
**Status**: pending # pending | in-progress | done  

## Context
<!-- Brief description of the legacy module mess and why logic was blanked/stubbed during Phase 1 -->

## Locations & Blank Reasons

| Legacy File | Original Lines | Target Layer | Blank Reason | Risk |
|-------------|----------------|--------------|--------------|------|
| `src/legacy/path.ts` | 100–150 | Core Aggregate / Repo | DB call mixed with domain logic | HIGH |

## Original Raw Code Snippets
<!-- Preserves exact raw copy of legacy code blocks before blanking, preventing line-number drift -->

```typescript
// Raw legacy code snippet 1
```

## Inferred Intent & Mapping Strategy
<!-- What the agent understood from the original code and where it should be restored -->
- **Core Domain**: 
- **Application**: 
- **Infrastructure**: 
- **Presentation**: 

## Open Questions & Human Escalations
<!-- Anything requiring developer confirmation before restoration -->
- [ ] Question 1

## Restoration Checklist (Phase 2)
- [ ] Restored Core Aggregate invariants & VOs
- [ ] Restored Repository Port & Adapter
- [ ] Restored Application Command/Query Handler
- [ ] Restored Presentation Controller & DTO Zod Validation
- [ ] Tests passing & note marked as `done`
