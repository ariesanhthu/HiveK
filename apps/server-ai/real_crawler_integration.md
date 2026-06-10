# Real Crawler Integration

## 1. Current Crawler Contract

The pipeline currently expects this internal contract between crawler, feature extraction, scoring, and update API:

- `PlatformProfile` input:
  - `id: str`
  - `tiktok: str | None`
  - `youtube: str | None`
  - optional crawl state such as `lastPublishedAt`, `lastVideoId`, `lastCommentCursor`, and `lastCrawlSnapshot`
- `RawSocialData` crawler output:
  - `platform: str`
  - `comments: list[str]`
  - `captions: list[str]`
  - `posts: list[str]`
  - `engagement_metrics: dict[str, float]`
  - `topics: list[str]`
  - `replies: list[str]`
- `SocialNormalizer` then merges one or more `RawSocialData` objects into `NormalizedSocialData`.
- `SocialFeatureExtractor` and `KOLScoringEngine` consume only normalized internal data, not raw API payloads.
- `HiveKApiClient` persists score payloads via `PATCH /kol-profiles/:id`.

This contract is preserved in both placeholder and real modes.

## 2. Real Crawler API

The real implementation uses the YouTube Data API v3 as a provider-backed crawler.

The current `BaseCrawler.crawl(profile)` interface receives the whole `PlatformProfile`, so incremental state can be added without changing callers. The YouTube implementation does not yet use `lastPublishedAt`, `lastVideoId`, `lastCommentCursor`, or `lastCrawlSnapshot`; those fields are parsed for future incremental crawling once backend persistence is available.

### Endpoints

- `GET /search`
- `GET /videos`
- `GET /commentThreads`

The configured base URL defaults to `https://www.googleapis.com/youtube/v3`.

### Request params

`search.list` equivalent:

- `part=id,snippet`
- `q=<profile.youtube>`
- `type=video`
- `maxResults=<batch size>`
- `pageToken=<cursor>`
- `key=<CRAWLER_API_KEY>` when present

`videos.list` equivalent:

- `part=snippet,statistics,contentDetails`
- `id=<comma-separated video ids>`
- `key=<CRAWLER_API_KEY>` when present

`commentThreads.list` equivalent:

- `part=snippet,replies`
- `videoId=<video id>`
- `maxResults=<batch size>`
- `textFormat=plainText`
- `pageToken=<cursor>`
- `key=<CRAWLER_API_KEY>` when present

### Response schema

The adapter validates the provider response with Pydantic models before mapping into the internal contract.

- Search response: items with `id.videoId`
- Video response: items with `snippet` and `statistics`
- Comment-thread response: items with `snippet.topLevelComment.snippet` and optional `replies.comments`

### Auth / env

- `CRAWLER_MODE=placeholder|real`
- `CRAWLER_API_BASE_URL=https://www.googleapis.com/youtube/v3`
- `CRAWLER_API_KEY=<YouTube Data API key>`
- `CRAWLER_TIMEOUT=<seconds>`
- `CRAWLER_RETRY_COUNT=<int>`
- `CRAWLER_RETRY_DELAY=<seconds>`

### Rate limits and quota

The adapter is written with retry handling for:

- `429` rate limiting
- retryable YouTube quota errors such as `quotaExceeded`, `dailyLimitExceeded`, and `userRateLimitExceeded`
- `5xx` upstream failures
- transport timeouts and request errors

The YouTube Data API quota cost depends on the endpoint and request shape. The code uses these batch limits:

- search requests paginate in batches of up to 50 videos
- video metadata requests batch up to 50 ids
- comment requests batch up to 100 threads per page

The current defaults fetch up to 20 videos and up to 50 comment threads per video.

### Error format

The adapter parses provider errors from the YouTube API `error` envelope when present:

- `error.code`
- `error.message`
- `error.errors[0].reason`

Malformed provider responses raise a crawler response error inside the client. `YouTubeRealCrawler.crawl()` catches crawler errors, logs them, and returns an empty `RawSocialData(platform="youtube")` so downstream normalization and scoring still receive the internal contract.

## 3. Integration Flow

`PlatformProfile.youtube` -> `YouTubeCrawlerClient` -> raw YouTube API response -> `YouTubeResponseMapper` -> `RawSocialData` -> `SocialNormalizer` -> `SocialFeatureExtractor` -> `KOLScoringEngine` -> `PATCH /kol-profiles/:id`

The real crawler does not expose raw API payloads to feature extraction or scoring.

## 4. Field Mapping

The adapter maps provider fields into the internal contract as follows:

- `video.snippet.title` -> `posts[]`, `captions[]`
- `video.snippet.description` -> `captions[]`
- `video.snippet.channelTitle` -> `posts[]`
- `video.snippet.tags[]` -> `topics[]`
- `video.statistics.viewCount` -> `engagement_metrics.views`
- `video.statistics.likeCount` -> `engagement_metrics.likes`
- `video.statistics.commentCount` -> `engagement_metrics.comments`
- `commentThreads.snippet.topLevelComment.snippet.textOriginal` -> `comments[]`
- `commentThreads.snippet.totalReplyCount` -> `engagement_metrics.replies`
- `commentThreads.replies.comments[].snippet.textOriginal` -> `replies[]`
- tokenized `PlatformProfile.youtube` and video titles -> `topics[]`

Missing fields are filled with safe defaults:

- strings -> `""`
- lists -> `[]`
- counters -> `0` or `0.0`

## 5. Error Handling

The crawler handles the following cases without failing the full batch:

- timeout, with retry for transport failures
- 4xx responses
- 5xx responses, with retry
- rate limit and quota responses, with retry when retry attempts remain
- empty search results
- malformed response bodies
- missing `PlatformProfile.youtube`
- missing or partial video/comment fields
- disabled comments on a video, which are treated as an empty comment page

If a single KOL fails:

- the crawler logs the error
- the orchestrator keeps processing the rest of the batch
- the pipeline continues with the next profile

If a single platform crawler fails for a KOL:

- the orchestrator keeps the successful platform payloads
- the KOL is still processed when at least one crawler returns data
- if all selected crawlers return empty payloads, the profile is still normalized, scored with safe defaults, and patched unless the backend update fails

## 6. Placeholder Fallback

`CRAWLER_MODE=placeholder` keeps deterministic mock crawler behavior.

This is the safe dev mode when the real YouTube API key is not available or when deterministic local behavior is required.

## 7. Assumptions

- `PlatformProfile.youtube` is treated as the crawl query / identifier for the real YouTube adapter.
- TikTok remains on placeholder mode until a matching real adapter is added.
- Real mode currently covers YouTube only, but the adapter pattern is reusable for other platforms.
