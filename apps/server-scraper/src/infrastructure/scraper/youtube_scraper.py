import asyncio
from datetime import datetime
from typing import Any, Optional

import yt_dlp

from core.entities.kpi_log import KpiMetrics
from core.exceptions.domain_exceptions import ScraperError
from core.interfaces.scraper import ISocialScraper


class YouTubeScraper(ISocialScraper):
    _YDL_OPTIONS = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": True,
    }

    async def tracking_kpi(self, url: str, last_time_tracking: Optional[datetime] = None) -> KpiMetrics:
        """
        Tracks YouTube KPI metrics for a specific video URL using yt-dlp.

        YouTube does not generally expose public share counts through yt-dlp.
        If yt-dlp returns a share_count field, it is used; otherwise shares is 0.
        """
        try:
            info = await asyncio.to_thread(self._extract_video_info, url)
        except Exception as exc:
            raise ScraperError(f"Failed to scrape YouTube KPI metrics: {exc}", url) from exc

        return KpiMetrics(
            views=self._to_int(info.get("view_count")),
            likes=self._to_int(info.get("like_count")),
            comments=self._to_int(info.get("comment_count")),
            shares=self._to_int(info.get("share_count")),
        )

    def _extract_video_info(self, url: str) -> dict[str, Any]:
        with yt_dlp.YoutubeDL(self._YDL_OPTIONS) as ydl:
            return ydl.extract_info(url, download=False)

    @staticmethod
    def _to_int(value: Any) -> int:
        if value is None:
            return 0

        try:
            return int(value)
        except (TypeError, ValueError):
            return 0
