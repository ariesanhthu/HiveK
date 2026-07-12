# Architecture

> **Pattern:** Domain-Driven Design (DDD) + CQRS + Event Sourcing + Modular Monolith

---

## Layer Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐ │
│  │ REST Admin   │  │ REST Client  │  │ GraphQL  │  │ WebSocket│ │
│  │ Controllers  │  │ Controllers  │  │ Resolvers│  │ Handlers │ │
│  └──────┬───────┘  └──────┬───────┘  └────┬─────┘  └────┬─────┘ │
│         │                 │               │            │       │
│  ┌──────┴─────────────────┴───────────────┴────────────┴─────┐ │
│  │                    RMQ Message Handlers                     │ │
│  └────────────────────────────┬───────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────┘
                                │ Commands / Queries / Events
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│  ┌──────────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │  Command         │  │  Query       │  │  Application      │ │
│  │  Handlers (80+)  │  │  Handlers    │  │  Services         │ │
│  │  (Write Model)   │  │  (Read Model)│  │  (Orchestration)  │ │
│  └────────┬─────────┘  └──────┬───────┘  └────────┬──────────┘ │
│           │                   │                   │             │
│  ┌────────┴───────────────────┴───────────────────┴─────────┐  │
│  │              Domain Events (EventEmitter2)                │  │
│  └──────────────────────────────┬────────────────────────────┘  │
└─────────────────────────────────┼───────────────────────────────┘
                                  │ Repository / Service Interfaces
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER (Core)                        │
│  ┌──────────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────┐ │
│  │ Aggregates   │ │ Entities │ │ Value Objs │ │ Domain Events│ │
│  │ (19 roots)   │ │ (9)      │ │ (15)       │ │ (15+)        │ │
│  └──────────────┘ └──────────┘ └────────────┘ └──────────────┘ │
│  ┌──────────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────┐ │
│  │ Exceptions   │ │ Enums    │ │ Interfaces │ │ Types        │ │
│  │ (domain errs)│ │          │ │ (Repos/Svcs)│ │              │ │
│  └──────────────┘ └──────────┘ └────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │ Repository Implementations
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                          │
│  ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ ┌───────────┐ │
│  │ MongoDB  │ │ Redis   │ │RabbitMQ │ │Cloudin.cloud-ws     │ │ Mailer   │ │
│  │(Mongoose)│ │(ioredis)│ │(amqp)   │ │(socket)│ │(nodemail)│ │
│  └──────────┘ └─────────┘ └─────────┘ └────────┘ └───────────┘ │
│  ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ ┌───────────┐ │
│  │ Logger   │ │ GraphQL │ │ Auth    │ │Payment │ │ Schedule  │ │
│  │(Winston) │ │(Apollo) │ │(JWT/Pspt)│ │Providers│ │(Cron)    │ │
│  └──────────┘ └─────────┘ └─────────┘ └────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

| Layer | Responsibility | Key Files |
|-------|---------------|-----------|
| **Presentation** | HTTP controllers, GraphQL resolvers, WebSocket handlers, RMQ consumers. No business logic. | `src/presentation/controllers/` |
| **Application** | Orchestrates use cases via Commands/Queries. Validates input (Zod), dispatches to Domain, publishes events. | `src/application/commands/`, `queries/`, `services/` |
| **Domain** | Pure TypeScript. Aggregates enforce invariants, Entities have identity, Value Objects are immutable. No framework deps. | `src/core/` |
| **Infrastructure** | Framework adapters: Mongoose repos, Redis cache, RabbitMQ, JWT, Cloudinary, Mailer, Winston, Apollo. | `src/infrastructure/` |

---

## Module Organization (15+ Feature Modules)

Each feature module in `src/infrastructure/modules/` wires its own DI container:

```typescript
// Example: campaign.module.ts
@Module({
  imports: [CqrsModule],                    // Command/Query bus
  controllers: [CampaignAdminController,    // REST
                CampaignClientController,
                CampaignResolver],          // GraphQL
  providers: [
    // Command Handlers
    CampaignCreateCommandHandler,
    CampaignUpdateCommandHandler,
    // ... 10+ handlers
    // Query Handlers
    CampaignGetListHandler,
    // Repositories (Mongo implementations)
    { provide: CAMPAIGN_REPOSITORY, useClass: MongoCampaignRepository },
    { provide: CAMPAIGN_READ_SERVICE, useClass: MongoCampaignReadService },
  ],
  exports: [CAMPAIGN_REPOSITORY, CAMPAIGN_READ_SERVICE],
})
export class CampaignModule {}
```

### Module Map

