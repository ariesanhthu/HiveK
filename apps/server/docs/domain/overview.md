# Domain Architecture & Model Mapping

This document provides a comprehensive overview of the domains, aggregate roots, command/query interfaces, and persistence models within `apps/server`.

The project is structured following **Domain-Driven Design (DDD)** and **CQRS (Command Query Responsibility Segregation)**.

---

## 1. User & Authentication Domain

Responsible for user accounts, role-based access control (RBAC), and authentication sessions (JWT & Google OAuth).

### Model Relations

*   **UserRoot** (`src/core/aggregate-roots/user.aggregate.ts`)
    *   `id` (string): Unique identifier.
    *   `email` (string): Contact/login email.
    *   `passwordHash` (string): Encrypted credentials.
    *   `roleId` (string): References a `RoleRoot` entity.
    *   `status` (string): Account status (active/inactive).
    *   `profile` (Profile): Embedded value object with user personal info.
*   **RoleRoot** (`src/core/aggregate-roots/role.aggregate.ts`)
    *   `id` (string): Unique identifier.
    *   `name` (string): Role name.
    *   `permissions` (string[]): Set of permission strings allowed for this role.

### Key Components

*   **Aggregate Roots**:
    *   `UserRoot` (`src/core/aggregate-roots/user.aggregate.ts`): Manages authentication and account status.
    *   `RoleRoot` (`src/core/aggregate-roots/role.aggregate.ts`): Defines roles and specific permissions for RBAC.
    *   `AdminRoot` (`src/core/aggregate-roots/admin.aggregate.ts`): Dedicated admin entity.
*   **Commands (Write Operations)**:
    *   `AuthSignUp`: Handles registration and initial profile setup.
    *   `AuthSignIn`: Authenticates credentials, returns access & refresh tokens.
    *   `AuthGoogleSignIn`: Authenticates through Google OAuth2.
    *   `AuthRefreshToken`: Rotates expired access tokens.
    *   `AuthResetPassword`: Handles forgotten password recovery.
    *   `UserCreate` / `UserUpdate` / `UserUpdateProfile` / `UserSoftDelete` / `UserRestore`.
    *   `RoleCreate` / `RoleUpdate` / `RoleSoftDelete` / `RoleRestore`.
*   **Queries (Read Operations)**:
    *   `AuthGetProfile`: Retrieves current authenticated user context.
    *   `UserGetById` / `UserGetList`: Bypasses domain aggregates via `UserReadService` to return optimized DTO projections.
    *   `RoleGetById` / `RoleGetList`.
*   **Persistence Models (Mongoose)**:
    *   `UserModel` (`src/infrastructure/mongo/schemas/user.schema.ts`)
    *   `RoleModel` (`src/infrastructure/mongo/schemas/role.schema.ts`)

---

## 2. Campaign Domain

Manages marketing campaigns launched by Enterprises, including product briefs, budget/pricing details, targets, channels, and participant KOLs.

### Model Relations

*   **CampaignRoot** (`src/core/aggregate-roots/campaign.aggregate.ts`)
    *   `id` (string): Unique identifier.
    *   `ownerId` (string): Creator's User ID.
    *   `enterpriseId` (string): Target Enterprise ID.
    *   `campaign` (CampaignDetail): Value object outlining name, type, dates, objective, description.
    *   `targeting` (Targeting): Value object specifying audience targets (age range, locations, interests).
    *   `campaignItems` (CampaignItem[]): List of products and channels being tracked.
    *   `raw` (RawInference[]): Temporary crawled text and inference insights.
*   **CampaignItem** (Value Object)
    *   `product` (Product): Product details (name, category, brand, features, keywords, price segment).
    *   `marketing` (Marketing): Marketing brief parameters (angle, content style, tone, key messages).
    *   `pricing` (Pricing): Original price, sale price, currency.
    *   `promotion` (Promotion): Promotion details.
    *   `channels` (Channel[]): Platforms and URLs allocated for this specific item.

### Key Components

*   **Aggregate Roots**:
    *   `CampaignRoot` (`src/core/aggregate-roots/campaign.aggregate.ts`): Encapsulates campaign objectives, target audience, and items containing products, target platforms/channels, and price/promotion packages.
