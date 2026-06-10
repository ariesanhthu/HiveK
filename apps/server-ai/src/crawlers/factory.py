from __future__ import annotations

import logging

from src.configs.app import AppConfig
from src.crawlers.base import BaseCrawler
from src.crawlers.tiktok import TikTokCrawler
from src.crawlers.youtube import YouTubeCrawler
from src.crawlers.youtube_real import YouTubeRealCrawler


logger = logging.getLogger(__name__)


def build_crawlers(config: AppConfig) -> dict[str, BaseCrawler]:
    if config.crawler_mode == "real":
        logger.info("Using real YouTube crawler mode")
        youtube_crawler: BaseCrawler = YouTubeRealCrawler(config)
    else:
        logger.info("Using placeholder YouTube crawler mode")
        youtube_crawler = YouTubeCrawler(config)

    return {
        "tiktok": TikTokCrawler(config),
        "youtube": youtube_crawler,
    }