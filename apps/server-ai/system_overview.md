# System Overview - `apps/server-ai`

## 1. Current Architecture

### Folder Structure

The current AI service lives in `apps/server-ai/` and is a small FastAPI application with a layered Python package under `apps/server-ai/src/`.

- `main.py`: process entrypoint, bootstraps the FastAPI app.
- `README.md`: local run instructions and pipeline notes.
- `requirements.txt`: runtime dependencies for the AI service.
- `src/app.py`: application factory, lifespan startup, exception handlers, router registration, and scheduler lifecycle.
- `src/api/`: HTTP routes for health and pipeline execution.
- `src/services/`: upstream HiveK API client and KOL profile service.
- `src/pipeline/`: orchestration logic for the KOL scoring flow.
- `src/crawlers/`: crawler abstraction plus TikTok placeholder and YouTube placeholder/real implementations.
- `src/processors/`: text preprocessing and normalization.
- `src/feature_extractors/`: mock embedding provider and feature extraction logic.
- `src/scoring/`: weighted scoring engine.
- `src/configs/`: app config and scoring weights.
- `src/models/`: domain models and request/response DTOs.
- `src/utils/`: logging, pagination, ID generation, and error types.
- `src/scheduler/`: in-process recurring pipeline scheduler.
- `tests/`: tests for YouTube real crawler behavior and pipeline resilience.

### Service Dependencies

The runtime dependency chain is:

`FastAPI app` -> `router` -> `orchestrator` -> `KOL profile service` -> `HiveK API client`.

The pipeline then fans out to:

`orchestrator` -> `crawler adapters` -> `normalizer` -> `feature extractor` -> `scoring engine` -> `KOL profile service` -> backend `PATCH`.

The scheduler calls the same orchestrator entrypoint as the manual `/pipeline/run` endpoint, but marks the request as `runMode=scheduled` and `dueForCrawl=true`.

### Data Flow

1. Load KOL identities from `GET /kol-profiles/platforms` with cursor pagination. Scheduled runs add `dueForCrawl=true` and fall back to the legacy query if the backend does not support it.
2. Convert backend payloads into `PlatformProfile` domain objects.
3. Run platform-specific crawlers for TikTok and YouTube when profile identities are present.
4. Merge raw payloads into a normalized social data object.
5. Extract sentiment, engagement, topic authority, and controversy features.
6. Compute weighted `kol_score`.
7. Send scores back to backend via `PATCH /kol-profiles/:id`.
8. Optionally return trace data through `/pipeline/run/debug`.

When `CRAWLER_MODE=real`, the YouTube path becomes:

`PlatformProfile.youtube` -> `YouTubeCrawlerClient` -> YouTube API raw response -> `YouTubeResponseMapper` -> `RawSocialData` -> `SocialNormalizer` -> feature extraction -> scoring -> PATCH.

### External APIs

The backend APIs used by the current AI service are:

- `GET /kol-profiles/platforms`
- `PATCH /kol-profiles/:id`

The base URL is configurable through `API_BASE_URL` and defaults to the HiveK backend URL in `src/configs/app.py`.

When `CRAWLER_MODE=real`, the crawler layer also calls the YouTube Data API v3 base URL configured by `CRAWLER_API_BASE_URL`.

### Databases

There is no direct database access in `apps/server-ai/`.

The service depends on the upstream HiveK backend as its source of truth for KOL profile data and score persistence.

### Scheduled Jobs

`DailyPipelineScheduler` is implemented in `src/scheduler/daily_pipeline.py` and is started from the FastAPI lifespan in `src/app.py`.

By default, it:

- runs when `PIPELINE_SCHEDULER_ENABLED=true`
- starts immediately because `PIPELINE_SCHEDULER_INITIAL_DELAY_SECONDS=0`
- processes `PIPELINE_SCHEDULER_TOP_KOL_LIMIT=20` profiles per run
- stores the previous scheduled run's `next_cursor` in memory and uses it as the next scheduled cursor
- waits `PIPELINE_SCHEDULER_INTERVAL_SECONDS=86400` seconds between runs
- retries a failed scheduled run up to `PIPELINE_SCHEDULER_RETRY_ATTEMPTS=3` times with linear backoff based on `PIPELINE_SCHEDULER_RETRY_DELAY_SECONDS`

The scheduler is in-process only. The cursor fallback prevents a single process from repeatedly taking the same first page when backend ordering is static, but it is not durable across restarts. There is no durable job store, run history table, distributed lock, cron runner, APScheduler, Celery worker, or replay system in this service today.

`PIPELINE_SCHEDULER_TOP_KOL_LIMIT` is a legacy config name. It is a scheduled batch limit, not proof that the selected profiles are "top" KOLs. Real top/priority/due semantics must come from backend ordering and crawl state.

### Crawl State and Selection

The service can parse optional crawl state fields from backend profile payloads:

- `lastCrawledAt`
- `nextCrawlAt`
- `lastScoreUpdatedAt`
- `crawlStatus`
- `crawlFailCount`
- `crawlPriority`
- `lastCrawlError`
- `followerCount`
- `recentlyActive`
- `lastPublishedAt`
- `lastVideoId`
- `lastCommentCursor`
- `lastCrawlSnapshot`

Recommended backend endpoint support:

- keep `GET /kol-profiles/platforms` unchanged for manual compatibility
- add support for `GET /kol-profiles/platforms?limit=20&dueForCrawl=true`
- return profiles due by `nextCrawlAt <= now` or missing `lastCrawledAt`
- order by crawl priority, due time, follower/activity signals, and failure backoff

