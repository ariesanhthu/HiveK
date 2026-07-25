# Notification Domain

This document describes the business rules, state machines, domain aggregates, database models, CQRS commands/queries, and end-to-end workflows for the **Notification** domain within the HiveK server.

> **Architecture Pattern**: Clean Architecture + DDD + CQRS + Event Sourcing (light)
> **Last Updated**: 2026-07-24 (refactored to use `IUserReadService`)

---

## Table of Contents

1. [Domain Overview](#1-domain-overview)
2. [Core Layer (Domain Model)](#2-core-layer-domain-model)
3. [State Machines & Status Transitions](#3-state-machines--status-transitions)
4. [Application Layer](#4-application-layer)
5. [Infrastructure Layer](#5-infrastructure-layer)
6. [Presentation Layer](#6-presentation-layer)
7. [Workflow Flows](#7-workflow-flows)
8. [File Map](#8-file-map)
9. [Key Invariants](#9-key-invariants)

---

## 1. Domain Overview

### Purpose

The **Notification** domain delivers system, campaign, enterprise, and platform notifications to users through multiple channels (in-app, email). It manages notification templates, audience targeting (broadcast or direct), and per-user read/dismiss state.

### Bounded Context

```
┌───────────────────────────────────────────────────────────────────┐
│                      Notification Context                         │
│                                                                   │
│  ┌─────────────────────────┐    ┌─────────────────────────┐       │
│  │      NotificationRoot   │    │   UserNotificationRoot  │       │
│  │                         │    │                         │       │
│  │ type | title | content  │    │ notificationId | recipientId│   │
│  │ targetType | targetId   │    │ isRead | readAt | deleteAt│     │
│  └───────────┬─────────────┘    └───────────┬─────────────┘       │
│              │                              │                     │
│              │ notification_id (FK)         │ recipient_id (FK)   │
│              ▼                              ▼                    │
│  ┌─────────────────────────┐    ┌─────────────────────────┐       │
│  │    notifications        │    │   user_notifications    │       │
│  │      collection         │    │      collection         │       │
│  └─────────────────────────┘    └─────────────────────────┘       │
│                                                                   │
│  ┌─────────────────────────┐                                      │
│  │ NotificationDispatched  │    ← Event published when            │
│  │         Event           │      notification needs delivery     │
│  └─────────┬───────────────┘                                      │
│            │                                                      │
│    ┌───────┴───────┐                                              │
│    │               │                                              │
│    ▼               ▼                                             │
│ Email Handler   InApp Handler                                     │
│ (direct email)  Creates notification record and                   │
│                 user-specific receipts in same UoW transaction    │
└───────────────────────────────────────────────────────────────────┘
```

### Key Concepts

| Concept | Type | Description |
|---------|------|-------------|
| `NotificationRoot` | Aggregate Root | Generic notification template/message. Shared across all recipients. |
| `UserNotificationRoot` | Aggregate Root | Per-user notification receipt with read/dismiss state. |
| `NotificationChannel` | Enum | Delivery channel: `in_app`, `email` |
| `NotificationType` | Enum | Category: `system`, `campaign`, `enterprise`, `platform` |
| `ETargetType` | Enum | Optional entity target for navigation/link context |
| `NotificationDispatchedEvent` | Domain Event | Raised when notification should be delivered to recipients |

### Relations to Other Domains

| Domain | Relationship |
|--------|-------------|
| **User/Auth** | Recipients are `User` entities via `recipient_id` FK |
| **Enterprise** | Target entities can reference enterprise; broadcast to enterprise members |
| **Campaign** | Notifications of type `campaign` target campaign entities |

---

## 2. Core Layer (Domain Model)

### 2.1 Aggregate Roots

#### NotificationRoot

**File**: `src/core/aggregate-roots/notification.aggregate.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `type` | `NotificationType` | Category of notification (system, campaign, enterprise, platform) |
| `title` | `string` | Short notification title |
| `content` | `string` | Full notification content/body |
| `targetType` | `Nullable<ETargetType>` | Optional target entity type for navigation |
| `targetId` | `Nullable<string>` | Optional target entity ID for navigation |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last update timestamp |

**Factory Methods**:

| Method | Description |
|--------|-------------|
| `static create(props: NotificationCreateProps)` | Creates a new notification instance. No domain events raised. |
| `static instantiate(id: string, props: NotificationProps)` | Reconstitutes existing instance from persistence. |

**Getters**:

| Getter | Returns | Description |
|--------|---------|-------------|
| `get type()` | `NotificationType` | Notification category |
| `get title()` | `string` | Notification title |
| `get content()` | `string` | Notification content |
| `get targetType()` | `Nullable<ETargetType>` | Optional target type |
| `get targetId()` | `Nullable<string>` | Optional target ID |
| `get createdAt()` | `Date` | Creation time |
| `get updatedAt()` | `Date` | Last update time |

#### UserNotificationRoot

**File**: `src/core/aggregate-roots/user-notification.aggregate.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `notificationId` | `string` | FK to Notification aggregate |
| `recipientId` | `string` | FK to User entity |
| `isRead` | `boolean` | Whether user has read the notification |
| `readAt` | `Nullable<Date>` | When notification was marked as read |
| `deleteAt` | `Nullable<Date>` | Soft-delete timestamp |
| `deleteBy` | `Nullable<string>` | Who performed the soft-delete |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last update timestamp |

**Factory Methods**:

| Method | Description |
|--------|-------------|
| `static create(props: UserNotificationCreateProps)` | Creates unread receipt; `isRead=false`, `readAt=deleteAt=deleteBy=null` |
| `static instantiate(id: string, props: UserNotificationProps)` | Reconstitutes from persistence. |

**Domain Methods**:

| Method | Description |
|--------|-------------|
| `markAsRead()` | Sets `isRead=true`, `readAt=now`. No-op if already read. |
| `softDelete(deletedBy: string)` | Sets `deleteAt=now`, `deleteBy=deletedBy` |
| `restore()` | Clears `deleteAt` and `deleteBy` to null |

**Getters**:

| Getter | Returns | Description |
|--------|---------|-------------|
| `get notificationId()` | `string` | Linked notification ID |
| `get recipientId()` | `string` | Recipient user ID |
| `get isRead()` | `boolean` | Read status |
| `get readAt()` | `Nullable<Date>` | When read |
| `get deleteAt()` | `Nullable<Date>` | Soft-delete time |
| `get deleteBy()` | `Nullable<string>` | Who deleted |
| `get createdAt()` | `Date` | Creation time |
| `get updatedAt()` | `Date` | Last update time |

---

### 2.2 Entities

No entities in this domain — both roots are aggregate roots.

---

### 2.3 Value Objects

No value objects in this domain.

---

### 2.4 Enums

#### `NotificationType`

**File**: `src/core/enums/notification-type.enum.ts`

| Member | Value | Description |
|--------|-------|-------------|
| `SYSTEM` | `'system'` | System-level notifications |
| `CAMPAIGN` | `'campaign'` | Campaign-related notifications |
| `ENTERPRISE` | `'enterprise'` | Enterprise-related notifications |
| `PLATFORM` | `'platform'` | Platform-wide announcements |

#### `NotificationChannel`

**File**: `src/core/enums/notification-channel.enum.ts`

| Member | Value | Description |
|--------|-------|-------------|
| `IN_APP` | `'in_app'` | In-app notification displayed in UI |
| `EMAIL` | `'email'` | Email delivery via mailer service |

#### `ETargetType`

**File**: `src/core/enums/target-type.enum.ts`

| Member | Value | Description |
|--------|-------|-------------|
| `USER` | `'user'` | Links to a user profile |
| `KOL_PROFILE` | `'kol_profile'` | Links to KOL profile |
| `PLATFORM` | `'platform'` | Links to platform entity |
| `CAMPAIGN` | `'campaign'` | Links to campaign |
| `ENTERPRISE` | `'enterprise'` | Links to enterprise |
| `CAMPAIGN_PARTICIPANT` | `'campaign_participant'` | Links to participant |
| `SCHEDULED_POST` | `'scheduled_post'` | Links to scheduled post |

---

### 2.5 Domain Events

| Event | Raised By | Payload | Consumer |
|-------|-----------|---------|----------|
| `NotificationDispatchedEvent` | `NotificationSendCommandHandler` | `type`, `title`, `content`, `targetType`, `targetId`, `recipientIds`, `channels` | `EmailNotificationHandler`, `InAppNotificationHandler` |

---

### 2.6 Domain Exceptions

| Exception | Thrown When |
|-----------|-------------|
| `NotificationNotFoundException` | Notification with given ID not found |
| `NotificationForbiddenException` | User lacks permission for notification operation |

---

## 3. State Machines & Status Transitions

### 3.1 Read Status (`isRead`)

UserNotificationRoot supports read/unread state transitions:

```
┌─────────────┐
│   UNREAD    │
│  (isRead=false)
└──────┬──────┘
       │ markAsRead()
       ▼
┌─────────────┐
│    READ     │
│  (isRead=true)
└─────────────┘
```

**Transitions**:

| From | To | Method | Conditions |
|------|----|--------|------------|
| `UNREAD` | `READ` | `markAsRead()` | No-op if already read |
| `READ` | `UNREAD` | Repository `updateReadStatus()` | Direct DB update (no domain method) |

### 3.2 Delete Status (`deleteAt`)

UserNotificationRoot supports soft-delete/restore lifecycle:

```
┌─────────────────┐
│   ACTIVE        │
│ (deleteAt=null)
└───────┬─────────┘
        │ softDelete(deletedBy)
        ▼
┌─────────────────┐
│   DELETED       │
│(deleteAt=Date)
└───────┬─────────┘
        │ restore()
        ▼
┌─────────────────┐
│   ACTIVE        │
│ (deleteAt=null)
└─────────────────┘
```

**Transitions**:

| From | To | Method | Conditions |
|------|----|--------|------------|
| `ACTIVE` | `DELETED` | `softDelete(deletedBy)` | Can delete any notification |
| `DELETED` | `ACTIVE` | `restore()` | Must be owner (same recipient) |

**Constraints**:
- Hard delete bypasses state machine; permanently removes record
- Delete/restore operations filter by recipient ID for ownership

---

## 4. Application Layer

### 4.1 Commands (Write Side)

| Command | Handler | DTO | Description |
|---------|---------|-----|-------------|
| `NotificationSendCommand` | `NotificationSendCommandHandler` | **No DTO** (internal) | Dispatches notification to audience via channels |
| `NotificationUpdateReadStatusCommand` | `NotificationUpdateReadStatusCommandHandler` | `NotificationUpdateReadStatusDto` | Marks notifications as read/unread (all or specific) |
| `NotificationSoftDeleteCommand` | `NotificationSoftDeleteCommandHandler` | `NotificationSoftDeleteDto` | Soft deletes notifications (dismisses) |
| `NotificationRestoreCommand` | `NotificationRestoreCommandHandler` | `NotificationRestoreDto` | Restores soft-deleted notifications |
| `NotificationHardDeleteCommand` | `NotificationHardDeleteCommandHandler` | `NotificationHardDeleteDto` | Permanently deletes notifications |

**Command Flow Architecture**:
```
Client/Consumer
  │
  ▼
Controller or RMQ Consumer
  │ Validate DTO (Zod schema) or use direct props
  ▼
CommandBus.execute(new Notification*Command(...))
  │
  ▼
Notification*Handler.execute()
  ├─ (Send) Uses IUserReadService:
  │     - admin → userReadService.findByRoleType(ERoleType.ADMIN)
  │     - enterprise → userReadService.findByEnterprise(enterpriseId)
  │     - all → userReadService.findAllActive()
  │     - direct → uses provided userIds
  │     Then publishes NotificationDispatchedEvent
  ├─ (CRUD) this.uow.execute(async () => {
  │     // For InApp handler triggered by event:
  │     const notification = NotificationRoot.create(props);
  │     await notificationRepository.save(notification);
  │     const userNotifications = recipientIds.map(...)
  │     await userNotificationRepository.saveMany(userNotifications);
  │   });
  │
  ▼
Response
```

### 4.2 Queries (Read Side)

| Query | Handler | Description |
|-------|---------|-------------|
| `NotificationGetListQuery` | `NotificationGetListQueryHandler` | Paginated list of user notifications with filter |

**Query Flow Architecture**:
```
GET /api/v1/...
  │
  ▼
Controller.method()
  │
  ▼
QueryBus.execute(new NotificationGetListQuery(filters))
  │
  ▼
NotificationGetListQueryHandler
  └─ MongoNotificationReadService.findAll(filters)
       │
       └─ Aggregate on user_notifications + join notifications
            │
            └─ Returns paginated NotificationDto[]
```

### 4.3 Application Services

No dedicated application services — notification delivery is handled via event handlers.

### 4.4 Mappers

No explicit mappers; mapping is inline in repository implementations:
- `MongoNotificationRepository.mapToDomain()` / `mapToPersistence()`
- `MongoUserNotificationRepository.mapToDomain()` / `mapToPersistence()`

---

## 5. Infrastructure Layer

### 5.1 Data Model (Mongoose Schemas)

#### `notifications` Collection

**Schema File**: `src/infrastructure/mongo/schemas/notification.schema.ts`

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` (enum) | Notification category |
| `title` | `string` | Notification title |
| `content` | `string` | Notification content |
| `target_type` | `ETargetType` | Optional navigation target type |
| `target_id` | `string` | Optional navigation target ID |

**Indexes**:
- `{ _id: 1 }` — Primary lookup (Mongoose default index)
- `{ type: 1 }` — Filter by notification category

#### `user_notifications` Collection

**Schema File**: `src/infrastructure/mongo/schemas/user-notification.schema.ts`

| Field | Type | Description |
|-------|------|-------------|
| `notification_id` | `ObjectId` (ref: notifications) | Linked notification |
| `recipient_id` | `ObjectId` (ref: users) | Recipient user |
| `is_read` | `boolean` | Read status |
| `read_at` | `Date` | When read |
| `delete_at` | `Date` | Soft-delete timestamp |
| `delete_by` | `string` | Who deleted |

**Indexes**:
- `{ _id: 1 }` — Primary lookup (Mongoose default index)
- `{ recipient_id: 1, delete_at: 1 }` — Find active notifications by recipient
- `{ recipient_id: 1, is_read: 1 }` — Filter by read status for recipient

### 5.2 Repository Implementations

| Implementation | File | Implements |
|----------------|------|------------|
| `MongoNotificationRepository` | `src/infrastructure/mongo/repositories/notification.repository.ts` | `INotificationRepository` |
| `MongoUserNotificationRepository` | `src/infrastructure/mongo/repositories/user-notification.repository.ts` | `IUserNotificationRepository` |

**MongoNotificationRepository Methods**:

| Method | Description |
|--------|-------------|
| `findById(id)` | Find by notification ID |
| `save(aggregate)` | Create or update notification; uses UoW session |
| `saveMany(aggregates)` | Batch save (not commonly used) |
| `delete(id)` | Hard delete by ID |

**MongoUserNotificationRepository Methods**:

| Method | Description |
|--------|-------------|
| `findById(id)` | Find by user notification ID |
| `save(aggregate)` | Create or update user notification |
| `saveMany(aggregates)` | Batch create user notifications with ID assignment |
| `markAll(recipientId, isRead)` | Update read status for all user notifications |
| `updateReadStatus(ids, recipientId, isRead)` | Batch update specific notifications |
| `softDeleteMany(ids, recipientId, deletedBy)` | Soft-delete with ownership filter |
| `restoreMany(ids, recipientId)` | Restore with ownership filter |
| `hardDeleteMany(ids, recipientId)` | Permanent deletion with ownership filter |

### 5.3 Read Service Implementations

| Implementation | File | Implements |
|----------------|------|------------|
| `MongoNotificationReadService` | `src/infrastructure/mongo/read-services/notification.read-service.ts` | `INotificationReadService` |
| `MongoUserReadService` | `src/infrastructure/mongo/read-services/user.read-service.ts` | `IUserReadService` |

**MongoUserReadService Methods**:

| Method | Description |
|--------|-------------|
| `findByRoleType(type)` | Fetch all active user IDs by role type |
| `findByEnterprise(enterpriseId)` | Fetch all active enterprise member IDs |
| `findAllActive()` | Fetch all active user IDs |

**Methods**:

| Method | Description |
|--------|-------------|
| `findAll(filters)` | Paginated list with cursor, recipientId, isRead filters; joins notifications collection |
| `findById(id)` | Single notification with full payload |

### 5.4 Module Wiring

**File**: `src/infrastructure/modules/notification.module.ts`

```typescript
@Module({
  imports: [CqrsModule, EnterpriseModule],
  controllers: [NotificationAdminController, NotificationClientController],
  providers: [
    // Command Handlers
    NotificationSendCommandHandler,
    NotificationUpdateReadStatusCommandHandler,
    NotificationSoftDeleteCommandHandler,
    NotificationRestoreCommandHandler,
    NotificationHardDeleteCommandHandler,
    // Query Handlers
    NotificationGetListQueryHandler,
    // Event Handlers
    InAppNotificationHandler,
    EmailNotificationHandler,
    // RMQ Controller (provides handlers for RabbitMQ messages)
    NotificationRmqController,
  ],
  exports: [],
})
export class NotificationModule { }
```

---

## 6. Presentation Layer

### 6.1 REST Endpoints

#### Admin Notifications — `/api/v1/admin/notifications`

| Method | Path | Guards | Controller | Description |
|--------|------|--------|------------|-------------|
| `GET` | `/` | 🔒 `JwtAuth` + `Roles(ADMIN)` | `NotificationAdminController.findAll()` | Get current admin's notifications |
| `PATCH` | `/read-status` | 🔒 `JwtAuth` + `Roles(ADMIN)` | `NotificationAdminController.updateReadStatus()` | Mark as read/unread (all or specific) |
| `PATCH` | `/soft-delete` | 🔒 `JwtAuth` + `Roles(ADMIN)` | `NotificationAdminController.softDelete()` | Dismiss notifications |
| `PATCH` | `/restore` | 🔒 `JwtAuth` + `Roles(ADMIN)` | `NotificationAdminController.restore()` | Restore dismissed notifications |
| `DELETE` | `/hard-delete` | 🔒 `JwtAuth` + `Roles(ADMIN)` | `NotificationAdminController.hardDelete()` | Permanently delete notifications |

#### Client Notifications — `/api/v1/client/notifications`

| Method | Path | Guards | Controller | Description |
|--------|------|--------|------------|-------------|
| `GET` | `/` | 🔒 `JwtAuth` | `NotificationClientController.findAll()` | Get current user's notifications |
| `PATCH` | `/status` | 🔒 `JwtAuth` | `NotificationClientController.updateReadStatus()` | Mark as read/unread |
| `PATCH` | `/soft-delete` | 🔒 `JwtAuth` | `NotificationClientController.softDelete()` | Dismiss notifications |
| `PATCH` | `/restore` | 🔒 `JwtAuth` | `NotificationClientController.restore()` | Restore dismissed notifications |
| `DELETE` | `/hard-delete` | 🔒 `JwtAuth` | `NotificationClientController.hardDelete()` | Permanently delete notifications |

### 6.2 RabbitMQ Event Handlers

**File**: `src/presentation/controllers/rmq/notification.rmq.controller.ts`

| Pattern | Method | Description |
|---------|--------|-------------|
| `notification.verification_otp` | `handleSendVerificationOtpEmail()` | Sends OTP verification email |
| `notification.enterprise_invitation` | `handleSendEnterpriseInvitationEmail()` | Notifies user added to enterprise |
| `notification.enterprise_revocation` | `handleSendEnterpriseRevocationEmail()` | Notifies user revoked from enterprise |

### 6.3 Guard Stack

The following guard hierarchy applies to all protected routes:

| Layer | Guard | Bypass |
|-------|-------|--------|
| 1 (global) | `ApiKeyGuard` | `@Public()`, `@WebHook()` |
| 2 | `JwtAuthGuard` | `@Public()`, `@WebHook()` |
| 3 | `RolesGuard` | `@Public()`, `@WebHook()` |
| 4 | `UserVerifiedGuard` | `@Public()`, `@WebHook()` |

- `@Public()` — Bypasses all guards entirely
- `@WebHook()` — Bypasses JWT and API key guards for server-to-server webhooks

---

## 7. Workflow Flows

### 7.1 Send Notification (Broadcast/Direct)

#### Diagram

```
┌─────────────┐
│   Producer  │
│(HTTP/RMQ)    │
└──────┬──────┘
       │ NotificationSendCommand(type, title, content, channels, audience)
       ▼
┌──────────────────────────────┐
│ Presentation Layer             │
│  ┌─────────────────────────┐ │
│  │ NotificationSendHandler   │ │
│  │ execute()               │ │
│  │   ├── Validate audience │ │
│  │   ├── Query users        │ │
│  │   └── Publish event      │ │
│  └──────────┬──────────────┘ │
└─────────────┼────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Application Layer            │
│  ┌─────────────────────────┐ │
│  │ NotificationDispatched    │ │
│  │ Event → EventBus        │ │
│  └──────────┬──────────────┘ │
└─────────────┼────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌──────────┐      ┌──────────────┐
│ Email    │      │ In-App       │
│ Handler  │      │ Handler      │
│        │      │              │
│ ┌──────┼─────┐│ ┌────────────┼──────┐
│ │ Check │     ││ │ Check IN_APP│      │
│ │ EMAIL │     ││ │ in channels │      │
│ └──────┼─────┘│ └────────────┼──────┘
│        │      ││            │      │
│ ┌──────┼─────┐│ ┌────────────┼──────┐
│ │ Query │     ││ │ uow.execute │      │
│ │ users │     ││ │ ┌──────────┼──────┐│
│ └──────┼─────┘│ │ │ │ Create  │      ││
│        │      ││ │ │ │Notification│      ││
│ ┌──────┼─────┐│ │ │ │Root.create│      ││
│ │ Send  │     ││ │ │ └──────────┼──────┘│
│ │ email │     ││ │ │          │      ││
│ └──────┼─────┘│ │ │ ┌──────────┼──────┐│
│        │      ││ │ │ │ Save to  │      ││
│        ▼      ││ │ │ │notifications│   ││
│ ┌──────────┐  ││ │ │ └──────────┼──────┘│
│ │Mailer     │  ││ │ │          │      ││
│ │sendMail() │  ││ │ ┌──────────┼──────┐│
│ └──────────┘  ││ │ │ │ SaveMany │      ││
│               ││ │ │ │to user_  │      ││
│               ││ │ │ │notifications│    ││
│               ││ │ │ └──────────┼──────┘│
│               ││ │ └──────────┴──────┘│
│               ││ └──────────────────────┘│
│               │└─────────────────────────┘│
│               └───────────────────────────┘
│                                         │
│              Response complete            │
└──────────────────────────────────────────┘
```

#### Step-by-Step

1. **Command dispatch** — `CommandBus.execute(new NotificationSendCommand({...}))`
2. **Handler resolves recipients** via `IUserReadService`:
   - `broadcastType: 'direct'` → uses provided `userIds` array directly
   - `broadcastType: 'admin'` → calls `userReadService.findByRoleType(ERoleType.ADMIN)`
   - `broadcastType: 'enterprise'` → calls `userReadService.findByEnterprise(enterpriseId)` + adds owner
   - `broadcastType: 'all'` → calls `userReadService.findAllActive()`
3. **Event published** — `NotificationDispatchedEvent` with payload and recipient IDs
4. **Email handler** (if `EMAIL` in channels):
   - Filters event for EMAIL channel
   - Queries active users by recipient IDs
   - Sends emails via `MailerService.sendMail()`
5. **In-App handler** (if `IN_APP` in channels):
   - Filters event for IN_APP channel
   - Opens UoW transaction
   - Creates `NotificationRoot.create(props)` saved to `notifications` collection
   - Creates `UserNotificationRoot.create()` for each recipient, saved via `saveMany()`
   - Commits transaction atomically

### 7.2 Get Notification List

#### Diagram

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ GET /api/v1/client/notifications?cursor=xx&isRead=true
       ▼
┌──────────────────────────────┐
│ Presentation Layer           │
│  ┌─────────────────────────┐ │
│  │ NotificationClientController││
│  │ ├── JwtAuthGuard        │ │
│  │ ├── getCurrentUserId()  │ │
│  │ └── QueryBus.execute()  │ │
│  └──────────┬──────────────┘ │
└─────────────┼────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Application Layer            │
│  ┌─────────────────────────┐ │
│  │ NotificationGetListQuery│ │
│  │ Handler.execute()       │ │
│  └──────────┬──────────────┘ │
└─────────────┼────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Infrastructure Layer         │
│  ┌─────────────────────────┐ │
│  │ MongoNotificationRead   │ │
│  │ Service.findAll()       │ │
│  │   ├── Build match query │ │
│  │   ├── Aggregate pipeline ││
│  │   │   with $lookup to   ││
│  │   │   notifications coll ││
│  │   └── Map to DTO        │ │
│  └─────────────────────────┘ │
└─────────────┬────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Response                     │
│  ┌─────────────────────────┐ │
│  │ PaginatedResponseDto    │ │
│  │ { items[], nextCursor,   │ │
│  │   hasNextPage, limit }  │ │
│  └─────────────────────────┘ │
└──────────────────────────────┘
```

#### Step-by-Step

1. **Client requests** — `GET /api/v1/client/notifications` with optional filters
2. **Guard validates** — `JwtAuthGuard` ensures valid JWT, extracts `userId`
3. **Controller receives** — Sets `recipientId` from current user, passes to query
4. **Query dispatched** — `QueryBus.execute(new NotificationGetListQuery(filters))`
5. **Read service executes** — `MongoNotificationReadService.findAll()`:
   - Builds `matchStage` with `delete_at: null`, `recipient_id`, `is_read` filters
   - Uses cursor-based pagination via `_id < cursor`
   - Aggregates `user_notifications` collection with `$lookup` into `notifications`
   - Maps joined results to `NotificationDto`
6. **Paginated response** — Returns `PaginatedResponseDto<NotificationDto>`

### 7.3 Mark Read / Soft Delete / Restore

#### Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ PATCH /api/v1/client/notifications/read-status
       ▼
┌──────────────────────────────┐
│ Presentation Layer           │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Application Layer            │
│  ┌─────────────────────────┐ │
│  │ Notification*Handler    │ │
│  │ execute()               │ │
│  │   └── repo.*Many(ids,    │ │
│  │       userId, ...)       │ │
│  └─────────────────────────┘ │
└──────────────────────────────┘
```

#### Step-by-Step

1. **Client sends PATCH** — With array of `ids` and `isRead`/`deletedBy`
2. **Controller extracts** — Current `userId` from JWT
3. **Command dispatched** — `CommandBus.execute(new Notification*Command(ids, userId))`
4. **Handler executes** — **No UoW** (direct DB updates):
   - `updateReadStatus(ids, userId, isRead)` — Updates `is_read` and `read_at`
   - `softDeleteMany(ids, userId, deletedBy)` — Sets `delete_at`, `delete_by`
   - `restoreMany(ids, userId)` — Clears `delete_at`, `delete_by`
   - `hardDeleteMany(ids, userId)` — Permanently removes records

---

## 8. File Map

| Layer | File | Responsibility |
|-------|------|---------------|
| **Core** | `src/core/aggregate-roots/notification.aggregate.ts` | Generic notification template aggregate |
| **Core** | `src/core/aggregate-roots/user-notification.aggregate.ts` | Per-user notification receipt aggregate |
| **Core** | `src/core/enums/notification-type.enum.ts` | Notification category enum |
| **Core** | `src/core/enums/notification-channel.enum.ts` | Delivery channel enum |
| **Core** | `src/core/enums/target-type.enum.ts` | Target entity type enum (shared) |
| **Core** | `src/core/exceptions/notification.exception.ts` | Notification-specific exceptions |
| **Core** | `src/core/interfaces/repositories/notification.repository.ts` | INotificationRepository interface |
| **Core** | `src/core/interfaces/repositories/user-notification.repository.ts` | IUserNotificationRepository interface |
| **Application** | `src/application/commands/notification-send/notification-send.command.ts` | Send command definition |
| **Application** | `src/application/commands/notification-send/notification-send.handler.ts` | Send handler (uses `IUserReadService`) |
| **Application** | `src/application/commands/notification-hard-delete/` | Hard delete command, dto, handler |
| **Application** | `src/application/commands/notification-soft-delete/` | Soft delete command, dto, handler |
| **Application** | `src/application/commands/notification-restore/` | Restore command, dto, handler |
| **Application** | `src/application/commands/notification-update-read-status/` | Update read status command, dto, handler |
| **Application** | `src/application/dtos/notification.dto.ts` | Notification DTOs and filter |
| **Application** | `src/application/interfaces/read-service/notification.read-service.interface.ts` | INotificationReadService interface |
| **Application** | `src/application/queries/notification-get-list/` | Query and handler for listing |
| **Application** | `src/application/events/notification-dispatched/` | Dispatched event + email/in-app handlers |
| **Infrastructure** | `src/infrastructure/mongo/schemas/notification.schema.ts` | Notification Mongoose schema (+index) |
| **Infrastructure** | `src/infrastructure/mongo/schemas/user-notification.schema.ts` | User notification Mongoose schema (+indexes) |
| **Infrastructure** | `src/infrastructure/mongo/repositories/notification.repository.ts` | MongoNotificationRepository |
| **Infrastructure** | `src/infrastructure/mongo/repositories/user-notification.repository.ts` | MongoUserNotificationRepository |
| **Infrastructure** | `src/infrastructure/mongo/read-services/notification.read-service.ts` | MongoNotificationReadService |
| **Infrastructure** | `src/infrastructure/mongo/read-services/user.read-service.ts` | MongoUserReadService (extended) |
| **Infrastructure** | `src/infrastructure/modules/notification.module.ts` | Notification module wiring |
| **Presentation** | `src/presentation/controllers/http/admin/notification.controller.ts` | Admin REST endpoints |
| **Presentation** | `src/presentation/controllers/http/client/notification.controller.ts` | Client REST endpoints |
| **Presentation** | `src/presentation/controllers/rmq/notification.rmq.controller.ts` | RabbitMQ message handlers |

---

## 9. Key Invariants

- **Notification audience must be resolved**: Broadcast type `direct` requires `userIds`, `enterprise` requires `enterpriseId`
- **In-app delivery is atomic**: Creates notification + all user receipts in same UoW transaction
- **Ownership enforced for deletion**: All `user_notification` mutations filter by `recipient_id` to prevent cross-user modification
- **Soft-delete allows restore**: Notifications can be restored unless perm-deleted
- **Read status is idempotent**: `markAsRead()` is no-op if already read
- **Email delivery is best-effort**: Failed emails log errors but don't fail the entire operation
- **DTO uses user_notification._id for FE operations**: The `id` in `NotificationDto` is the `user_notification._id` for mark/delete operations