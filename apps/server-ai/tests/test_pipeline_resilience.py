from __future__ import annotations

import logging
import unittest

from src.configs.app import AppConfig
from src.configs.scoring import ScoringConfig
from src.crawlers.base import BaseCrawler
from src.crawlers.factory import build_crawlers
from src.feature_extractors.embeddings import MockEmbeddingProvider
from src.feature_extractors.social import SocialFeatureExtractor
from src.models.dto import PipelineRunRequest
from src.models.domain import PlatformProfile, RawSocialData
from src.pipeline.orchestrator import KOLPipelineOrchestrator
from src.processors.normalization import SocialNormalizer
from src.scheduler.daily_pipeline import DailyPipelineScheduler
from src.scoring.engine import KOLScoringEngine
from src.utils.pagination import CursorPage


class DummyProfileService:
    def __init__(self, profiles: list[PlatformProfile]) -> None:
        self._profiles = profiles

    async def fetch_profiles(
        self,
        cursor: str | None,
        limit: int,
        *,
        due_for_crawl: bool = False,
    ) -> CursorPage[PlatformProfile]:
        return CursorPage(items=self._profiles[:limit], next_cursor=None)

    async def save_scores(self, profile_id: str, scores):
        return {"profile_id": profile_id, "scores": scores.model_dump(by_alias=True)}


class PassingCrawler(BaseCrawler):
    platform_name = "tiktok"

    async def crawl(self, profile: PlatformProfile) -> RawSocialData:
        return RawSocialData(
            platform=self.platform_name,
            comments=["useful comment"],
            captions=["caption"],
            posts=["post"],
            engagement_metrics={"likes": 10.0, "comments": 1.0, "shares": 0.0, "views": 100.0, "replies": 1.0},
            topics=["topic"],
            replies=["reply"],
        )


class FailingCrawler(BaseCrawler):
    platform_name = "youtube"

    async def crawl(self, profile: PlatformProfile) -> RawSocialData:
        raise RuntimeError("crawler exploded")


class PipelineResilienceTests(unittest.IsolatedAsyncioTestCase):
    async def test_profile_continues_when_one_crawler_fails(self) -> None:
        profile_service = DummyProfileService([PlatformProfile(id="kol-1", tiktok="mock", youtube="handle")])
        orchestrator = KOLPipelineOrchestrator(
            profile_service=profile_service,
            crawlers={"tiktok": PassingCrawler(AppConfig()), "youtube": FailingCrawler(AppConfig())},
            normalizer=SocialNormalizer(),
            feature_extractor=SocialFeatureExtractor(embedding_provider=MockEmbeddingProvider()),
            scoring_engine=KOLScoringEngine(ScoringConfig()),
            config=AppConfig(),
            logger=logging.getLogger("pipeline-test"),
        )

        summary = await orchestrator.run(request=PipelineRunRequest(limit=1))
        self.assertEqual(summary.processed, 1)
        self.assertEqual(summary.updated, 1)
        self.assertEqual(summary.failed, 0)

    def test_factory_switches_modes(self) -> None:
        placeholder_crawlers = build_crawlers(AppConfig(crawler_mode="placeholder"))
        real_crawlers = build_crawlers(AppConfig(crawler_mode="real", crawler_api_key="test-key"))

        self.assertEqual(placeholder_crawlers["youtube"].__class__.__name__, "YouTubeCrawler")
        self.assertEqual(real_crawlers["youtube"].__class__.__name__, "YouTubeRealCrawler")

    async def test_scheduler_uses_due_for_crawl_and_rotates_cursor(self) -> None:
        calls: list[PipelineRunRequest] = []

        async def run_pipeline(request: PipelineRunRequest):
            calls.append(request)
            next_cursor = "cursor-2" if request.cursor is None else None
            return type("Summary", (), {"next_cursor": next_cursor})()

        scheduler = DailyPipelineScheduler(
            config=AppConfig(scheduler_top_kol_limit=20),
            run_pipeline=run_pipeline,
            logger=logging.getLogger("scheduler-test"),
        )

        await scheduler.run_once()
        await scheduler.run_once()

        self.assertEqual(len(calls), 2)
        self.assertTrue(calls[0].dueForCrawl)
        self.assertEqual(calls[0].runMode, "scheduled")
        self.assertIsNone(calls[0].cursor)
        self.assertEqual(calls[1].cursor, "cursor-2")

    async def test_status_tracks_completed_run(self) -> None:
        profile_service = DummyProfileService([PlatformProfile(id="kol-1", tiktok="mock")])
        orchestrator = KOLPipelineOrchestrator(
            profile_service=profile_service,
            crawlers={"tiktok": PassingCrawler(AppConfig()), "youtube": FailingCrawler(AppConfig())},
            normalizer=SocialNormalizer(),
            feature_extractor=SocialFeatureExtractor(embedding_provider=MockEmbeddingProvider()),
            scoring_engine=KOLScoringEngine(ScoringConfig()),
            config=AppConfig(),
            logger=logging.getLogger("pipeline-status-test"),
        )

        await orchestrator.run(PipelineRunRequest(limit=1))
        status = orchestrator.get_status()

        self.assertEqual(status.status, "succeeded")
        self.assertEqual(status.processed, 1)
        self.assertEqual(status.updated, 1)
        self.assertEqual(status.failed, 0)
