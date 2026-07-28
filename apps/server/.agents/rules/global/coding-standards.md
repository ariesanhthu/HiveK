---
trigger: always_on
description: TypeScript coding standards, type safety, and strictness rules
---

# Coding Standards

## Directives

1. **No `any`**: Use explicit types, generics, or `unknown` with type guards.
2. **Strict Null Checks**: Always handle `null` and `undefined` explicitly.
3. **Explicit Return Types**: All public class methods and exported functions MUST declare explicit return types.
4. **Immutability**: Prefer `readonly` properties for Value Objects, Commands, Queries, and Events.
5. **No Direct State Mutation**: Domain properties should be updated only via aggregate root domain methods.
