---
trigger: always_on
description: Security constraints, auth guard order, data masking, and secret handling
---

# Security Rules

## Guard Stack Execution Order

In NestJS gRPC controllers, authorization is handled via CASL-based guards:
1. `GrpcMetadataGuard` (Extracts actor identity from gRPC metadata)
2. `CaslAbilityGuard` (Checks `@CheckAbility()` permissions)
3. `UserVerifiedGuard` (Account status verification)

## Public & Webhook Exceptions

- Decorate public endpoints explicitly with `@Public()`.
- Decorate webhook callback endpoints with `@WebHook()`.
- Un-decorated endpoints MUST require authentication by default.

## Data Masking & Secret Policy

- NEVER output raw passwords, tokens, API keys, or private keys in logs, domain events, or API responses.
- Load secrets strictly via environment variables (`process.env`), never hardcoded in source code or `docs/`.
