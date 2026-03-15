# Agent Map

## Entry points
- `apps/web/src/main.tsx`: bootstrap frontend
- `apps/api/src/server.ts`: bootstrap backend

## Core features
- Auth
  - UI: `apps/web/src/features/auth/*`
  - API: `apps/api/src/modules/auth/*`
  - DB: `packages/db/schema/auth.sql`

- Billing
  - UI: `apps/web/src/features/billing/*`
  - API: `apps/api/src/modules/billing/*`
  - Jobs: `apps/api/src/jobs/invoice.ts`

## Rules for agent
- Khi sửa Auth UI, kiểm tra `AuthGuard`, `sessionStore`, `api/auth`.
- Không đổi contract API nếu chưa update `packages/shared/types`.
- Mọi feature mới phải thêm vào `docs/features/*.md`.