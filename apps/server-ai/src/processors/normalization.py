from __future__ import annotations

from collections import Counter
from statistics import mean

from src.models.domain import NormalizedSocialData, RawSocialData
from src.processors.text import TextProcessor


class SocialNormalizer:
    def __init__(self) -> None:
        self._text_processor = TextProcessor()

    def normalize(self, platform_payloads: list[RawSocialData]) -> NormalizedSocialData:
        platforms = [payload.platform for payload in platform_payloads]
        all_texts: list[str] = []
        all_topics: Counter[str] = Counter()
        merged_metrics: Counter[str] = Counter()
        comment_lengths: list[int] = []
        reply_lengths: list[int] = []

        for payload in platform_payloads:
            merged_metrics.update(payload.engagement_metrics)
            all_topics.update(topic for topic in payload.topics if topic)

            for bucket in (payload.comments, payload.captions, payload.posts, payload.replies):
                for item in bucket:
                    cleaned = self._text_processor.clean(item)
                    if cleaned:
                        all_texts.append(cleaned)

            comment_lengths.extend(len(self._text_processor.tokenize(text)) for text in payload.comments if text)
            reply_lengths.extend(len(self._text_processor.tokenize(text)) for text in payload.replies if text)

        dominant_topic = all_topics.most_common(1)[0][0] if all_topics else None

        return NormalizedSocialData(
            platforms=platforms,
            texts=all_texts,
            engagement_metrics=dict(merged_metrics),
            topic_counts=dict(all_topics),
            comment_count=sum(len(payload.comments) for payload in platform_payloads),
            caption_count=sum(len(payload.captions) for payload in platform_payloads),
            post_count=sum(len(payload.posts) for payload in platform_payloads),
            reply_count=sum(len(payload.replies) for payload in platform_payloads),
            average_comment_length=mean(comment_lengths) if comment_lengths else 0.0,
            average_reply_length=mean(reply_lengths) if reply_lengths else 0.0,
            average_text_length=mean(len(text.split()) for text in all_texts) if all_texts else 0.0,
            dominant_topic=dominant_topic,
        )