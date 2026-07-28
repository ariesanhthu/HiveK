# Service Context

## Identity
- **Name**: HiveK Server
- **Owner Team**: HiveK Engineering
- **Repo / Path**: `apps/server`
- **Language**: TypeScript (ES2024, `module: nodenext`)
- **Framework**: NestJS v11
- **Architecture**: Clean Architecture + DDD Tactical Patterns + CQRS + Event-Driven

## Purpose
HiveK is a marketing collaboration platform connecting brands/enterprises with KOLs/KOCs (content creators). It manages the full lifecycle of influencer marketing campaigns — from campaign brief drafting, KOL recruitment, deliverable tracking, performance measurement, to billing and subscription management.

## Non-Goals
- User-facing UI rendering (API-only backend)
- Real-time content scheduling across social platforms (delegated to queue-based ScheduledPost processing)

## SLOs / Non-Functionals
- Availability: 99.9%
- Latency p99: < 200ms (API), < 5s (background jobs)
- Consistency Model: Strong consistency within aggregate boundaries; eventual consistency across bounded contexts via Transactional Outbox

## Runtime Stack
- Datastore: MongoDB (Mongoose v9)
- Message Broker: RabbitMQ (AMQP)
- Cache: Redis (ioredis)
- File Storage: Cloudinary
- Auth Mechanism: JWT + Passport strategies (Facebook, Google, Twitter, YouTube)
- API: REST (HTTP) + GraphQL (Apollo) + WebSocket (Socket.IO)

## Deployment
- Runtime Target: Node.js 22+ (Docker)
- Config Strategy: Environment variables via `@nestjs/config`
- Secrets Strategy: `.env` files / environment variables
