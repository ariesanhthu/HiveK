---
trigger: always_on
description: Error handling principles, domain exceptions, and HTTP error envelopes
---

# Error Handling Rules

## Directives

1. **No Silent Exception Swallowing**:
   - NEVER catch an exception and swallow it silently without logging or re-throwing.
   - Fail fast and throw explicit domain exceptions.

2. **Domain Exceptions**:
   - All domain errors inherit from a base `DomainException` or custom `{Name}Exception`.
   - Include a machine-readable `code` and human-readable `message`.

```typescript
export class AssetException extends DomainException {
  constructor(message: string, code: string = 'ASSET_ERROR') {
    super(message, code);
  }
}
```

3. **Error Envelopes**:
   - gRPC error handling maps `DomainException` subclasses to consistent error responses with stable error codes:

```json
{
  "success": false,
  "error": {
    "code": "ASSET_INVALID_STATE",
    "message": "Asset is in invalid state",
    "timestamp": "2026-07-23T22:00:00.000Z"
  }
}
```