*   **Commands (Write Operations)**:
    *   `CampaignCreate`: Parses brief details, targeting, and items to create a campaign.
    *   `CampaignUpdate`: Modifies campaign attributes, targeting, or products.
    *   `CampaignSoftDelete` / `CampaignHardDelete` / `CampaignRestore`.
*   **Queries (Read Operations)**:
    *   `CampaignGetById` / `CampaignGetList`: Directly retrieves campaign data projections and filters via `CampaignReadService`.
*   **Persistence Models (Mongoose)**:
    *   `CampaignModel` (`src/infrastructure/mongo/schemas/campaign.schema.ts`)

---

## 3. KOL Profile & Platform Domain

Enables KOLs/KOCs to build profiles, link social media channels, verify account handles, and showcase historical performance statistics.

### Model Relations

*   **KolProfileRoot** (`src/core/aggregate-roots/kol-profile.aggregate.ts`)
    *   `id` (string): Unique identifier.
    *   `userId` (string): Links user account context.
    *   `fullName` (string)
    *   `avatar` (string)
    *   `channels` (KolPlatformInfo[]): Social media connections. Each channel maps back to a specific `PlatformRoot` via its platform code/ID.
*   **PlatformRoot** (`src/core/aggregate-roots/platform.aggregate.ts`)
    *   `id` (string): Unique identifier.
    *   `name` (string): Platform display name (e.g. TikTok).
    *   `code` (string): String code identifier.
    *   `iconUrl` (string)

### Key Components

*   **Aggregate Roots**:
    *   `KolProfileRoot` (`src/core/aggregate-roots/kol-profile.aggregate.ts`): Contains basic influencer metadata, categories, and connected platforms.
    *   `PlatformRoot` (`src/core/aggregate-roots/platform.aggregate.ts`): Configures supported platforms (TikTok, Instagram, Facebook).
*   **Commands (Write Operations)**:
    *   `KolProfileUpdate`: Updates categories, biography, and metadata.
    *   `KolProfileVerifyPlatformAccount`: Integrates and validates a new social channel (e.g. fetching TikTok handle info).
    *   `PlatformCreate` / `PlatformUpdate` / `PlatformSoftDelete` / `PlatformRestore`.
*   **Queries (Read Operations)**:
    *   `KolProfileGetById` / `KolProfileGetList`: Returns aggregated profiles.
    *   `PlatformGetById` / `PlatformGetList`.
*   **Persistence Models (Mongoose)**:
    *   `KolProfileModel` (`src/infrastructure/mongo/schemas/kol-profile.schema.ts`)
    *   `PlatformModel` (`src/infrastructure/mongo/schemas/platform.schema.ts`)

---

## 4. Notifications & Media Domains

Handles live event distribution via WebSockets, asynchronous messaging through RabbitMQ, and file upload storage.

### Key Components

*   **Aggregate Roots**:
    *   `NotificationRoot` (`src/core/aggregate-roots/notification.aggregate.ts`): Outlines system notification template.
    *   `UserNotificationRoot` (`src/core/aggregate-roots/user-notification.aggregate.ts`): Traces notifications delivered to individual users and read states.
    *   `UploadedFileRoot` (`src/core/aggregate-roots/uploaded-file.aggregate.ts`): Stores file records (URL, provider like Cloudinary, file type).
*   **Commands (Write Operations)**:
    *   `SendNotification`: Creates and broadcasts a notification. Emits realtime WebSocket events.
    *   `MarkNotificationRead` / `MarkAllNotificationsRead`: Sets read indicators.
    *   `UploadedFileCreate` / `UploadedFileDelete`.
*   **Queries (Read Operations)**:
    *   `NotificationGetList`: Fetches notification inbox for the current user.
    *   `UploadedFileGetById` / `UploadedFileGetList`.
*   **Persistence Models (Mongoose)**:
    *   `NotificationModel` (`src/infrastructure/mongo/schemas/notification.schema.ts`)
    *   `UserNotificationModel` (`src/infrastructure/mongo/schemas/user-notification.schema.ts`)
    *   `UploadedFileModel` (`src/infrastructure/mongo/schemas/uploaded-file.schema.ts`)
