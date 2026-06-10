import html
import json
import re
from datetime import datetime
from typing import Any, Optional

import httpx

from core.entities.kpi_log import KpiMetrics
from core.exceptions.domain_exceptions import ScraperError
from core.interfaces.scraper import ISocialScraper


class TikTokScraper(ISocialScraper):
    _SCRIPT_PATTERNS = (
        r'<script[^>]+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>',
        r'<script[^>]+id="SIGI_STATE"[^>]*>(.*?)</script>',
        r'<script[^>]+id="__NEXT_DATA__"[^>]*>(.*?)</script>',
    )
    _METRIC_KEY_ALIASES = {
        "views": ("playCount", "viewCount", "views"),
        "likes": ("diggCount", "likeCount", "likes"),
        "comments": ("commentCount", "comments"),
        "shares": ("shareCount", "shares"),
    }
    _HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.tiktok.com/",
    }

    async def tracking_kpi(self, url: str, last_time_tracking: Optional[datetime] = None) -> KpiMetrics:
        """
        Tracks TikTok KPI metrics for a specific video URL.

        This uses direct HTTP page JSON extraction first, avoiding a browser session
        or TikTokApi when the public video page includes embedded rehydration data.
        """
        try:
            item_struct = await self._extract_video_item_struct(url)
        except Exception as exc:
            raise ScraperError(f"Failed to scrape TikTok KPI metrics: {exc}", url) from exc

        stats = self._extract_stats(item_struct)
        return KpiMetrics(
            views=self._read_metric(stats, "views"),
            likes=self._read_metric(stats, "likes"),
            comments=self._read_metric(stats, "comments"),
            shares=self._read_metric(stats, "shares"),
        )

    async def _extract_video_item_struct(self, url: str) -> dict[str, Any]:
        async with httpx.AsyncClient(headers=self._HEADERS, follow_redirects=True, timeout=20.0) as client:
            response = await client.get(url)
            response.raise_for_status()

        payloads = self._extract_json_payloads(response.text)
        if not payloads:
            raise ValueError("Could not find TikTok JSON payload in page HTML.")

        for payload in payloads:
            item_struct = self._find_item_struct(payload)
            if item_struct:
                return item_struct

        raise ValueError("Could not find TikTok video metrics in JSON payload.")

    def _extract_json_payloads(self, page_html: str) -> list[dict[str, Any]]:
        payloads: list[dict[str, Any]] = []

        for pattern in self._SCRIPT_PATTERNS:
            for match in re.finditer(pattern, page_html, flags=re.DOTALL):
                raw_payload = html.unescape(match.group(1)).strip()
                if not raw_payload:
                    continue

                try:
                    payloads.append(json.loads(raw_payload))
                except json.JSONDecodeError:
                    continue

        return payloads

    def _find_item_struct(self, payload: Any) -> dict[str, Any] | None:
        known_paths = (
            ("__DEFAULT_SCOPE__", "webapp.video-detail", "itemInfo", "itemStruct"),
            ("ItemModule",),
            ("itemModule",),
        )

        for path in known_paths:
            value = self._get_path(payload, path)
            if isinstance(value, dict):
                if self._looks_like_item_struct(value):
                    return value

                for nested_value in value.values():
                    if isinstance(nested_value, dict) and self._looks_like_item_struct(nested_value):
                        return nested_value

        return self._find_first_item_struct(payload)

    def _find_first_item_struct(self, value: Any) -> dict[str, Any] | None:
        if isinstance(value, dict):
            if self._looks_like_item_struct(value):
                return value

            for nested_value in value.values():
                found = self._find_first_item_struct(nested_value)
                if found:
                    return found

        if isinstance(value, list):
            for item in value:
                found = self._find_first_item_struct(item)
                if found:
                    return found

        return None

    def _looks_like_item_struct(self, value: dict[str, Any]) -> bool:
        stats = self._extract_stats(value)
        metric_keys = {key for aliases in self._METRIC_KEY_ALIASES.values() for key in aliases}
        return len(metric_keys.intersection(stats.keys())) >= 3

    @staticmethod
    def _extract_stats(item_struct: dict[str, Any]) -> dict[str, Any]:
        stats = item_struct.get("stats") or item_struct.get("statistics") or item_struct
        return stats if isinstance(stats, dict) else {}

    def _read_metric(self, stats: dict[str, Any], metric_name: str) -> int:
        for key in self._METRIC_KEY_ALIASES[metric_name]:
            if key in stats:
                return self._to_int(stats[key])
        return 0

    @staticmethod
    def _to_int(value: Any) -> int:
        if value is None:
            return 0

        if isinstance(value, (int, float)):
            return int(value)

        text = str(value).strip().replace(",", "")
        match = re.fullmatch(r"(\d+(?:\.\d+)?)([KMB])?", text, flags=re.IGNORECASE)
        if not match:
            return 0

        number = float(match.group(1))
        suffix = (match.group(2) or "").upper()
        multiplier = {"K": 1_000, "M": 1_000_000, "B": 1_000_000_000}.get(suffix, 1)
        return int(number * multiplier)

    @staticmethod
    def _get_path(value: Any, path: tuple[str, ...]) -> Any:
        current = value
        for key in path:
            if not isinstance(current, dict):
                return None
            current = current.get(key)
        return current
