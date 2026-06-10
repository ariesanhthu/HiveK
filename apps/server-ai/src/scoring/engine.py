from __future__ import annotations

from src.configs.scoring import ScoringConfig
from src.models.domain import FeatureBundle, ScoreComponents
from src.models.dto import ScorePayload


class KOLScoringEngine:
    def __init__(self, config: ScoringConfig) -> None:
        self._config = config

    def score(self, features: FeatureBundle) -> ScoreComponents:
        weighted_sum = (
            features.sentiment_score * self._config.sentiment_weight
            + features.engagement_quality * self._config.engagement_weight
            + features.topic_authority * self._config.topic_weight
            + (100.0 - features.controversy_risk) * self._config.controversy_weight
        )

        weight_total = (
            self._config.sentiment_weight
            + self._config.engagement_weight
            + self._config.topic_weight
            + self._config.controversy_weight
        )

        kol_score = weighted_sum / weight_total if weight_total else 0.0

        return ScoreComponents(
            sentiment_score=round(features.sentiment_score, 2),
            engagement_quality=round(features.engagement_quality, 2),
            topic_authority=round(features.topic_authority, 2),
            controversy_risk=round(features.controversy_risk, 2),
            kol_score=round(max(0.0, min(100.0, kol_score)), 2),
        )

    def to_payload(self, scores: ScoreComponents) -> ScorePayload:
        return ScorePayload(
            sentimentScore=scores.sentiment_score,
            engagementQuality=scores.engagement_quality,
            topicAuthority=scores.topic_authority,
            controversyRisk=scores.controversy_risk,
            kolScore=scores.kol_score,
        )