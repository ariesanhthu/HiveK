from __future__ import annotations

from dataclasses import dataclass
from os import getenv


@dataclass(frozen=True)
class ScoringConfig:
    sentiment_weight: float = 0.35
    engagement_weight: float = 0.30
    topic_weight: float = 0.20
    controversy_weight: float = 0.15


def _read_float(name: str, default: float) -> float:
    value = getenv(name)
    return default if value is None else float(value)


def load_scoring_config() -> ScoringConfig:
    return ScoringConfig(
        sentiment_weight=_read_float("SCORING_SENTIMENT_WEIGHT", 0.35),
        engagement_weight=_read_float("SCORING_ENGAGEMENT_WEIGHT", 0.30),
        topic_weight=_read_float("SCORING_TOPIC_WEIGHT", 0.20),
        controversy_weight=_read_float("SCORING_CONTROVERSY_WEIGHT", 0.15),
    )