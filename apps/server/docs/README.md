# HiveKOC Developer Documentation Portal

Welcome to the backend server developer documentation for the HiveKOC project. This directory (`apps/server/docs`) contains details regarding the system design, architecture conventions, messaging, and domain entities.

---

## Documentation Index

### 🏢 Core Architecture & Conventions
*   **[Clean Architecture & CQRS Conventions](./architecture.md)**: Rules of layer dependency, directory layout, use-case separation (Commands vs. Queries), aggregate roots constraints, and database hydration/mapping.

### 🌐 Domain Models
*   **[Domains Overview & Schema Mapping](./domain/overview.md)**: Detailed breakdown of the domains:
    *   **User & Auth Domain**: RBAC, User account states, Google Sign In.
    *   **Campaign Domain**: Campaign setups, product parameters, target matching.
    *   **KOL Profile Domain**: Social network handle verification, metrics.
    *   **Notification Domain**: Realtime event notification and read states.
*   **[Campaign & Campaign Participant Domain](./domain/campaign-domain.md)**: Specifications, state machines, and aggregate invariants for campaigns, collaboration, and KOL deliverable outputs.
*   **[KOL Onboarding & Platform Verification Flow](./domain/kol-onboarding-flow.md)**: Details on the OAuth callback flow, linking user profiles, and queueing crawl tasks for platform account verification.

### ⚡ Integrations & Communications
*   **[WebSocket Strategy](./websocket-integration.md)**: Details on the `IWebSocketService` abstraction, socket namespaces (`hivek`), real-time triggers, and scaling.
*   **[RabbitMQ Integration](./rmq/rabbitmq-integration.md)**: Message bus design, event publishing, RPC setups, and scaling behaviors.
*   **[RabbitMQ Manual Configuration](./rmq/manual_config.md)**: Practical guidelines to manually set up queues, exchanges, and dead-letter pipelines.

### 🎯 Features & Product Requirements
*   **[Feature Plan & Nodes Setup](./plan.md)**: Product feature mappings (AI Smart Matching, KPI tracking, Scoring) and node duties (Main NestJS, Python Data Gathering, Python AI Node).
