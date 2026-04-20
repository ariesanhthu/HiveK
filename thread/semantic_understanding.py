from dataclasses import asdict, dataclass
from typing import Dict, Iterable, List

import numpy as np
import torch
from transformers import AutoModel, AutoTokenizer

from data_processing import ProcessedRecord


def mean_pooling(token_embeddings: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    summed = torch.sum(token_embeddings * input_mask_expanded, dim=1)
    summed_mask = torch.clamp(input_mask_expanded.sum(dim=1), min=1e-9)
    return summed / summed_mask


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


@dataclass
class SemanticRecord:
    record_id: str
    platform: str
    text: str
    context: str
    created_at: str
    source: str
    sentiment_label: str
    sentiment_score: float
    topic_label: str
    topic_score: float
    entity_label: str
    entity_score: float
    toxicity_score: float
    controversy_flag: int
    embedding: List[float]
    metadata: Dict


class PhoBERTSemanticEngine:
    """Use PhoBERT embeddings + prototype matching for semantic labels."""

    def __init__(self, model_name: str = "vinai/phobert-base") -> None:
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.model.eval()

        #chỗ này có thể cải thiện bằng cách sử dụng một tập prototype lớn hơn 
        # hoặc được tinh chỉnh hơn dựa trên dữ liệu thực tế. 
        # Hiện tại chỉ là ví dụ đơn giản để minh họa ý tưởng.
        self.sentiment_prototypes = {
            "positive": "noi dung tich cuc ung ho khen ngoi",
            "neutral": "noi dung trung lap thong tin binh thuong",
            "negative": "noi dung tieu cuc chi trich cong kich",
        }
        self.topic_prototypes = {
            "music": "am nhac ca si bai hat san pham nghe thuat",
            "drama": "scandal drama tin don tranh cai cong kich",
            "fan_community": "fanclub ung ho than tuong binh luan cong dong",
            "lifestyle": "doi song chia se ca nhan cam xuc thuong ngay",
            "business": "quang cao ban hang san pham thuong mai",
        }
        self.entity_prototypes = {
            "lamoon": "lamoon nghe si lamoon",
            "justatee": "justatee rapper justa tee",
            "fanbase": "fan fanclub cong dong nguoi ham mo",
            "brand": "nhan hang thuong hieu shop san pham",
            "other_person": "nguoi khac nhan vat khac",
        }

        self._sentiment_emb = self._embed_texts(self.sentiment_prototypes)
        self._topic_emb = self._embed_texts(self.topic_prototypes)
        self._entity_emb = self._embed_texts(self.entity_prototypes)

        self.toxicity_keywords = {
            "ngu", "xau", "toxic", "ghet", "anti", "cong kich", "chui", "drama", "boi nho", "fake"
        }
        self.controversy_keywords = {
            "tin don", "scandal", "be 3", "ngoai tinh", "phat ngon", "bi to", "dao chieu"
        }

    def _embed(self, text: str) -> np.ndarray:
        encoded = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=256)
        with torch.no_grad():
            outputs = self.model(**encoded)
        pooled = mean_pooling(outputs.last_hidden_state, encoded["attention_mask"])
        return pooled[0].cpu().numpy()

    def _embed_texts(self, mapping: Dict[str, str]) -> Dict[str, np.ndarray]:
        return {label: self._embed(description) for label, description in mapping.items()}

    def _label_by_similarity(self, text_emb: np.ndarray, prototype_embs: Dict[str, np.ndarray]) -> (str, float):
        best_label = ""
        best_score = -1.0
        for label, emb in prototype_embs.items():
            score = cosine_similarity(text_emb, emb)
            if score > best_score:
                best_label = label
                best_score = score
        return best_label, best_score

    def _toxicity_score(self, text: str) -> float:
        tokens = text.split()
        if not tokens:
            return 0.0
        toxic_hits = sum(1 for t in tokens if t in self.toxicity_keywords)
        return min(1.0, toxic_hits / max(1, len(tokens) * 0.2))

    def _controversy_flag(self, text: str, context: str) -> int:
        merged = f"{text} {context}".lower()
        return int(any(keyword in merged for keyword in self.controversy_keywords))

    def transform(self, rows: Iterable[ProcessedRecord]) -> List[SemanticRecord]:
        semantic_rows: List[SemanticRecord] = []

        for row in rows:
            text_emb = self._embed(row.processed_text)
            sentiment_label, sentiment_sim = self._label_by_similarity(text_emb, self._sentiment_emb)
            topic_label, topic_sim = self._label_by_similarity(text_emb, self._topic_emb)
            entity_label, entity_sim = self._label_by_similarity(text_emb, self._entity_emb)

            # Convert sentiment similarity to signed score for later evaluation.
            sentiment_score = sentiment_sim
            if sentiment_label == "negative":
                sentiment_score = -abs(sentiment_sim)
            elif sentiment_label == "neutral":
                sentiment_score = 0.0

            semantic_rows.append(
                SemanticRecord(
                    record_id=row.record_id,
                    platform=row.platform,
                    text=row.processed_text,
                    context=row.context,
                    created_at=row.created_at,
                    source=row.source,
                    sentiment_label=sentiment_label,
                    sentiment_score=float(sentiment_score),
                    topic_label=topic_label,
                    topic_score=float(topic_sim),
                    entity_label=entity_label,
                    entity_score=float(entity_sim),
                    toxicity_score=float(self._toxicity_score(row.processed_text)),
                    controversy_flag=self._controversy_flag(row.processed_text, row.context),
                    embedding=text_emb.astype(float).tolist(),
                    metadata=row.metadata,
                )
            )

        return semantic_rows


def to_dict_list(rows: Iterable[SemanticRecord]) -> List[Dict]:
    return [asdict(row) for row in rows]
