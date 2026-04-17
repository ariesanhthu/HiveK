from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass(frozen=True)
class KpiMetrics:
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0


@dataclass(frozen=True)
class KpiLog:
    participant_id: str
    metrics: KpiMetrics
    timestamp: datetime = field(default_factory=datetime.utcnow)
