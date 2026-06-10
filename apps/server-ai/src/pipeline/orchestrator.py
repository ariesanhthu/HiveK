from __future__ import annotations

import asyncio
from dataclasses import replace
from datetime import UTC, datetime
from time import perf_counter
from typing import Any

from src.configs.app import AppConfig
from src.crawlers.base import BaseCrawler
from src.feature_extractors.social import SocialFeatureExtractor
from src.models.domain import PipelineRunStatus, PipelineRunSummary, PlatformProfile, RawSocialData
from src.models.dto import CrawlerTrace, PipelineDebugRequest, PipelineRunRequest, ProfileDebugTrace
from src.processors.normalization import SocialNormalizer
from src.scoring.engine import KOLScoringEngine
from src.services.kol_profile_service import KolProfileService


class KOLPipelineOrchestrator:
    def __init__(
        self,
        profile_service: KolProfileService,
        crawlers: dict[str, BaseCrawler],
        normalizer: SocialNormalizer,
        feature_extractor: SocialFeatureExtractor,
        scoring_engine: KOLScoringEngine,
        config: AppConfig,
        logger,
    ) -> None:
        self._profile_service = profile_service
        self._crawlers = crawlers
        self._normalizer = normalizer
        self._feature_extractor = feature_extractor
        self._scoring_engine = scoring_engine
        self._config = config
        self._logger = logger
        self._status = PipelineRunStatus(
            status="idle",
            processed=0,
            updated=0,
            failed=0,
            total=0,
            started_at=None,
            finished_at=None,
            current_profile_id=None,
            last_error=None,
            next_cursor=None,
            run_mode="manual",
            due_for_crawl=False,
        )

    async def run(self, request: PipelineRunRequest) -> PipelineRunSummary:
        return await self._run_internal(request, capture_trace=False)

    async def run_debug(self, request: PipelineDebugRequest) -> dict[str, Any]:
        summary = await self._run_internal(request, capture_trace=True)
        return summary

    def get_status(self) -> PipelineRunStatus:
        return self._status

    async def _run_internal(self, request: PipelineRunRequest, capture_trace: bool) -> Any:
        started_at = perf_counter()
        processed = updated = failed = 0
        next_cursor = request.cursor
        max_items = request.limit or self._config.pipeline_max_profiles
        remaining = max_items
        traces: list[ProfileDebugTrace] = []
        run_mode = request.runMode or "manual"
        started_iso = self._now_iso()
        self._status = PipelineRunStatus(
            status="running",
            processed=0,
            updated=0,
            failed=0,
            total=max_items,
            started_at=started_iso,
            finished_at=None,
            current_profile_id=None,
            last_error=None,
            next_cursor=next_cursor,
            run_mode=run_mode,
            due_for_crawl=request.dueForCrawl,
        )
        self._logger.info(
            "KOL pipeline run started: mode=%s limit=%s cursor=%s due_for_crawl=%s debug=%s",
            run_mode,
            max_items,
            next_cursor,
            request.dueForCrawl,
            capture_trace,
        )

        try:
            while remaining > 0:
                page_limit = min(self._config.platform_page_size, remaining)
                page = await self._profile_service.fetch_profiles(
                    cursor=next_cursor,
                    limit=page_limit,
                    due_for_crawl=request.dueForCrawl,
                )
                self._logger.info(
                    "KOL pipeline fetched profile page: mode=%s requested=%s fetched=%s cursor=%s next_cursor=%s due_for_crawl=%s",
                    run_mode,
                    page_limit,
                    len(page.items),
                    next_cursor,
                    page.next_cursor,
                    request.dueForCrawl,
                )
                if not page.items:
                    break

                semaphore = asyncio.Semaphore(max(1, self._config.pipeline_concurrency))

                async def guarded_process(profile: PlatformProfile) -> dict[str, Any] | None:
                    async with semaphore:
                        return await self._process_profile(profile, run_mode=run_mode)

                results = await asyncio.gather(
                    *(guarded_process(profile) for profile in page.items),
                    return_exceptions=True,
                )

                for result in results:
                    processed += 1
                    if isinstance(result, Exception):
                        failed += 1
                        self._logger.error("KOL pipeline profile processing failed: %s", result)
                        self._status = replace(
                            self._status,
                            processed=processed,
                            failed=failed,
                            last_error=str(result),
                        )
                    else:
                        updated += 1
                        if capture_trace and isinstance(result, dict):
                            traces.append(result["trace"])
                        self._status = replace(
                            self._status,
                            processed=processed,
                            updated=updated,
                        )

                remaining -= len(page.items)
                next_cursor = page.next_cursor
                self._status = replace(self._status, next_cursor=next_cursor)
                if next_cursor is None:
                    break
        except Exception as exc:
            self._status = replace(
                self._status,
                status="failed",
                processed=processed,
                updated=updated,
                failed=failed,
                next_cursor=next_cursor,
                finished_at=self._now_iso(),
                last_error=str(exc),
                current_profile_id=None,
            )
            self._logger.exception("KOL pipeline run failed: mode=%s", run_mode, exc_info=exc)
            raise

        summary = PipelineRunSummary(
            processed=processed,
            updated=updated,
            failed=failed,
            next_cursor=next_cursor,
            duration_seconds=round(perf_counter() - started_at, 3),
        )
        finished_status = "succeeded" if failed == 0 else "completed_with_errors"
        self._status = replace(
            self._status,
            status=finished_status,
            processed=processed,
            updated=updated,
            failed=failed,
            next_cursor=next_cursor,
            finished_at=self._now_iso(),
            current_profile_id=None,
        )
        self._logger.info("KOL pipeline run finished: mode=%s summary=%s", run_mode, summary)

        if capture_trace:
            return {
                "summary": summary,
                "traces": traces,
            }

        return summary

    async def _process_profile(self, profile: PlatformProfile, *, run_mode: str) -> dict[str, Any] | None:
        self._status = replace(self._status, current_profile_id=profile.id)
        self._logger.info(
            "KOL pipeline processing profile: mode=%s profile_id=%s crawl_priority=%s next_crawl_at=%s fail_count=%s",
            run_mode,
            profile.id,
            profile.crawl_priority,
            profile.next_crawl_at,
            profile.crawl_fail_count,
        )
        raw_payloads = await self._crawl_profile(profile)
        normalized = self._normalizer.normalize(raw_payloads)
        features = self._feature_extractor.extract(normalized)
        scores = self._scoring_engine.score(features)
        score_payload = self._scoring_engine.to_payload(scores)
        self._logger.info("KOL pipeline score payload: profile_id=%s payload=%s", profile.id, score_payload)
        try:
            backend_response = await self._profile_service.save_scores(profile.id, score_payload)
        except Exception as exc:
            self._logger.exception("KOL pipeline PATCH failed: profile_id=%s", profile.id, exc_info=exc)
            raise
        self._logger.info("KOL pipeline PATCH succeeded: profile_id=%s response=%s", profile.id, backend_response)

        return {
            "trace": ProfileDebugTrace(
                profile={
                    "_id": profile.id,
                    "tiktok": profile.tiktok,
                    "youtube": profile.youtube,
                    "lastCrawledAt": profile.last_crawled_at,
                    "nextCrawlAt": profile.next_crawl_at,
                    "lastScoreUpdatedAt": profile.last_score_updated_at,
                    "crawlStatus": profile.crawl_status,
                    "crawlFailCount": profile.crawl_fail_count,
                    "crawlPriority": profile.crawl_priority,
                    "lastCrawlError": profile.last_crawl_error,
                    "followerCount": profile.follower_count,
                    "recentlyActive": profile.recently_active,
                    "lastPublishedAt": profile.last_published_at,
                    "lastVideoId": profile.last_video_id,
                    "lastCommentCursor": profile.last_comment_cursor,
                    "lastCrawlSnapshot": profile.last_crawl_snapshot,
                },
                crawlers=[
                    CrawlerTrace(platform=item.platform, rawData=item.__dict__) for item in raw_payloads
                ],
                normalizedInput=normalized.__dict__,
                features=features.__dict__,
                scorePayload=score_payload,
                backendResponse=backend_response,
            )
        }

    async def _crawl_profile(self, profile: PlatformProfile) -> list[RawSocialData]:
        crawlers: list[BaseCrawler] = []
        if profile.tiktok:
            crawlers.append(self._crawlers["tiktok"])
        if profile.youtube:
            crawlers.append(self._crawlers["youtube"])

        if not crawlers:
            return [RawSocialData(platform="placeholder")]

        payloads: list[RawSocialData] = []
        results = await asyncio.gather(*(crawler.crawl(profile) for crawler in crawlers), return_exceptions=True)
        for crawler, result in zip(crawlers, results, strict=False):
            if isinstance(result, Exception):
                self._logger.warning(
                    "Crawler failed for profile %s on platform %s: %s",
                    profile.id,
                    crawler.platform_name,
                    result,
                )
                continue
            payloads.append(result)

        return payloads

    @staticmethod
    def _now_iso() -> str:
        return datetime.now(UTC).isoformat()
