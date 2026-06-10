from __future__ import annotations

import random

from src.crawlers.base import BaseCrawler
from src.models.domain import PlatformProfile, RawSocialData
from src.utils.ids import stable_int


class YouTubeCrawler(BaseCrawler):
    platform_name = "youtube"

    async def crawl(self, profile: PlatformProfile) -> RawSocialData:
        seed = stable_int(profile.id, self.platform_name, profile.youtube or "", self._config.crawler_seed_salt)
        rng = random.Random(seed)
        topics = rng.sample(["education", "technology", "business", "lifestyle", "music", "review"], k=2)

        comments = [
            f"Video phan tich ro va co chieu sau ve {topics[0]}",
            f"Luc luong noi dung on dinh, phu hop cho nguoi quan tam den {topics[1]}",
            f"Thong diep trong sang va co tinh xay dung",
            f"Binh luan co bieu hien tich cuc va tap trung vao gia tri thuc te",
        ]

        captions = [
            f"YouTube breakdown for {profile.youtube or profile.id}",
            f"In-depth discussion about {topics[0]} and {topics[1]}",
        ]

        posts = [f"Long-form post about {topic} #{idx}" for idx, topic in enumerate(topics, start=1)]
        replies = [
            "Tra loi co tinh xay dung va gop phan lam ro van de",
            "Cam on da chia se them thong tin bo tro huu ich",
            "Noi dung lam tang chat luong cuoc trao doi",
        ]

        engagement_metrics = {
            "views": float(rng.randint(60_000, 320_000)),
            "likes": float(rng.randint(3_000, 22_000)),
            "comments": float(rng.randint(120, 1_100)),
            "shares": float(rng.randint(40, 250)),
            "replies": float(rng.randint(20, 160)),
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