| Module | Domain | Key Aggregates | Controllers |
|--------|--------|----------------|-------------|
| `AuthModule` | Auth | User, OTP | Admin/Client Auth, OAuth |
| `UserModule` | User | User, Admin, EnterpriseUser, KOLUser | Admin/Client User |
| `EnterpriseModule` | Enterprise | Enterprise | Admin/Client Enterprise |
| `RoleModule` | RBAC | Role | Admin Role |
| `CampaignModule` | Campaign | Campaign | Admin/Client Campaign, Resolver |
| `CampaignParticipantModule` | Campaign-KOL | CampaignParticipant | Admin/Client Participant |
| `CampaignProposalModule` | Proposal | CampaignProposal | Admin/Client Proposal, Resolver |
| `KolProfileModule` | KOL | KolProfile | Admin/Client KOL, Resolver |
| `PlatformModule` | Platform | Platform | Admin/Client Platform |
| `NotificationModule` | Notification | Notification, UserNotification | Admin/Client Notification |
| `UploadedFileModule` | Files | UploadedFile | Admin/Client Upload |
| `PublicReviewModule` | Reviews | PublicReview | Admin/Client Review, Resolver |
| `BillingModule` | Billing | Bill, Package, Subscription | (service-only) |
| `AnalyticsModule` | Analytics | KpiLog | Admin/Client KPI |
| `PaymentModule` | Payment | Payment, PaymentAttempt, PaymentProvider | (RMQ + services) |

---

## CQRS Flow

### Command (Write) Flow

```
POST /hivek/api/admin/campaigns
       │
       ▼
CampaignAdminController.create()
       │
       ▼
CommandBus.execute(new CreateCampaignCommand(dto))
       │
       ▼
CampaignCreateCommandHandler
  ├─ Validates DTO (Zod schema)
  ├─ Loads aggregates via Repository
  ├─ Calls aggregate.create()  ← Domain logic here
  ├─ Saves via Repository (UoW transaction)
  └─ Publishes Domain Events
       │
       ▼
EventEmitter2.emit('campaign.created', event)
       │
       ├─► Application Event Handlers (async side effects)
       └─► RMQ Publisher (cross-service)
```

### Query (Read) Flow

```
GET /hivek/api/client/campaigns?status=ACTIVE
       │
       ▼
CampaignClientController.getList()
       │
       ▼
QueryBus.execute(new GetCampaignListQuery(filters))
       │
       ▼
CampaignGetListHandler
  ├─ Calls Read Service (optimized projections)
  └─ Returns DTO (no domain logic)
```

---

## Dependency Injection Patterns

### Repository Pattern (Ports & Adapters)

**Domain Interface** (`src/core/interfaces/repositories/campaign.repository.ts`):
```typescript
export interface ICampaignRepository {
  findById(id: string): Promise<CampaignAggregate | null>;
  save(campaign: CampaignAggregate): Promise<void>;
  delete(id: string): Promise<void>;
}
export const CAMPAIGN_REPOSITORY = Symbol('CAMPAIGN_REPOSITORY');
```

**Infrastructure Implementation** (`src/infrastructure/mongo/repositories/campaign.repository.ts`):
```typescript
@Injectable()
export class MongoCampaignRepository implements ICampaignRepository {
  constructor(
    @Inject(CampaignModel.name) private readonly model: Model<CampaignDocument>,
    private readonly uow: MongoUnitOfWork
  ) {}

  async save(campaign: CampaignAggregate): Promise<void> {
    const session = this.uow.getSession();
    await this.model.findByIdAndUpdate(
      campaign.id,
      CampaignMapper.toPersistence(campaign),
      { session, upsert: true }
    );
  }
}
```

**Module Wiring** (`campaign.module.ts`):
```typescript
providers: [
  { provide: CAMPAIGN_REPOSITORY, useClass: MongoCampaignRepository },
  { provide: CAMPAIGN_READ_SERVICE, useClass: MongoCampaignReadService },
],
exports: [CAMPAIGN_REPOSITORY, CAMPAIGN_READ_SERVICE],
```

### Application Service Tokens

```typescript
// src/application/interfaces/index.ts
export const AUTH_JWT_SERVICE = Symbol('AUTH_JWT_SERVICE');
export const LOGGER_SERVICE = Symbol('LOGGER_SERVICE');
export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
export const MAILER_SERVICE = Symbol('MAILER_SERVICE');
export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');
```

Implemented in `InfrastructureModule`:
```typescript
providers: [
  { provide: LOGGER_SERVICE, useClass: WinstonLoggerService },
  { provide: STORAGE_SERVICE, useClass: CloudinaryStorageService },
  { provide: MAILER_SERVICE, useClass: NestjsMailerService },
  { provide: UNIT_OF_WORK, useClass: MongoUnitOfWork },
],
exports: [LOGGER_SERVICE, STORAGE_SERVICE, MAILER_SERVICE, UNIT_OF_WORK],
```

---

## Cross-Cutting Concerns

| Concern | Implementation | Location |
|---------|---------------|----------|
| **Validation** | `ZodValidationPipe` (global APP_PIPE) | `app.module.ts:69` |
| **Error Handling** | `HttpExceptionFilter` (global APP_FILTER) | `app.module.ts:73` |
| **Logging** | `LoggingInterceptor` (global APP_INTERCEPTOR) | `app.module.ts:77` |
| **Transform** | `TransformInterceptor` (snake_case ↔ camelCase) | `app.module.ts:81` |
| **Auth Guard** | `ApiKeyGuard` (global APP_GUARD) | `app.module.ts:86` |
| **Rate Limit** | `ThrottlerModule` (commented out) | `app.module.ts:59` |
| **CORS/Helmet** | `setupApplication()` | `nest-config/app.setup.ts` |
| **Swagger** | Dual docs: `/admin/docs` + `/client/docs` | `nest-config/swagger.setup.ts` |

