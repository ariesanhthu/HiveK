# KPI Tracking Architecture & Implementation Plan

## 1. Overview

This document outlines the event-driven architecture for tracking KPI metrics (views, likes, comments, shares) of KOL outputs via a distributed Crawler service.

The core philosophy follows a strict separation of concerns:

- **Server (NestJS)**: Owns the database, manages business state (`Campaign` aggregate, `KpiLog`), and pushes real-time updates to clients via WebSockets.
- **Crawler (Python/Worker)**: Handles the heavy lifting of scraping external platforms, manages its own scheduling via delayed queues, and reports back.

---

## 2. Runtime Flow for `KpiLog`

The current server-side implementation does not create or terminate KPI tracking itself. Instead, it reacts to RabbitMQ messages produced by the crawler or an external tracker.

### 2.1 Success Path

1. The RMQ controller listens on `server_kpi_queue` for `tracking.success`.
2. `KpiLogRmqController.handleTrackingSuccess()` forwards the payload to `KpiLogCreateCommand`.
3. `KpiLogCreateCommandHandler` extracts `views`, `likes`, `comments`, and `shares` from `payload.metrics`.
4. If `payload.participantId` is missing, the command is rejected early and nothing is persisted.
5. `KpiLogEntity.create()` builds a new KPI log with:
   - `timestamp` set to `new Date()`
   - `deleteAt` and `deleteBy` set to `null`
6. `IKpiLogRepository.save()` persists the entity in MongoDB.
7. After persistence, the handler publishes `KpiMetricsUpdatedEvent(participantId, kpiLogId)`.
8. `KpiTrackingEventsHandler` handles that event and emits the websocket message `kpi_metrics_updated` to the KOL user.

### 2.2 Termination Path

1. The RMQ controller listens on `server_kpi_queue` for `tracking.terminated`.
2. `KpiLogRmqController.handleTrackingTerminated()` forwards the payload to `KpiLogTerminateCommand`.
3. `KpiLogTerminateCommandHandler` validates `participantId` and `outputId`.
4. It loads the `CampaignRoot` aggregate using the campaign repository and calls `campaign.updateTrackingStatus(outputId, false)`.
5. The campaign aggregate is saved back to the campaign repository.
6. The handler publishes `KpiTrackingTerminatedEvent(participantId, outputId)`.
7. `KpiTrackingEventsHandler` emits the websocket message `kpi_tracking_terminated` to the KOL user.

### 2.3 What Is Stored in `KpiLog`

`KpiLogEntity` represents a single KPI snapshot, not the long-running tracking state.

- `participantId`
- `outputId` (`null` when unavailable)
- `metrics` with `views`, `likes`, `comments`, and `shares`
- `timestamp`
- soft-delete fields: `deleteAt`, `deleteBy`

---

## 3. RabbitMQ Configuration Strategy

We will consolidate the RMQ configuration into a single domain folder `kpi_tracking`, split into two files according to our `manual_config.md` standard.

**Directory**: `src/infrastructure/rabbitmq/config/kpi_tracking/`

### 3.1 `config.producer.json` (Server emitting OUT)

The code in this repository currently only shows the server consumer side. If the crawler is still publishing KPI data back to the server, this producer config should document those outbound routing keys separately.

### 3.2 `config.consumer.json` (Server listening IN)

This is the flow implemented in `apps/server` today.

- **Queue**: `server_kpi_queue`
- **Routing Keys**:
  - `tracking.success`
  - `tracking.terminated`

Both messages are translated into CQRS commands, then into in-process events for websocket notifications.
