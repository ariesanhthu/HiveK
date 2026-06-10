# server-ai

This service owns the KOL scoring pipeline and keeps crawler logic, feature extraction, scheduling, and scoring isolated so placeholder implementations can be replaced without changing the scoring contract.

## Flow

1. Load KOL profiles from `GET /kol-profiles/platforms` using cursor pagination.
2. Send each profile through crawler adapters for TikTok and YouTube when platform identities are present.
3. Merge and normalize raw social data.
4. Extract sentiment, engagement, topic authority, and controversy features.
5. Score the profile with configurable weights.
6. Persist results with `PATCH /kol-profiles/:id`.

## Run

```bash
uvicorn main:app --reload --port 8001
```

## Notes

- Crawlers support placeholder mode by default. YouTube can be switched to the real YouTube Data API v3 adapter with `CRAWLER_MODE=real`; TikTok is still placeholder-only.
- The scoring engine depends only on feature objects, so additional real crawlers or real embeddings can be plugged in later without changing the scoring contract.
- Weights are loaded from `src/configs/scoring.py` and can be tuned without editing the pipeline.

## Environment & Run Instructions

These steps assume you are in the repository root. The service is a small FastAPI app in `apps/server-ai`.

1. Prepare Python environment

```bash
# create and activate a venv (recommended)
python -m venv .venv-ai
# Windows PowerShell
.\.venv-ai\Scripts\Activate.ps1
# Windows cmd
.\.venv-ai\Scripts\activate.bat
# macOS / Linux
source .venv-ai/bin/activate
```

2. Install Python dependencies

```bash
pip install -r apps/server-ai/requirements.txt
```

3. Required environment variables

- `API_BASE_URL` - Base URL for HiveK backend (default: `https://hivek-main-backend-54ef5f252bc1.herokuapp.com/hivek/api`)
- `PIPELINE_PAGE_SIZE` - Cursor page size when fetching KOLs (default: `10`)
- `PIPELINE_MAX_PROFILES` - Max profiles to process in one run (default: `100`)
- `PIPELINE_CONCURRENCY` - Number of concurrent profile processors (default: `4`)
- `API_TIMEOUT_SECONDS` - HTTP client timeout in seconds (default: `30`)
- `CRAWLER_MODE` - Selects `placeholder` or `real` mode for the YouTube crawler (default: `placeholder`)
- `CRAWLER_API_BASE_URL` - YouTube Data API base URL (default: `https://www.googleapis.com/youtube/v3`)
- `CRAWLER_API_KEY` - YouTube Data API key used in real mode
- `CRAWLER_TIMEOUT` - Timeout for crawler API requests in seconds (default: `30`)
- `CRAWLER_RETRY_COUNT` - Retry attempts for crawler API requests (default: `3`)
- `CRAWLER_RETRY_DELAY` - Base delay in seconds between crawler retries (default: `1`)
- `CRAWLER_SEED_SALT` - Deterministic salt for mock crawler outputs (default: `hivek-placeholder`)
- `PIPELINE_SCHEDULER_ENABLED` - Turn the daily background job on or off (default: `true`)
- `PIPELINE_SCHEDULER_INTERVAL_SECONDS` - Delay between runs (default: `86400`)
- `PIPELINE_SCHEDULER_INITIAL_DELAY_SECONDS` - Wait before the first automatic run (default: `0`)
- `PIPELINE_SCHEDULER_TOP_KOL_LIMIT` - Legacy name for the scheduled batch size. It limits how many due profiles are processed per scheduled run (default: `20`)
- `PIPELINE_SCHEDULER_RETRY_ATTEMPTS` - Retry attempts for a failed scheduled run (default: `3`)
- `PIPELINE_SCHEDULER_RETRY_DELAY_SECONDS` - Backoff base between retries (default: `30`)
- `SCORING_SENTIMENT_WEIGHT` - Weight for sentiment score (default: `0.35`)
- `SCORING_ENGAGEMENT_WEIGHT` - Weight for engagement quality (default: `0.30`)
- `SCORING_TOPIC_WEIGHT` - Weight for topic authority (default: `0.20`)
- `SCORING_CONTROVERSY_WEIGHT` - Weight for controversy risk inversion (default: `0.15`)

You can export these in your shell or create a `.env` file and use a tool such as `direnv` or a dotenv loader.

4. Run the service locally

```bash
# from repo root
cd apps/server-ai
# start the FastAPI app
uvicorn main:app --reload --port 8001
```

5. Quick smoke test

