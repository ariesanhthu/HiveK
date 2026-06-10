from __future__ import annotations

from abc import ABC, abstractmethod

from src.configs.app import AppConfig
from src.models.domain import PlatformProfile, RawSocialData


class BaseCrawler(ABC):
    platform_name: str

    def __init__(self, config: AppConfig) -> None:
        self._config = config

    async def start(self) -> None:
        return None

    async def close(self) -> None:
        return None

    @abstractmethod
    async def crawl(self, profile: PlatformProfile) -> RawSocialData:
        raise NotImplementedError