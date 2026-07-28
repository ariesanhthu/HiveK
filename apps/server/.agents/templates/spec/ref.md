---
template: ref
placeholders: [FeatureName, FeatureNumber]
generates: specs/{{FeatureNumber}}-{{featureName}}/ref.md
---

# Feature Traceability Link Graph: {{FeatureName}}

**Feature**: `specs/{{FeatureNumber}}-{{featureName}}`

## Target Domains Touched
- [`Domain Name`](../../docs/domains/<domain>/domain.md) — Summary of changes

## Architecture Decision Records (ADRs)
- [`001-initial-architecture`](../../docs/architecture/decisions/001-initial-architecture.md)

## Tech Stack References
- [`Service Identity & Stack`](../../docs/architecture/service.md)
- [`Integrations Map`](../../docs/tech/integrations.md)
