from __future__ import annotations

from abc import ABC, abstractmethod

from src.models.domain import FeatureBundle, NormalizedSocialData


class BaseFeatureExtractor(ABC):
    @abstractmethod
    def extract(self, normalized: NormalizedSocialData) -> FeatureBundle:
        raise NotImplementedError