from collections import Counter
from dataclasses import asdict, dataclass
from typing import Dict, Iterable, List

from semantic_understanding import SemanticRecord


@dataclass
class EvaluationRecord:
    record_id: str
    sentiment_label: str
    topic_label: str
    entity_label: str
    sentiment_score_component: float
    engagement_quality: float
    topic_authority: float
    controversy_risk: float
    kol_score: float


class KOLEvaluator:
    def __init__(
        self,
        kol_weights: Dict[str, float] = None,
        risk_weights: Dict[str, float] = None,
    ) -> None:
        self.kol_weights = kol_weights or {
            "sentiment": 0.35,
            "engagement": 0.25,
            "authority": 0.25,
            "risk": 0.15,
        }
        self.risk_weights = risk_weights or {
            "negative_ratio": 0.5,
            "toxicity": 0.3,
            "controversy": 0.2,
        }

    def _sentiment_score(self, rows: List[SemanticRecord]) -> float:
        total = len(rows)
        if total == 0:
            return 0.0
        pos = sum(1 for r in rows if r.sentiment_label == "positive")
        neg = sum(1 for r in rows if r.sentiment_label == "negative")
        return ((pos - neg) / total) * 100.0

    def _estimate_engagement(self, row: SemanticRecord) -> Dict[str, float]:
        meta = row.metadata or {}
        likes = float(meta.get("likes", 0) or 0)
        shares = float(meta.get("shares", 0) or 0)
        comments = float(meta.get("comments", 1) or 1)

        engagement_volume = likes + shares + comments

        text_len = len(row.text.split())
        meaningful_ratio = min(1.0, text_len / 20.0)
        discussion_depth = min(1.0, comments / 20.0)

        quality = min(100.0, (0.4 * meaningful_ratio + 0.6 * discussion_depth) * 100.0)
        return {
            "volume": engagement_volume,
            "quality": quality,
        }

    def _topic_authority(self, rows: List[SemanticRecord]) -> float:
        if not rows:
            return 0.0

        topic_counter = Counter(r.topic_label for r in rows)
        main_topic, main_topic_count = topic_counter.most_common(1)[0]

        domain_ratio = main_topic_count / len(rows)

        domain_engagement = []
        for r in rows:
            if r.topic_label == main_topic:
                domain_engagement.append(self._estimate_engagement(r)["volume"])

        avg_engagement = sum(domain_engagement) / max(1, len(domain_engagement))
        normalized_engagement = min(1.0, avg_engagement / 100.0)

        return domain_ratio * normalized_engagement * 100.0

    def _risk_score(self, rows: List[SemanticRecord]) -> float:
        if not rows:
            return 0.0

        negative_ratio = sum(1 for r in rows if r.sentiment_label == "negative") / len(rows)
        toxicity_score = sum(r.toxicity_score for r in rows) / len(rows)
        controversy_topic_ratio = sum(r.controversy_flag for r in rows) / len(rows)

        risk = (
            self.risk_weights["negative_ratio"] * negative_ratio
            + self.risk_weights["toxicity"] * toxicity_score
            + self.risk_weights["controversy"] * controversy_topic_ratio
        ) * 100.0
        return risk

    def evaluate(self, rows: Iterable[SemanticRecord]) -> Dict:
        row_list = list(rows)
        if not row_list:
            return {
                "records": [],
                "summary": {
                    "sentiment_score": 0.0,
                    "engagement_quality": 0.0,
                    "topic_authority": 0.0,
                    "controversy_risk": 0.0,
                    "kol_score": 0.0,
                },
            }

        sentiment_score = self._sentiment_score(row_list)
        topic_authority = self._topic_authority(row_list)
        risk_score = self._risk_score(row_list)

        engagement_quality = (
            sum(self._estimate_engagement(r)["quality"] for r in row_list) / len(row_list)
        )

        kol_score = (
            self.kol_weights["sentiment"] * sentiment_score
            + self.kol_weights["engagement"] * engagement_quality
            + self.kol_weights["authority"] * topic_authority
            + self.kol_weights["risk"] * (100.0 - risk_score)
        )

        eval_rows: List[EvaluationRecord] = []
        for row in row_list:
            eval_rows.append(
                EvaluationRecord(
                    record_id=row.record_id,
                    sentiment_label=row.sentiment_label,
                    topic_label=row.topic_label,
                    entity_label=row.entity_label,
                    sentiment_score_component=sentiment_score,
                    engagement_quality=self._estimate_engagement(row)["quality"],
                    topic_authority=topic_authority,
                    controversy_risk=risk_score,
                    kol_score=kol_score,
                )
            )

        return {
            "records": [asdict(r) for r in eval_rows],
            "summary": {
                "sentiment_score": sentiment_score,
                "engagement_quality": engagement_quality,
                "topic_authority": topic_authority,
                "controversy_risk": risk_score,
                "kol_score": kol_score,
            },
        }
