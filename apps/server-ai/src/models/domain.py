from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class PlatformProfile:
    id: str
    tiktok: str | None = None
    youtube: str | None = None
    last_crawled_at: str | None = None
    next_crawl_at: str | None = None
    last_score_updated_at: str | None = None
    crawl_status: str | None = None
    crawl_fail_count: int = 0
    crawl_priority: int = 0
    last_crawl_error: str | None = None
    follower_count: int | None = None
    recently_active: bool | None = None
    last_published_at: str | None = None
    last_video_id: str | None = None
    last_comment_cursor: str | None = None
    last_crawl_snapshot: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class RawSocialData:
    platform: str
    comments: list[str] = field(default_factory=list)
    captions: list[str] = field(default_factory=list)
    posts: list[str] = field(default_factory=list)
    engagement_metrics: dict[str, float] = field(default_factory=dict)
    topics: list[str] = field(default_factory=list)
    replies: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class NormalizedSocialData:
    platforms: list[str]
    texts: list[str]
    engagement_metrics: dict[str, float]
    topic_counts: dict[str, int]
    comment_count: int
    caption_count: int
    post_count: int
    reply_count: int
    average_comment_length: float
    average_reply_length: float
    average_text_length: float
    dominant_topic: str | None


@dataclass(frozen=True)
class FeatureBundle:
    sentiment_score: float
    engagement_quality: float
    topic_authority: float
    controversy_risk: float
    dominant_topic: str | None
    diagnostics: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ScoreComponents:
    sentiment_score: float
    engagement_quality: float
    topic_authority: float
    controversy_risk: float
    kol_score: float


@dataclass(frozen=True)
class PipelineRunSummary:
    processed: int
    updated: int
    failed: int
    next_cursor: str | None
    duration_seconds: float


@dataclass(frozen=True)
class PipelineRunStatus:
    status: str
    processed: int
    updated: int
    failed: int
    total: int
    started_at: str | None
    finished_at: str | None
    current_profile_id: str | None
    last_error: str | None
    next_cursor: str | None
    run_mode: str
    due_for_crawl: bool
