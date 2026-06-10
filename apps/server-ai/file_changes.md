# File Changes

## Current Documentation Audit

The Markdown files in `apps/server-ai` were reviewed against the current FastAPI service implementation under `apps/server-ai/src` and the tests under `apps/server-ai/tests`.

## Updated Files

- `apps/server-ai/README.md` - clarified the actual pipeline flow, fixed broken dash encoding in the environment variable list, documented that real crawler mode only applies to YouTube, added scoring weight environment variables, described manual vs scheduled runs, documented `dueForCrawl`, cursor fallback, `/pipeline/status`, backend crawl-state fields, and incremental-crawl TODOs.
- `apps/server-ai/system_overview.md` - corrected the scheduler section to reflect `DailyPipelineScheduler`, removed the stale `dashboard.py` entry, updated the missing-feature list now that YouTube real crawling and scheduler code exist, clarified that `PIPELINE_SCHEDULER_TOP_KOL_LIMIT` is a batch limit rather than real top-K selection, and documented the backend due-for-crawl contract.
- `apps/server-ai/real_crawler_integration.md` - aligned crawler error handling with the code: Pydantic validates provider payloads, the real crawler catches crawler errors and returns an empty internal payload, comment-disabled responses are tolerated, empty crawler output can still be scored with safe defaults, and incremental crawler state fields are reserved for future use.
- `apps/server-ai/file_changes.md` - replaced the older cross-folder change summary with this server-ai-local documentation audit summary.

## Findings

- The code currently implements a FastAPI pipeline with `/healthz`, `/pipeline/run`, and `/pipeline/run/debug`.
- The code now exposes `/pipeline/status` for current or latest run progress.
- `DailyPipelineScheduler` is implemented and starts from FastAPI lifespan when enabled.
- Scheduled runs request `dueForCrawl=true` and keep the previous `nextCursor` in memory to rotate through backend pages when due filtering is unavailable.
- The old "top 20" wording was misleading: code only had `limit=20`; actual top/due ordering must be supplied by backend query behavior.
- TikTok uses deterministic placeholder crawling.
- YouTube uses deterministic placeholder crawling by default and switches to `YouTubeRealCrawler` when `CRAWLER_MODE=real`.
- The YouTube real crawler has retry handling for retryable YouTube API failures.
- The upstream HiveK API client does not currently implement retry/backoff.
- Tests exist for YouTube real crawler behavior and pipeline resilience when one crawler fails, but coverage is still incomplete for normalization, scoring, API client, app lifespan, and scheduler behavior.
