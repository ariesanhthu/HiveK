from __future__ import annotations

import hashlib
import math
from typing import Protocol


class EmbeddingProvider(Protocol):
    def embed(self, text: str) -> list[float]:
        raise NotImplementedError

    def similarity(self, left: str, right: str) -> float:
        raise NotImplementedError


class MockEmbeddingProvider:
    vector_size = 16

    def embed(self, text: str) -> list[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        values: list[float] = []
        for index in range(self.vector_size):
            chunk = digest[index * 2 : index * 2 + 2]
            integer = int.from_bytes(chunk, byteorder="big", signed=False)
            values.append((integer % 1000) / 1000.0)
        return values

    def similarity(self, left: str, right: str) -> float:
        left_vector = self.embed(left)
        right_vector = self.embed(right)
        numerator = sum(lhs * rhs for lhs, rhs in zip(left_vector, right_vector))
        left_norm = math.sqrt(sum(value * value for value in left_vector))
        right_norm = math.sqrt(sum(value * value for value in right_vector))
        if left_norm == 0.0 or right_norm == 0.0:
            return 0.0
        return max(0.0, min(1.0, numerator / (left_norm * right_norm)))