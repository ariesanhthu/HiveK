import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, Iterator, List, Optional


@dataclass
class RawRecord:
    record_id: str
    platform: str
    text: str
    context: str
    created_at: Optional[str]
    source: Optional[str]
    metadata: Dict


class JSONLCollector:
    """Collect raw records from a JSONL social dataset."""

    def __init__(self, input_path: str) -> None:
        self.input_path = Path(input_path)

    def collect(self) -> List[RawRecord]:
        if not self.input_path.exists():
            raise FileNotFoundError(f"Input dataset not found: {self.input_path}")

        records: List[RawRecord] = []
        with self.input_path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                payload = json.loads(line)
                record = RawRecord(
                    record_id=payload.get("id", ""),
                    platform=payload.get("platform", "unknown"),
                    text=payload.get("text", ""),
                    context=payload.get("context", ""),
                    created_at=payload.get("created_at"),
                    source=(payload.get("metadata") or {}).get("source"),
                    metadata=payload.get("metadata") or {},
                )
                records.append(record)
        return records


def save_jsonl(rows: Iterable[Dict], output_path: str) -> None:
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    with output.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def iter_jsonl(input_path: str) -> Iterator[Dict]:
    with Path(input_path).open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)
