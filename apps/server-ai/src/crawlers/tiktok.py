from __future__ import annotations

import random

from src.crawlers.base import BaseCrawler
from src.models.domain import PlatformProfile, RawSocialData
from src.utils.ids import stable_int


class TikTokCrawler(BaseCrawler):
    platform_name = "tiktok"

    async def crawl(self, profile: PlatformProfile) -> RawSocialData:
        seed = stable_int(profile.id, self.platform_name, profile.tiktok or "", self._config.crawler_seed_salt)
        rng = random.Random(seed)
        topics = rng.sample(["tech", "beauty", "gaming", "food", "travel", "finance"], k=2)

        comments = [
            f"{profile.tiktok or profile.id} clip nay on, chia se rat ro rang ve {topics[0]}",
            f"Noi dung ngan gon nhung co chat luong, co the ke them ve {topics[1]}",
            f"Phan giai thich de hieu va co gia tri cho nguoi xem",
        ]

        captions = [
            f"TikTok recap for {profile.tiktok or profile.id}",
            f"Mock caption about {topics[0]} and {topics[1]}",
        ]

        posts = [f"Post about {topic} #{idx}" for idx, topic in enumerate(topics, start=1)]
        replies = [
            "Cam on da tra loi chi tiet",
            "Binh luan nay tao them nghia va giu nhiet cho cuoc trao doi",
        ]

        engagement_metrics = {
            "views": float(rng.randint(20_000, 180_000)),
            "likes": float(rng.randint(1_200, 18_000)),
            "comments": float(rng.randint(80, 850)),
            "shares": float(rng.randint(25, 400)),
            "replies": float(rng.randint(10, 120)),
        }

        return RawSocialData(
            platform=self.platform_name,
            comments=comments,
            captions=captions,
            posts=posts,
            engagement_metrics=engagement_metrics,
            topics=topics,
            replies=replies,
        )