Check health endpoint:

```bash
curl -s http://127.0.0.1:8001/healthz
# expected: {"status":"ok"}
```

Run a short manual pipeline. Manual runs keep the existing contract and do not request due-for-crawl filtering unless you explicitly pass `dueForCrawl: true`.

```bash
curl -s -X POST http://127.0.0.1:8001/pipeline/run \
  -H "Content-Type: application/json" \
  -d '{"limit":2}' | jq
```

Check current or latest pipeline status:

```bash
curl -s http://127.0.0.1:8001/pipeline/status | jq
```

Debug mode for seeing the incoming KOL input, crawler output, PATCH payload, and backend response:

```bash
curl -s -X POST http://127.0.0.1:8001/pipeline/run/debug \
  -H "Content-Type: application/json" \
  -d '{"limit":2}' | jq
```

The debug response returns:

- `summary` - processed / updated / failed counts
- `traces[]` - per-profile input, crawler snapshots, score payload, and backend response

## Manual vs Scheduled Runs

`POST /pipeline/run` is for manual execution. By default it fetches profiles from `GET /kol-profiles/platforms` with the supplied `cursor` and `limit`, using whatever ordering the backend returns.

`DailyPipelineScheduler` is for recurring execution. It builds an internal request like this:

```json
{
  "cursor": "<last scheduled nextCursor or null>",
  "limit": 20,
  "dueForCrawl": true,
  "runMode": "scheduled"
}
```

Scheduled runs therefore try to fetch KOLs that are due for crawl. If the backend supports `GET /kol-profiles/platforms?limit=20&dueForCrawl=true`, it should return the highest-need due profiles first. If the backend does not support that query and returns `400`, `404`, or `422`, the AI service retries the old endpoint without `dueForCrawl` and keeps the returned `nextCursor` in memory. That fallback still rotates through cursor pages over time instead of processing the same first page forever.

`PIPELINE_SCHEDULER_TOP_KOL_LIMIT` is not a real top-ranking selector by itself. It is only the scheduled batch size. The backend must provide ordering/filtering for "top", "priority", or "due" semantics.

## Backend Crawl State Contract

The AI service can now read these optional fields from `GET /kol-profiles/platforms` without breaking older responses:

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

Recommended backend behavior for scheduled selection:

- `GET /kol-profiles/platforms?limit=20&dueForCrawl=true` returns profiles where `nextCrawlAt <= now` or `lastCrawledAt` is missing.
- Sort by `crawlPriority DESC`, then `nextCrawlAt ASC`, then high follower/recent activity signals.
- Use crawl intervals such as high priority/recently active every 6-12 hours, medium priority daily, and low priority/inactive every 3-7 days.
- For failures, set `crawlStatus=failed`, increment `crawlFailCount`, store `lastCrawlError`, and push `nextCrawlAt` forward with backoff so the same failed profile is not retried constantly.

The AI service does not yet PATCH these crawl state fields because the current backend update contract only guarantees `scores`. TODO: add a backend-supported score/crawl-state update contract, or a separate endpoint such as `PATCH /kol-profiles/:id/crawl-state`.

## Incremental Crawling

The profile DTO accepts `lastPublishedAt`, `lastVideoId`, `lastCommentCursor`, and `lastCrawlSnapshot` so future crawler adapters can avoid re-reading already processed content. Current TikTok placeholder and YouTube real crawler still perform full profile-level fetches within their configured batch limits. TODO: pass these incremental cursors into crawler methods once backend persistence is available.

6. Run as part of the monorepo dev flow

If you already use the project's `npm` scripts, the repo includes a script that starts the AI service as one of the concurrently run dev processes from the repository root:

```bash
npm run dev
# or start AI service only
npm run dev:ai
```

The FastAPI app starts `DailyPipelineScheduler` on startup when `PIPELINE_SCHEDULER_ENABLED=true`. That job processes a due-for-crawl batch of 20 KOLs every 24 hours by default, rotates by cursor when due filtering is unavailable, and retries failed scheduled runs with linear backoff.

Real crawler mode currently applies to YouTube only. TikTok remains on the placeholder implementation until a matching real adapter is added.

7. Troubleshooting

- If `curl` fails, check that `API_BASE_URL` is reachable and correct.
- If `CRAWLER_MODE=real` returns empty YouTube payloads, check `CRAWLER_API_KEY`, quota, and whether the profile's `youtube` value is a useful search query.
- Use `python -m compileall apps/server-ai` to quickly check for syntax errors after edits.