---

## Event-Driven Architecture

### Domain Events (Event Sourcing)

Aggregates record events via `recordEvent(event)`:

```typescript
// In CampaignAggregate
activate() {
  this.assertCanActivate();
  this.status = ECampaignStatus.ACTIVE;
  this.recordEvent(new CampaignActivatedDomainEvent(this.id, this.enterpriseId));
}
```

### Application Event Handlers

```typescript
// src/application/events/campaign-created.handler.ts
@EventsHandler(CampaignCreatedDomainEvent)
export class CampaignCreatedHandler implements IEventHandler<CampaignCreatedDomainEvent> {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly rmqPublisher: RabbitMQPublisherService
  ) {}

  async handle(event: CampaignCreatedDomainEvent) {
    await this.notificationService.createForAdmins(event);
    await this.rmqPublisher.publish('campaign.created', event);
  }
}
```

Registered in feature modules:
```typescript
// campaign.module.ts
providers: [
  CampaignCreatedHandler,
  CampaignUpdatedHandler,
  // ...
],
```

### RabbitMQ Integration

- **Consumers**: `src/presentation/controllers/rmq/*.controller.ts` with `@MessagePattern()`
- **Publishers**: `RabbitMQPublisherService` via `RabbitMQFactoryService`
- **Config**: File-based consumer config loaded at startup (`setupRabbitMQMicroservice`)

---

## Transaction Management

### Unit of Work (MongoDB Transactions)

```typescript
// MongoUnitOfWork using AsyncLocalStorage
async execute<T>(operation: () => Promise<T>): Promise<T> {
  const existingSession = this.als.getStore();
  if (existingSession) return operation(); // Nested: reuse

  const session = await this.connection.startSession();
  session.startTransaction();
  return this.als.run(session, async () => {
    try {
      const result = await operation();
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  });
}
```

### Usage in Command Handlers

```typescript
@CommandHandler(CreateCampaignCommand)
export class CampaignCreateCommandHandler implements ICommandHandler<CreateCampaignCommand> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY) private readonly repo: ICampaignRepository,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: CreateCampaignCommand) {
    return this.uow.execute(async () => {
      const campaign = CampaignAggregate.create(command.dto);
      await this.repo.save(campaign);
      return campaign.id;
    });
  }
}
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Modular Monolith** | Single deployable, clear module boundaries, can extract services later |
| **DDD + CQRS** | Complex domain (campaigns, payments, proposals) benefits from rich aggregates |
| **Event Sourcing (light)** | Aggregates record events; used for audit + async side effects |
| **Mongoose Discriminators** | User types (Admin/Enterprise/KOL) share base schema with role-specific fields |
| **Zod + nestjs-zod** | Runtime validation matching TypeScript types |
| **Dual Swagger** | Separate Admin/Client API docs for different audiences |
| **AsyncLocalStorage UoW** | Transparent transaction propagation without passing session explicitly |
| **Read Services** | Separate read models for optimized queries (avoid aggregate loading for lists) |
| **Global Guards/Interceptors** | Cross-cutting concerns applied uniformly |

---

## Adding a New Feature

1. **Domain**: Create aggregate/entity/value-object in `src/core/`
2. **Application**: Add Command/Query handlers in `src/application/commands|queries/`
3. **Infrastructure**: 
   - Mongoose schema in `src/infrastructure/mongo/schemas/`
   - Repository in `src/infrastructure/mongo/repositories/`
   - Read service in `src/infrastructure/mongo/read-services/`
   - Register in `mongo.module.ts`
4. **Module**: Create `<feature>.module.ts` in `src/infrastructure/modules/`
5. **Presentation**: Add controllers/resolvers in `src/presentation/controllers/`
6. **Wire**: Import module in `app.module.ts`
7. **Test**: Add tests mirroring structure in `tests/`

---

## Source Map

| Area | Path |
|------|------|
| App bootstrap | `src/main.ts` |
| App module wiring | `src/infrastructure/modules/app.module.ts` |
| Global setup | `src/infrastructure/nest-config/app.setup.ts` |
| Swagger setup | `src/infrastructure/nest-config/swagger.setup.ts` |
| Infrastructure module | `src/infrastructure/modules/infrastructure.module.ts` |
| Mongo module (all schemas/repos) | `src/infrastructure/mongo/mongo.module.ts` |
| UoW implementation | `src/infrastructure/mongo/mongo-uow.ts` |
| Feature modules | `src/infrastructure/modules/*.module.ts` |
| Presentation controllers | `src/presentation/controllers/` |
| Application commands | `src/application/commands/` |
| Application queries | `src/application/queries/` |
| Domain aggregates | `src/core/aggregate-roots/` |
| Domain events | `src/core/events/` |