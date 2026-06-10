from __future__ import annotations

import unittest

import httpx

from src.configs.app import AppConfig
from src.crawlers.errors import CrawlerRateLimitError
from src.crawlers.youtube_real import (
    YouTubeCrawlerClient,
    YouTubeRawCrawlerResponse,
    YouTubeResponseMapper,
    YouTubeRealCrawler,
)
from src.models.domain import PlatformProfile


def _make_success_transport() -> httpx.MockTransport:
    def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if path.endswith("/search"):
            return httpx.Response(
                200,
                json={
                    "items": [{"id": {"videoId": "video-1"}}],
                    "nextPageToken": None,
                },
            )
        if path.endswith("/videos"):
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "id": "video-1",
                            "snippet": {
                                "channelId": "channel-1",
                                "channelTitle": "HiveK Channel",
                                "publishedAt": "2026-06-01T00:00:00Z",
                                "title": "AI crawl demo",
                                "description": "YouTube data integration example",
                                "tags": ["ai", "crawl"],
                            },
                            "statistics": {
                                "viewCount": "1234",
                                "likeCount": "99",
                                "commentCount": "7",
                            },
                        }
                    ]
                },
            )
        if path.endswith("/commentThreads"):
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "id": "comment-1",
                            "snippet": {
                                "topLevelComment": {
                                    "snippet": {
                                        "textOriginal": "Great breakdown",
                                        "likeCount": 4,
                                        "publishedAt": "2026-06-02T00:00:00Z",
                                    }
                                },
                                "totalReplyCount": 2,
                            },
                            "replies": {
                                "comments": [
                                    {"snippet": {"textOriginal": "Reply one"}},
                                    {"snippet": {"textOriginal": "Reply two"}},
                                ]
                            },
                        }
                    ]
                },
            )
        return httpx.Response(404, json={"error": {"message": "not found", "code": 404}})

    return httpx.MockTransport(handler)


def _make_error_transport() -> httpx.MockTransport:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            429,
            json={
                "error": {
                    "code": 429,
                    "message": "Rate limit exceeded",
                    "errors": [{"reason": "quotaExceeded"}],
                }
            },
        )

    return httpx.MockTransport(handler)


def _make_comment_disabled_transport() -> httpx.MockTransport:
    def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if path.endswith("/search"):
            return httpx.Response(200, json={"items": [{"id": {"videoId": "video-1"}}]})
        if path.endswith("/videos"):
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "id": "video-1",
                            "snippet": {"title": "Video title"},
                            "statistics": {},
                        }
                    ]
                },
            )
        if path.endswith("/commentThreads"):
            return httpx.Response(
                403,
                json={
                    "error": {
                        "code": 403,
                        "message": "commentsDisabled",
                        "errors": [{"reason": "commentsDisabled"}],
                    }
                },
            )
        return httpx.Response(404)

    return httpx.MockTransport(handler)


class YouTubeRealCrawlerTests(unittest.IsolatedAsyncioTestCase):
    async def test_client_success_and_mapper(self) -> None:
        client = YouTubeCrawlerClient(
            AppConfig(
                crawler_api_base_url="https://www.googleapis.com/youtube/v3",
                crawler_api_key="test-key",
                crawler_timeout_seconds=5.0,
                crawler_retry_count=1,
                crawler_retry_delay_seconds=0.0,
            ),
            transport=_make_success_transport(),
        )
        await client.start()

        raw_response = await client.fetch_raw_response(query="HiveK", max_videos=1, max_comments_per_video=2)
        self.assertEqual(raw_response.query, "HiveK")
        self.assertEqual(len(raw_response.videos), 1)

        mapped = YouTubeResponseMapper().map(raw_response)
        self.assertEqual(mapped.platform, "youtube")
        self.assertEqual(mapped.comments, ["Great breakdown"])
        self.assertEqual(mapped.replies, ["Reply one", "Reply two"])
        self.assertEqual(mapped.engagement_metrics["views"], 1234.0)
        self.assertEqual(mapped.engagement_metrics["likes"], 99.0)
        self.assertEqual(mapped.engagement_metrics["comments"], 7.0)
        self.assertEqual(mapped.engagement_metrics["replies"], 2.0)
        self.assertIn("ai", mapped.topics)

        await client.close()

    async def test_client_handles_rate_limit(self) -> None:
        client = YouTubeCrawlerClient(
            AppConfig(
                crawler_api_base_url="https://www.googleapis.com/youtube/v3",
                crawler_api_key="test-key",
                crawler_timeout_seconds=5.0,
                crawler_retry_count=1,
                crawler_retry_delay_seconds=0.0,
            ),
            transport=_make_error_transport(),
        )
        await client.start()

        with self.assertRaises(CrawlerRateLimitError):
            await client.fetch_raw_response(query="HiveK", max_videos=1, max_comments_per_video=1)

        await client.close()

    async def test_real_crawler_missing_username_returns_empty_payload(self) -> None:
        crawler = YouTubeRealCrawler(
            AppConfig(
                crawler_mode="real",
                crawler_api_base_url="https://www.googleapis.com/youtube/v3",
                crawler_api_key="test-key",
                crawler_timeout_seconds=5.0,
                crawler_retry_count=1,
                crawler_retry_delay_seconds=0.0,
            ),
            transport=_make_success_transport(),
        )

        payload = await crawler.crawl(PlatformProfile(id="kol-1", youtube=None))
        self.assertEqual(payload.platform, "youtube")
        self.assertEqual(payload.comments, [])
        self.assertEqual(payload.posts, [])

    async def test_comment_disabled_does_not_fail_video_crawl(self) -> None:
        client = YouTubeCrawlerClient(
            AppConfig(
                crawler_api_base_url="https://www.googleapis.com/youtube/v3",
                crawler_api_key="test-key",
                crawler_timeout_seconds=5.0,
                crawler_retry_count=1,
                crawler_retry_delay_seconds=0.0,
            ),
            transport=_make_comment_disabled_transport(),
        )
        await client.start()

        raw_response = await client.fetch_raw_response(query="HiveK", max_videos=1, max_comments_per_video=2)
        self.assertEqual(len(raw_response.videos), 1)
        self.assertIn("video-1", raw_response.comment_threads)
        self.assertEqual(raw_response.comment_threads["video-1"].items, [])

        await client.close()


class RawResponseParsingTests(unittest.TestCase):
    def test_mapper_handles_missing_fields_safely(self) -> None:
        raw_response = YouTubeRawCrawlerResponse.model_validate(
            {
                "query": "hivek",
                "videos": [
                    {
                        "id": "video-1",
                        "snippet": {"title": "Only title"},
                        "statistics": {},
                    }
                ],
                "comment_threads": {},
                "warnings": ["Missing optional metadata"],
            }
        )

        mapped = YouTubeResponseMapper().map(raw_response)
        self.assertEqual(mapped.platform, "youtube")
        self.assertEqual(mapped.posts[0], "Only title https://www.youtube.com/watch?v=video-1")
        self.assertEqual(mapped.engagement_metrics["views"], 0.0)
