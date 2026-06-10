from __future__ import annotations

from typing import Any

from src.models.domain import PlatformProfile
from src.models.dto import PatchKolProfileRequest, ScorePayload
from src.services.api_client import HiveKApiClient
from src.utils.pagination import CursorPage, CursorPaginator


class KolProfileService:
    def __init__(self, api_client: HiveKApiClient, page_size: int) -> None:
        self._api_client = api_client
        self._paginator = CursorPaginator[PlatformProfile](page_size)

    async def fetch_profiles(
        self,
        cursor: str | None,
        limit: int,
        *,
        due_for_crawl: bool = False,
    ) -> CursorPage[PlatformProfile]:
        return await self._api_client.list_kol_profiles_platforms(
            cursor=cursor,
            limit=limit,
            due_for_crawl=due_for_crawl,
        )

    async def iterate_profiles(self, cursor: str | None, limit: int | None):
        async for profile in self._paginator.iterate(
            lambda page_cursor, page_limit: self.fetch_profiles(
                page_cursor,
                page_limit,
                due_for_crawl=False,
            ),
            start_cursor=cursor,
            max_items=limit,
        ):
            yield profile

    async def save_scores(self, profile_id: str, scores: ScorePayload) -> dict[str, object]:
        return await self._api_client.patch_kol_profile(profile_id, PatchKolProfileRequest(scores=scores))

    async def save_scores_with_trace(self, profile_id: str, scores: ScorePayload) -> dict[str, Any]:
        return await self._api_client.patch_kol_profile_with_trace(
            profile_id,
            PatchKolProfileRequest(scores=scores),
        )
