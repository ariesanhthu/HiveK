from __future__ import annotations

import asyncio
import logging
from collections import defaultdict
from dataclasses import dataclass
from typing import Any

import httpx
from pydantic import BaseModel, ConfigDict, Field, ValidationError

from src.crawlers.base import BaseCrawler
from src.crawlers.errors import CrawlerInputError, CrawlerRateLimitError, CrawlerResponseError, CrawlerTransportError
from src.models.domain import PlatformProfile, RawSocialData


logger = logging.getLogger(__name__)

DEFAULT_MAX_VIDEOS = 20
DEFAULT_MAX_COMMENTS_PER_VIDEO = 50


class YouTubeSearchItemId(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    video_id: str | None = Field(default=None, alias="videoId")


class YouTubeSearchItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: YouTubeSearchItemId = Field(default_factory=YouTubeSearchItemId)


class YouTubeSearchResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    items: list[YouTubeSearchItem] = Field(default_factory=list)
    next_page_token: str | None = Field(default=None, alias="nextPageToken")


class YouTubeVideoSnippet(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    channel_id: str | None = Field(default=None, alias="channelId")
    channel_title: str | None = Field(default=None, alias="channelTitle")
    published_at: str | None = Field(default=None, alias="publishedAt")
    title: str | None = None
    description: str | None = None
    tags: list[str] = Field(default_factory=list)


class YouTubeVideoStatistics(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    view_count: str | None = Field(default=None, alias="viewCount")
    like_count: str | None = Field(default=None, alias="likeCount")
    comment_count: str | None = Field(default=None, alias="commentCount")


class YouTubeVideoItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: str = ""
    snippet: YouTubeVideoSnippet = Field(default_factory=YouTubeVideoSnippet)
    statistics: YouTubeVideoStatistics = Field(default_factory=YouTubeVideoStatistics)


class YouTubeVideoResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    items: list[YouTubeVideoItem] = Field(default_factory=list)


class YouTubeCommentSnippet(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    text_original: str | None = Field(default=None, alias="textOriginal")
    like_count: int | str | None = Field(default=0, alias="likeCount")
    published_at: str | None = Field(default=None, alias="publishedAt")


class YouTubeTopLevelComment(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    snippet: YouTubeCommentSnippet = Field(default_factory=YouTubeCommentSnippet)


class YouTubeCommentThreadSnippet(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    top_level_comment: YouTubeTopLevelComment = Field(default_factory=YouTubeTopLevelComment, alias="topLevelComment")
    total_reply_count: int | str | None = Field(default=0, alias="totalReplyCount")


class YouTubeReplyComment(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    snippet: YouTubeCommentSnippet = Field(default_factory=YouTubeCommentSnippet)


class YouTubeReplies(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    comments: list[YouTubeReplyComment] = Field(default_factory=list)


class YouTubeCommentThreadItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: str = ""
    snippet: YouTubeCommentThreadSnippet = Field(default_factory=YouTubeCommentThreadSnippet)
    replies: YouTubeReplies | None = None


class YouTubeCommentThreadsResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    items: list[YouTubeCommentThreadItem] = Field(default_factory=list)
    next_page_token: str | None = Field(default=None, alias="nextPageToken")


class YouTubeRawCrawlerResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    source: str = "youtube"
    query: str
    search_response: YouTubeSearchResponse = Field(default_factory=YouTubeSearchResponse)
    videos: list[YouTubeVideoItem] = Field(default_factory=list)
    comment_threads: dict[str, YouTubeCommentThreadsResponse] = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)


@dataclass(frozen=True)
class _ApiErrorDetails:
    message: str
    status_code: int
    retryable: bool
    reason: str = ""


class YouTubeCrawlerClient:
    def __init__(self, config, transport: httpx.AsyncBaseTransport | None = None) -> None:
        self._config = config
        self._transport = transport
        self._client: httpx.AsyncClient | None = None

    async def start(self) -> None:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self._config.crawler_api_base_url,
                timeout=self._config.crawler_timeout_seconds,
                transport=self._transport,
                headers={"Accept": "application/json"},
            )

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None:
            raise CrawlerTransportError("YouTube crawler client has not been started")
        return self._client

    async def fetch_raw_response(
        self,
        *,
        query: str,
        max_videos: int = DEFAULT_MAX_VIDEOS,
        max_comments_per_video: int = DEFAULT_MAX_COMMENTS_PER_VIDEO,
    ) -> YouTubeRawCrawlerResponse:
        cleaned_query = query.strip()
        if not cleaned_query:
            raise CrawlerInputError("Missing YouTube crawl query")

        search_response = await self._search_videos(cleaned_query, max_videos=max_videos)
        video_ids = [item.id.video_id for item in search_response.items if item.id.video_id]

        videos = await self._fetch_videos(video_ids)
        comment_threads: dict[str, YouTubeCommentThreadsResponse] = {}
        warnings: list[str] = []

        for video in videos:
            if not video.id:
                continue
            try:
                comment_threads[video.id] = await self._fetch_comment_threads(
                    video.id,
                    max_comments=max_comments_per_video,
                )
            except (CrawlerRateLimitError, CrawlerTransportError, CrawlerResponseError) as exc:
                warnings.append(f"Failed to load comments for video {video.id}: {exc}")
                comment_threads[video.id] = YouTubeCommentThreadsResponse(items=[])

        if not videos:
            warnings.append(f"No YouTube videos returned for query '{cleaned_query}'")

        return YouTubeRawCrawlerResponse(
            query=cleaned_query,
            search_response=search_response,
            videos=videos,
            comment_threads=comment_threads,
            warnings=warnings,
        )

    async def _search_videos(self, query: str, *, max_videos: int) -> YouTubeSearchResponse:
        items: list[YouTubeSearchItem] = []
        next_page_token: str | None = None

        while len(items) < max_videos:
            req_results = min(50, max_videos - len(items))
            payload = await self._request_json(
                "/search",
                params={
                    "part": "id,snippet",
                    "q": query,
                    "type": "video",
                    "maxResults": req_results,
                    "pageToken": next_page_token,
                    "key": self._config.crawler_api_key,
                },
            )

            response = self._validate_response(YouTubeSearchResponse, payload, "search response")
            items.extend(response.items)
            next_page_token = response.next_page_token

            if not next_page_token or len(items) >= max_videos:
                break

        return YouTubeSearchResponse(items=items[:max_videos])

    async def _fetch_videos(self, video_ids: list[str]) -> list[YouTubeVideoItem]:
        videos: list[YouTubeVideoItem] = []
        for index in range(0, len(video_ids), 50):
            batch = video_ids[index : index + 50]
            if not batch:
                continue

            payload = await self._request_json(
                "/videos",
                params={
                    "part": "snippet,statistics,contentDetails",
                    "id": ",".join(batch),
                    "key": self._config.crawler_api_key,
                },
            )
            response = self._validate_response(YouTubeVideoResponse, payload, "video response")
            videos.extend(response.items)

        return videos

    async def _fetch_comment_threads(self, video_id: str, *, max_comments: int) -> YouTubeCommentThreadsResponse:
        items: list[YouTubeCommentThreadItem] = []
        next_page_token: str | None = None

        while len(items) < max_comments:
            req_results = min(100, max_comments - len(items))
            try:
                payload = await self._request_json(
                    "/commentThreads",
                    params={
                        "part": "snippet,replies",
                        "videoId": video_id,
                        "maxResults": req_results,
                        "textFormat": "plainText",
                        "pageToken": next_page_token,
                        "key": self._config.crawler_api_key,
                    },
                )
            except CrawlerInputError as exc:
                if exc.status_code == 403:
                    logger.info("Skipping comments for video %s due to a 403 response", video_id)
                    return YouTubeCommentThreadsResponse(items=[])
                raise
            response = self._validate_response(YouTubeCommentThreadsResponse, payload, f"comment response for {video_id}")
            items.extend(response.items)
            next_page_token = response.next_page_token

            if not next_page_token or len(items) >= max_comments:
                break

        return YouTubeCommentThreadsResponse(items=items[:max_comments])

    async def _request_json(self, path: str, *, params: dict[str, Any]) -> dict[str, Any]:
        client = self._ensure_client()
        retry_count = max(1, self._config.crawler_retry_count)
        retry_delay = max(0.0, self._config.crawler_retry_delay_seconds)

        last_error: Exception | None = None
        for attempt in range(1, retry_count + 1):
            try:
                response = await client.get(path, params={key: value for key, value in params.items() if value is not None})
                api_error = self._extract_error(response)
                if api_error is not None:
                    last_error = self._error_to_exception(api_error)
                else:
                    return response.json()
            except httpx.TimeoutException as exc:
                last_error = CrawlerTransportError(f"Timeout while calling YouTube API {path}: {exc}")
            except httpx.HTTPError as exc:
                last_error = CrawlerTransportError(f"Transport failure while calling YouTube API {path}: {exc}")
            except ValueError as exc:
                last_error = CrawlerResponseError(f"Malformed JSON returned by YouTube API {path}: {exc}")

            if last_error is None:
                break

            retryable = isinstance(last_error, (CrawlerTransportError, CrawlerRateLimitError))
            if not retryable or attempt >= retry_count:
                raise last_error

            await asyncio.sleep(retry_delay * attempt if retry_delay > 0 else 0)

        if last_error is not None:
            raise last_error

        raise CrawlerResponseError(f"YouTube API {path} returned no response")

    @staticmethod
    def _extract_error(response: httpx.Response) -> _ApiErrorDetails | None:
        if response.status_code < 400:
            return None

        message = f"YouTube API returned {response.status_code} for {response.request.url.path}"
        retryable = response.status_code == 429 or response.status_code >= 500
        reason = ""

        try:
            payload = response.json()
        except ValueError:
            return _ApiErrorDetails(message=message, status_code=response.status_code, retryable=retryable)

        if isinstance(payload, dict):
            error = payload.get("error")
            if isinstance(error, dict):
                message = error.get("message") or message
                status_code = int(error.get("code") or response.status_code)
                errors = error.get("errors")
                if isinstance(errors, list) and errors:
                    first_error = errors[0]
                    if isinstance(first_error, dict):
                        reason_value = first_error.get("reason")
                        if isinstance(reason_value, str):
                            reason = reason_value
                retryable = status_code == 429 or status_code >= 500
                if status_code == 403 and reason in {"quotaExceeded", "dailyLimitExceeded", "userRateLimitExceeded"}:
                    retryable = True
                return _ApiErrorDetails(message=message, status_code=status_code, retryable=retryable, reason=reason)

        return _ApiErrorDetails(message=message, status_code=response.status_code, retryable=retryable, reason=reason)

    @staticmethod
    def _error_to_exception(error: _ApiErrorDetails) -> Exception:
        if error.status_code == 429 or error.reason in {"quotaExceeded", "dailyLimitExceeded", "userRateLimitExceeded"}:
            return CrawlerRateLimitError(error.message)
        if error.status_code >= 500:
            return CrawlerTransportError(error.message)
        return CrawlerInputError(error.message, status_code=error.status_code)

    @staticmethod
    def _validate_response(model: type[BaseModel], payload: dict[str, Any], context: str) -> BaseModel:
        try:
            return model.model_validate(payload)
        except ValidationError as exc:
            raise CrawlerResponseError(f"Malformed {context}: {exc}") from exc


class YouTubeResponseMapper:
    def map(self, raw_response: YouTubeRawCrawlerResponse) -> RawSocialData:
        comments: list[str] = []
        replies: list[str] = []
        captions: list[str] = []
        posts: list[str] = []
        topics: list[str] = []
        metrics = defaultdict(float)

        if raw_response.query:
            topics.extend(self._tokenize(raw_response.query))

        for video in raw_response.videos:
            title = (video.snippet.title or "").strip()
            description = (video.snippet.description or "").strip()
            channel_title = (video.snippet.channel_title or "").strip()
            video_url = f"https://www.youtube.com/watch?v={video.id}" if video.id else ""

            if title:
                posts.append(f"{title} {video_url}".strip())
                captions.append(title)
            if description:
                captions.append(description)
            if channel_title:
                posts.append(f"Channel: {channel_title}".strip())

            topics.extend(self._tokenize(title))
            topics.extend(video.snippet.tags)

            metrics["views"] += self._safe_float(video.statistics.view_count)
            metrics["likes"] += self._safe_float(video.statistics.like_count)
            metrics["comments"] += self._safe_float(video.statistics.comment_count)

            thread_response = raw_response.comment_threads.get(video.id)
            if not thread_response:
                continue

            for thread in thread_response.items:
                comment_snippet = thread.snippet.top_level_comment.snippet
                comment_text = (comment_snippet.text_original or "").strip()
                if comment_text:
                    comments.append(comment_text)

                metrics["replies"] += self._safe_float(thread.snippet.total_reply_count)

                if thread.replies:
                    for reply in thread.replies.comments:
                        reply_text = (reply.snippet.text_original or "").strip()
                        if reply_text:
                            replies.append(reply_text)

        if raw_response.warnings:
            for warning in raw_response.warnings:
                logger.warning("YouTube crawler warning: %s", warning)

        topics = self._deduplicate(topics)

        return RawSocialData(
            platform="youtube",
            comments=comments,
            captions=captions,
            posts=posts,
            engagement_metrics=dict(metrics),
            topics=topics,
            replies=replies,
        )

    @staticmethod
    def _safe_float(value: int | str | float | None) -> float:
        if value is None or value == "":
            return 0.0
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0

    @staticmethod
    def _tokenize(text: str) -> list[str]:
        tokens: list[str] = []
        for token in text.replace("/", " ").replace("_", " ").split():
            cleaned = token.strip().lower().strip(".,:;!?()[]{}<>")
            if len(cleaned) >= 3:
                tokens.append(cleaned)
        return tokens

    @staticmethod
    def _deduplicate(values: list[str]) -> list[str]:
        seen: set[str] = set()
        ordered: list[str] = []
        for value in values:
            normalized = value.strip().lower()
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            ordered.append(value.strip())
        return ordered


class YouTubeRealCrawler(BaseCrawler):
    platform_name = "youtube"

    def __init__(self, config, transport: httpx.AsyncBaseTransport | None = None) -> None:
        super().__init__(config)
        self._client = YouTubeCrawlerClient(config, transport=transport)
        self._mapper = YouTubeResponseMapper()

    async def start(self) -> None:
        await self._client.start()

    async def close(self) -> None:
        await self._client.close()

    async def crawl(self, profile: PlatformProfile) -> RawSocialData:
        query = (profile.youtube or "").strip()
        if not query:
            logger.warning("Skipping YouTube crawl for profile %s: missing youtube identity", profile.id)
            return RawSocialData(platform=self.platform_name)

        try:
            raw_response = await self._client.fetch_raw_response(
                query=query,
                max_videos=DEFAULT_MAX_VIDEOS,
                max_comments_per_video=DEFAULT_MAX_COMMENTS_PER_VIDEO,
            )
            return self._mapper.map(raw_response)
        except CrawlerInputError as exc:
            logger.warning("Skipping YouTube crawl for profile %s: %s", profile.id, exc)
        except (CrawlerRateLimitError, CrawlerTransportError, CrawlerResponseError) as exc:
            logger.error("YouTube crawl failed for profile %s: %s", profile.id, exc)
        except Exception as exc:  # pragma: no cover - defensive guard
            logger.exception("Unexpected YouTube crawl failure for profile %s", profile.id, exc_info=exc)

        return RawSocialData(platform=self.platform_name)