# Mongo infrastructure (`@sgod-mongodb/library` v0.1.5+)

## Bootstrap (chuẩn SGOD brownfield)

`MongoBrownfieldModule.forRootAsync` (lib ≥0.1.6) gói:

1. `MongooseModule.forRootAsync` — một pool MongoDB (`MONGO_URI`).
2. `MongoModule.forExistingMongooseConnection()` — reuse connection Nest (`inject: [getConnectionToken()]`).
3. `MongoClsModule.forRoot({ registerInterceptor: true })` — CLS cho `@Transactional()` và `transactionPlugin`.
4. `createMongooseTransactionManagerProviders()` — `TRANSACTION_MANAGER_TOKEN` + alias Nest.

`MongooseModule.forFeature` — đăng ký schema; repository domain implement port riêng.

## Transaction

- **Payment-style bundle:** `MongooseUnitOfWork` inject `TRANSACTION_MANAGER_TOKEN` (`mongo-unit-of-work.ts`).
- **Handler đơn giản:** `@Transactional()` từ `@sgod-mongodb/library/nestjs` (CLS).

## Filter / tenant

Dùng preset library: `FILTER_BUILDER_PRESETS.enterpriseSnakeCaseDeletedAt` từ `@sgod-mongodb/library/infrastructure`.

**Core repos:** tất cả repository trong `repositories/` dùng `SgodMongooseRepositoryCore` + preset trong `constants/payment-mongo.constants.ts`. Helper: `utils/repository-session.util.ts` — `findManyOptions` (không cast từ 0.1.6), `asSgodModel` (schema `_id: string`).

## Import gợi ý (v0.1.5+)

| Nhu cầu | Entrypoint |
|---------|------------|
| Bootstrap brownfield | `@sgod-mongodb/library/nestjs` — `MongoBrownfieldModule`, `TRANSACTION_MANAGER_TOKEN`, `MongooseTransactionManager` |
| Repository core / UoW | `@sgod-mongodb/library/mongoose` |
| Filter preset | `@sgod-mongodb/library/infrastructure` |

## Schema

Mỗi schema gắn `transactionPlugin` từ `@sgod-mongodb/library/plugins` để query/write tham gia CLS session.

## Type Mongoose 9

`FilterQuery` import từ `@sgod-mongodb/library/mongoose` (không export từ `mongoose`).
