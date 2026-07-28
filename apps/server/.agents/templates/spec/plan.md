---
template: plan
placeholders: [FeatureName, FeatureNumber]
generates: specs/{{FeatureNumber}}-{{featureName}}/plan.md
---

# Architecture Implementation Plan: {{FeatureName}}

**Feature**: `specs/{{FeatureNumber}}-{{featureName}}`
**Status**: proposed # proposed | approved

## 1. Technical Strategy & Architecture Impact
- Selected patterns: Clean Architecture, Hexagonal, DDD, CQRS, Event-Driven
- Target layer impact: Domain, Applications, Infrastructure, API

## 2. Component Design Breakdown

### Domain Layer
- Aggregate Roots / Entities / VOs affected or created

### Applications Layer
- Commands and Queries to implement

### Infrastructure Layer
- Database schemas, repository ports/adapters, outbox events

### API Layer
- gRPC Controllers and endpoint routes

## 3. Security & Safety Review
- Auth guards, roles, input validation (Zod DTOs)
