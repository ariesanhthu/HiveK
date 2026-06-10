from __future__ import annotations

import re


class TextProcessor:
    _teencode_map = {
        "ko": "khong",
        "k": "khong",
        "dc": "duoc",
        "vs": "voi",
        "okela": "ok",
        "cmt": "comment",
        "ib": "nhan tin",
    }

    _noise_pattern = re.compile(r"https?://\S+|www\.\S+|[#@][\w_]+|[^\w\sà-ỹÀ-Ỹ]")
    _whitespace_pattern = re.compile(r"\s+")

    def clean(self, text: str) -> str:
        normalized = text.lower()
        for short, expanded in self._teencode_map.items():
            normalized = re.sub(rf"\b{re.escape(short)}\b", expanded, normalized)
        normalized = self._noise_pattern.sub(" ", normalized)
        normalized = self._whitespace_pattern.sub(" ", normalized)
        return normalized.strip()

    def tokenize(self, text: str) -> list[str]:
        cleaned = self.clean(text)
        if not cleaned:
            return []
        return cleaned.split(" ")