The current AI service does not persist crawl state fields because the existing `PATCH /kol-profiles/:id` contract only guarantees score updates.

### Crawler Modules

The crawler layer supports both placeholder and real mode for YouTube.

- `BaseCrawler` defines the contract.
- `TikTokCrawler` generates deterministic mock raw social data.
- `YouTubeCrawler` generates deterministic mock raw social data and remains the fallback implementation.
- `YouTubeRealCrawler` talks to the YouTube Data API v3 and maps the raw provider response into the same internal `RawSocialData` contract.
- `CRAWLER_MODE=placeholder|real` selects the active YouTube crawler implementation.

Crawler output is shaped for the existing pipeline contract, so feature extraction and scoring consume normalized internal data only.

### Scoring Modules

The scoring stack exists and is separated from crawling:

- `MockEmbeddingProvider` provides deterministic placeholder similarities.
- `SocialFeatureExtractor` derives sentiment, engagement quality, topic authority, and controversy risk.
- `KOLScoringEngine` applies configurable weights and produces the final `kol_score`.

## 2. Existing Features

The following capabilities are implemented in code:

- FastAPI service bootstrap.
- Health endpoint at `/healthz`.
- Pipeline run endpoint at `/pipeline/run`.
- Debug pipeline endpoint at `/pipeline/run/debug`.
- Pipeline status endpoint at `/pipeline/status`.
- Cursor-based fetching of KOL platform identities.
- Upstream API client for `GET /kol-profiles/platforms`.
- Upstream API client for `PATCH /kol-profiles/:id`.
- Domain models for profiles, raw social data, normalized data, features, and score components.
- Cursor pagination helper.
- App configuration via environment variables.
- Scoring weight configuration via environment variables.
- Logging setup.
- Error types and HTTP exception mapping.
- Mock TikTok crawler.
- Mock YouTube crawler.
- Real YouTube crawler adapter for YouTube Data API v3.
- YouTube provider response validation and mapping.
- Retry/backoff for retryable YouTube crawler requests.
- Text cleaning and normalization.
- Mock embedding provider.
- Sentiment scoring placeholder.
- Engagement quality scoring heuristic.
- Topic authority scoring.
- Controversy risk scoring.
- Weighted KOL score calculation.
- Concurrent processing with semaphore-based throttling.
- Deterministic mock raw payload generation.
- Debug trace response that exposes input, crawler payloads, normalized input, features, score payload, and backend response.
- In-process scheduler for recurring due-for-crawl pipeline runs with cursor fallback.
- Progress/status tracking for current or latest pipeline run.
- Tests for YouTube real crawler behavior and pipeline resilience when one platform crawler fails.
- README-based run instructions.

## 3. Missing Features

The following items are still missing relative to the full roadmap:

- Real crawler integration for TikTok.
- Durable production scheduling outside the FastAPI process, if multiple replicas or guaranteed execution are required.
- Background job persistence or run history.
- Backend support for durable crawl state updates after each profile succeeds or fails.
- Backend support for due-for-crawl ordering if not already implemented.
- Retry/backoff strategy for upstream HiveK API calls.
- Failure isolation with explicit per-KOL retry policy.
- Idempotency tracking for repeated daily runs.
- Durable logging/monitoring pipeline.
- Metrics and tracing for observability.
- Broader test suite for normalization, scoring, API client, app startup/lifespan, and scheduler behavior.
- Real embedding provider integration.
- Real sentiment model integration.
- Real controversy signal extraction.
- Strict config validation with schema enforcement beyond the current environment parsing.
- Guardrails for the debug endpoint in production.
- Packaging/deployment assets such as Dockerfile or CI workflow.

## 4. Technical Debt

Current code-level debt visible in the implementation:

- Mock crawler logic is deterministic but still hardcoded inside platform classes.
- Sentiment anchors and heuristic coefficients are hardcoded in the feature extractor.
- The feature extractor and scoring engine depend on simplified placeholder logic rather than pluggable strategy interfaces for all scoring parts.
- The in-process scheduler is tied to FastAPI lifespan, so multi-replica deployments can duplicate scheduled runs unless external coordination is added.
- No retry policy or circuit breaker exists around upstream HiveK API calls.
- No persistent state exists for deduplication of processed KOLs.
- Scheduled cursor rotation is in memory only and resets on process restart.
- Debug endpoints are currently exposed without environment-based access control.
- The upstream API client assumes the backend response shape is valid and does not enforce rich schema validation beyond the initial list response.
- There is no explicit abstraction for storage of run summaries or failure records.
- The YouTube real crawler currently assumes `PlatformProfile.youtube` is the crawl query / identifier and does not resolve a separate channel lookup endpoint.

## 5. Recommended Architecture

The current structure is a good base for a production-ready pipeline if the next steps keep the same boundaries:

- Keep `src/services/` as the only upstream backend access layer.
- Keep `src/crawlers/` as a platform adapter layer that only returns raw social data.
- Keep `src/processors/` responsible for normalization and text cleanup only.
- Keep `src/feature_extractors/` responsible for turning normalized data into score inputs.
- Keep `src/scoring/` responsible only for final scoring and score payload shaping.
- Keep `src/scheduler/` as the recurring execution layer, but add durable coordination if production scheduling needs stronger guarantees.
- Add a retry policy wrapper around `HiveKApiClient` or a shared upstream client abstraction.
- Add a persistence layer for run logs, KOL processing status, and replay support if daily automation needs auditability.
- Add a feature-flagged debug mode so trace output is available only in development or controlled environments.
- Add tests around each layer so crawler replacement, model replacement, and weight tuning do not change business behavior unexpectedly.
