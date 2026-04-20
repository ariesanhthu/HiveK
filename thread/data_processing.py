import re
from dataclasses import asdict, dataclass
from typing import Dict, Iterable, List

from data_collecting import RawRecord


EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"
    "\U0001F300-\U0001F5FF"
    "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF"
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "]+",
    flags=re.UNICODE,
)

URL_PATTERN = re.compile(r"https?://\S+|www\.\S+", flags=re.IGNORECASE)
MENTION_PATTERN = re.compile(r"@\w+")
HASHTAG_PATTERN = re.compile(r"#\w+")
MULTI_SPACE_PATTERN = re.compile(r"\s+")
REPEAT_CHAR_PATTERN = re.compile(r"(.)\1{3,}")

SPAM_PATTERNS = [
    re.compile(r"\b(inbox|ib|dm|check inb)\b", flags=re.IGNORECASE),
    re.compile(r"\b(giam gia|sale|khuyen mai|order|shop)\b", flags=re.IGNORECASE),
    re.compile(r"\b(link bio|click link)\b", flags=re.IGNORECASE),
]

#chỗ này có thể cải thiện bằng cách sử dụng một tập prototype lớn hơn 
# hoặc được tinh chỉnh hơn dựa trên dữ liệu thực tế.
# Hiện tại chỉ là ví dụ đơn giản để minh họa ý tưởng. 
NORM_MAP: Dict[str, str] = {
    "ko": "khong",
    "k": "khong",
    "kh": "khong",
    "hok": "khong",
    "dc": "duoc",
    "đc": "duoc",
    "j": "gi",
    "mik": "minh",
    "mk": "minh",
    "mn": "moi nguoi",
    "ae": "anh em",
    "v": "va",
    "cx": "cung",
    "vs": "voi",
    "ny": "nguoi yeu",
    "r": "roi",
    "th": "thoi",
    "thui": "thoi",
    "vl": "rat",
    "bt": "binh thuong",
    "đm": "",
    "dm": "",
}


@dataclass
class ProcessedRecord:
    record_id: str
    platform: str
    original_text: str
    processed_text: str
    context: str
    created_at: str
    source: str
    metadata: Dict


class TextProcessor:
    def clean_text(self, text: str) -> str:
        text = text or ""
        text = text.strip().lower()
        text = EMOJI_PATTERN.sub(" ", text)
        text = URL_PATTERN.sub(" ", text)
        text = MENTION_PATTERN.sub(" ", text)
        text = HASHTAG_PATTERN.sub(" ", text)
        text = REPEAT_CHAR_PATTERN.sub(r"\1\1", text)
        text = re.sub(r"[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]", " ", text)
        text = MULTI_SPACE_PATTERN.sub(" ", text).strip()
        return text

    def normalize_slang(self, text: str) -> str:
        tokens = text.split()
        normalized: List[str] = []
        for token in tokens:
            normalized.append(NORM_MAP.get(token, token))
        return " ".join([tok for tok in normalized if tok]).strip()

    def is_spam(self, text: str) -> bool:
        if not text:
            return True
        if len(text.split()) < 3:
            return True
        for pattern in SPAM_PATTERNS:
            if pattern.search(text):
                return True
        return False

    def process(self, rows: Iterable[RawRecord]) -> List[ProcessedRecord]:
        processed_rows: List[ProcessedRecord] = []
        for row in rows:
            cleaned = self.clean_text(row.text)
            normalized = self.normalize_slang(cleaned)
            if self.is_spam(normalized):
                continue

            processed_rows.append(
                ProcessedRecord(
                    record_id=row.record_id,
                    platform=row.platform,
                    original_text=row.text,
                    processed_text=normalized,
                    context=row.context,
                    created_at=row.created_at or "",
                    source=row.source or "",
                    metadata=row.metadata,
                )
            )
        return processed_rows


def to_dict_list(rows: Iterable[ProcessedRecord]) -> List[Dict]:
    return [asdict(row) for row in rows]
