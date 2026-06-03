# KOL Onboarding & Platform Verification Flow

This document details the step-by-step process of onboarding a KOL, linking social media accounts, and verifying identity using OAuth strategies and CQRS commands.

---

## 1. Flow Description (Step-by-Step)

Here is the sequential execution flow when a KOL links their platform account:

1.  **OAuth Initialization**: The KOL initiates the connection of a social media account (e.g. YouTube, Instagram) in the client app. The request routes to the server's Passport OAuth strategy, passing the current authenticated user's ID as the `state` query parameter.
2.  **Callback Validation**: The OAuth callback executes. The strategy verifies the session token and fetches platform profile data (external channel ID, display name, email, etc.) from the third-party provider.
3.  **Command Execution**: The strategy executes the `KolProfileVerifyPlatformAccountCommand` on the CQRS Command Bus.
4.  **Platform Verification & DB Search**:
    *   The handler queries the database to check if a profile already has this social connection verified (via platform ID & external ID).
    *   **Case 1 (Profile exists)**: This channel has already been crawled or connected. The handler links the current user to that profile via `profile.linkUser(userId, 'OAUTH')` and updates verification status.
    *   **Case 2 (Profile does not exist)**:
        *   The handler checks if the current user already has a partial KOL profile.
        *   If the user **has a profile**: The handler appends a new `KolPlatformInfo` value object (initialized with 0 metrics) using `profile.addPlatform()`.
        *   If the user **does not have a profile**: The handler creates a brand new `KolProfileEntity` with `KolProfileEntity.create()`.
5.  **Crawl Scheduling**: For all new channel integrations (Case 2), the handler publishes a `'crawl_platform_data'` message to the RabbitMQ messaging queue containing:
    *   `platformId`
    *   `externalId`
    *   `uniqueId`
    *   `kolProfileId`
6.  **Response**: The system saves changes to the database and returns a `KolProfileDto` back to the controller. The onboarding flow finishes, and the crawler worker will update metrics asynchronously in the background.

---

## 2. Key Components

### A. Passport OAuth Strategies
*   **Path**: `src/infrastructure/auth/strategies/` (e.g., `youtube.strategy.ts`, `facebook.strategy.ts`, `twitter.strategy.ts`).
*   **Behavior**:
    1.  Receives the OAuth callback from the platform.
    2.  Extracts the initiating `userId` from `req.query.state`.
    3.  Extracts user profile details (ID, email, displayName) returned from the OAuth provider.
    4.  Triggers `KolProfileVerifyPlatformAccountCommand`.

### B. Command: `KolProfileVerifyPlatformAccountCommand`
*   **Path**: `src/application/commands/kol-profile-verify-platform-account/`
*   **Implementation Details**:
    *   **Phase 1: Existing Connection Lookup**:
        Queries the DB to check if a profile already has this social connection verified (`findByPlatformInfo(platformId, externalId)`). If found, it simply links the `userId` to that profile.
    *   **Phase 2: User Profile Validation**:
        If not found, it checks if the current user already possesses a partial profile. It then initializes a new `KolPlatformInfo` value object with default metrics (followers, engagement rate at 0).
        *   If the profile exists: it appends the platform.
        *   If not: it creates a new `KolProfileEntity` using `KolProfileEntity.create()`.
    *   **Phase 3: Triggering Crawl Task**:
        If a new platform connection was registered, the command issues a message to the crawler queue:
        ```typescript
        this.mqService.emit('crawl_platform_data', {
          platformId,
          externalId,
          uniqueId,
          kolProfileId: profile.id,
        });
        ```
        This task instructs the Python scraping node to crawl historical metrics and update the database profile asynchronously.
