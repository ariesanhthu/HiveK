from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PlatformProfileDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: str = Field(alias="_id")
    tiktok: str | None = None
    youtube: str | None = None
    lastCrawledAt: str | None = None
    nextCrawlAt: str | None = None
    lastScoreUpdatedAt: str | None = None
    crawlStatus: str | None = None
    crawlFailCount: int | None = 0
    crawlPriority: int | None = 0
    lastCrawlError: str | None = None
    followerCount: int | None = None
    recentlyActive: bool | None = None
    lastPublishedAt: str | None = None
    lastVideoId: str | None = None
    lastCommentCursor: str | None = None
    lastCrawlSnapshot: dict[str, Any] | None = Field(default_factory=dict)


class PlatformProfilesPageResponse(BaseModel):
    data: list[PlatformProfileDTO]
    cursor: str | None = None


class ScorePayload(BaseModel):
    sentimentScore: float
    engagementQuality: float
    topicAuthority: float
    controversyRisk: float
    kolScore: float


class PatchKolProfileRequest(BaseModel):
    scores: ScorePayload


class PipelineRunRequest(BaseModel):
    cursor: str | None = None
    limit: int | None = Field(default=None, ge=1)
    dueForCrawl: bool = False
    runMode: str = "manual"


class PipelineRunResponse(BaseModel):
    processed: int
    updated: int
    failed: int
    nextCursor: str | None = None
    durationSeconds: float
    runMode: str = "manual"
    dueForCrawl: bool = False


class PipelineDebugRequest(PipelineRunRequest):
    includeTrace: bool = True


class CrawlerTrace(BaseModel):
    platform: str
    rawData: dict[str, Any]


class ProfileDebugTrace(BaseModel):
    profile: PlatformProfileDTO
    crawlers: list[CrawlerTrace]
    normalizedInput: dict[str, Any]
    features: dict[str, Any]
    scorePayload: ScorePayload
    backendResponse: dict[str, Any]


class PipelineDebugResponse(BaseModel):
    summary: PipelineRunResponse
    traces: list[ProfileDebugTrace]


class PipelineStatusResponse(BaseModel):
    status: str
    processed: int
    updated: int
    failed: int
    total: int
    startedAt: str | None = None
    finishedAt: str | None = None
    currentProfileId: str | None = None
    lastError: str | None = None
    nextCursor: str | None = None
    runMode: str
    dueForCrawl: bool


class ProblemDetails(BaseModel):
    type: str
    title: str
    status: int
    detail: str
    instance: str
