from __future__ import annotations

from collections import Counter

from src.feature_extractors.base import BaseFeatureExtractor
from src.feature_extractors.embeddings import EmbeddingProvider, MockEmbeddingProvider
from src.models.domain import FeatureBundle, NormalizedSocialData


class SocialFeatureExtractor(BaseFeatureExtractor):
    def __init__(self, embedding_provider: EmbeddingProvider | None = None) -> None:
        self._embedding_provider = embedding_provider or MockEmbeddingProvider()
        self._positive_anchors = ["good quality", "helpful content", "valuable insight", "positive community"]
        self._neutral_anchors = ["balanced discussion", "informational content", "neutral tone"]
        self._negative_anchors = ["spam content", "toxic behavior", "negative sentiment", "controversial issue"]

    def extract(self, normalized: NormalizedSocialData) -> FeatureBundle:
        sentiment_score = self._score_sentiment(normalized)
        engagement_quality = self._score_engagement(normalized)
        topic_authority = self._score_topic_authority(normalized)
        controversy_risk = self._score_controversy(normalized, sentiment_score)

        diagnostics = {
            "platforms": normalized.platforms,
            "dominant_topic": normalized.dominant_topic,
            "total_texts": len(normalized.texts),
        }

        return FeatureBundle(
            sentiment_score=sentiment_score,
            engagement_quality=engagement_quality,
            topic_authority=topic_authority,
            controversy_risk=controversy_risk,
            dominant_topic=normalized.dominant_topic,
            diagnostics=diagnostics,
        )

    def _score_sentiment(self, normalized: NormalizedSocialData) -> float:
        if not normalized.texts:
            return 50.0

        sentiment_votes: list[float] = []
        for text in normalized.texts:
            positive = max(self._embedding_provider.similarity(text, anchor) for anchor in self._positive_anchors)
            neutral = max(self._embedding_provider.similarity(text, anchor) for anchor in self._neutral_anchors)
            negative = max(self._embedding_provider.similarity(text, anchor) for anchor in self._negative_anchors)
            sentiment_votes.append(50.0 + (positive - negative) * 35.0 + (neutral - 0.5) * 20.0)

        return self._clamp(sum(sentiment_votes) / len(sentiment_votes))

    def _score_engagement(self, normalized: NormalizedSocialData) -> float:
        metrics = normalized.engagement_metrics
        volume = metrics.get("comments", 0.0) + metrics.get("likes", 0.0) + metrics.get("shares", 0.0)
        interaction_depth = normalized.reply_count + normalized.comment_count
        text_depth = normalized.average_text_length
        diversity = len(normalized.topic_counts)

        score = (
            min(volume / 20_000.0 * 100.0, 100.0) * 0.45
            + min(interaction_depth / 40.0 * 100.0, 100.0) * 0.30
            + min(text_depth / 18.0 * 100.0, 100.0) * 0.15
            + min(diversity / 5.0 * 100.0, 100.0) * 0.10
        )
        return self._clamp(score)

    def _score_topic_authority(self, normalized: NormalizedSocialData) -> float:
        if not normalized.topic_counts:
            return 0.0

        total_topics = sum(normalized.topic_counts.values())
        if total_topics <= 0:
            return 0.0

        dominant_count = max(normalized.topic_counts.values())
        return self._clamp((dominant_count / total_topics) * 100.0)

    def _score_controversy(self, normalized: NormalizedSocialData, sentiment_score: float) -> float:
        negative_cues = ["toxic", "spam", "attack", "controversy", "drama", "fake"]
        counts = Counter()
        for text in normalized.texts:
            lowered = text.lower()
            for cue in negative_cues:
                if cue in lowered:
                    counts[cue] += 1

        cue_score = min(sum(counts.values()) * 12.0, 100.0)
        volatility = max(0.0, 100.0 - sentiment_score)
        reply_pressure = min(normalized.reply_count * 2.5, 100.0)
        risk = cue_score * 0.45 + volatility * 0.35 + reply_pressure * 0.20
        return self._clamp(risk)

    @staticmethod
    def _clamp(value: float) -> float:
        return max(0.0, min(100.0, value))