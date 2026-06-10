from __future__ import annotations

from typing import Any

import httpx

from src.configs.app import AppConfig
from src.models.domain import PlatformProfile
from src.models.dto import PatchKolProfileRequest, PlatformProfilesPageResponse
from src.utils.errors import UpstreamApiError
from src.utils.pagination import CursorPage


class HiveKApiClient:
    def __init__(self, config: AppConfig) -> None:
        self._config = config
        self._client: httpx.AsyncClient | None = None

    async def start(self) -> None:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self._config.api_base_url,
                timeout=self._config.api_timeout_seconds,
                headers={"Content-Type": "application/json"},
            )

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None:
            raise UpstreamApiError("API client has not been started", status_code=500)
        return self._client

    async def list_kol_profiles_platforms(
        self,
        cursor: str | None,
        limit: int,
        *,
        due_for_crawl: bool = False,
    ) -> CursorPage[PlatformProfile]:
        client = self._ensure_client()
        params = {"limit": limit}
        if cursor:
            params["cursor"] = cursor
        if due_for_crawl:
            params["dueForCrawl"] = "true"

        response = await client.get("/kol-profiles/platforms", params=params)
        if due_for_crawl and response.status_code in {400, 404, 422}:
            fallback_params = {"limit": limit}
            if cursor:
                fallback_params["cursor"] = cursor
            response = await client.get("/kol-profiles/platforms", params=fallback_params)

        if response.is_error:
            raise UpstreamApiError(
                f"Failed to load KOL profiles: {response.status_code} {response.text}",
                status_code=response.status_code,
            )

        payload = PlatformProfilesPageResponse.model_validate(response.json())
        items = [
            PlatformProfile(
                id=item.id,
                tiktok=item.tiktok,
                youtube=item.youtube,
                last_crawled_at=item.lastCrawledAt,
                next_crawl_at=item.nextCrawlAt,
                last_score_updated_at=item.lastScoreUpdatedAt,
                crawl_status=item.crawlStatus,
                crawl_fail_count=item.crawlFailCount or 0,
                crawl_priority=item.crawlPriority or 0,
                last_crawl_error=item.lastCrawlError,
                follower_count=item.followerCount,
                recently_active=item.recentlyActive,
                last_published_at=item.lastPublishedAt,
                last_video_id=item.lastVideoId,
                last_comment_cursor=item.lastCommentCursor,
                last_crawl_snapshot=item.lastCrawlSnapshot or {},
            )
            for item in payload.data
        ]
        return CursorPage(items=items, next_cursor=payload.cursor)

    async def patch_kol_profile(self, profile_id: str, request: PatchKolProfileRequest) -> dict[str, Any]:
        client = self._ensure_client()
        request_payload = request.model_dump(by_alias=True)
        response = await client.patch(f"/kol-profiles/{profile_id}", json=request_payload)
        if response.is_error:
            raise UpstreamApiError(
                f"Failed to patch KOL profile {profile_id}: {response.status_code} {response.text}",
                status_code=response.status_code,
            )
        try:
            return response.json()
        except ValueError:
            return {"status": "ok"}

    async def patch_kol_profile_with_trace(
        self, profile_id: str, request: PatchKolProfileRequest
    ) -> dict[str, Any]:
        request_payload = request.model_dump(by_alias=True)
        backend_response = await self.patch_kol_profile(profile_id, request)
        return {
            "request": request_payload,
            "response": backend_response,
        }
