"""HTTP request/response schemas.

Field names are camelCase on the wire to match the existing Next.js client, while the
Python side stays snake_case. Pydantic aliases do the translation so neither side
compromises its conventions.
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from hivek_agent.domain import FeedbackEventType, PlatformId


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="ignore",
    )


class ChatRequest(CamelModel):
    workspace_id: str = Field(min_length=1)
    user_id: str = "anonymous"
    thread_id: str = Field(min_length=1)
    message: str = Field(min_length=1, max_length=4000)
    platform: PlatformId | None = None
    platforms: list[PlatformId] | None = None
    days: int | None = Field(default=None, ge=1, le=30)
    angle: str | None = None
    goal: str | None = None
    node_id: str | None = None
    plan_id: str | None = None
    user_instruction: str | None = Field(default=None, max_length=1000)
    force_refresh: bool = False

    def to_payload(self) -> dict[str, Any]:
        payload = {
            "platform": self.platform,
            "platforms": self.platforms,
            "days": self.days,
            "angle": self.angle,
            "goal": self.goal,
            "node_id": self.node_id,
            "plan_id": self.plan_id,
            "user_instruction": self.user_instruction,
            "force_refresh": self.force_refresh,
        }
        return {key: value for key, value in payload.items() if value is not None}


class SocialSetupRequest(CamelModel):
    workspace_id: str
    user_id: str = "anonymous"
    platforms: list[str] = Field(min_length=1)


class BrandSetupRequest(CamelModel):
    workspace_id: str
    user_id: str = "anonymous"
    name: str = Field(min_length=1, max_length=200)
    tone: str = Field(min_length=1, max_length=50)


class DriveSetupRequest(CamelModel):
    workspace_id: str
    user_id: str = "anonymous"
    url: str = Field(min_length=1, max_length=2000)


class DecisionRequest(CamelModel):
    workspace_id: str
    user_id: str = "anonymous"
    decision: FeedbackEventType
    edited_text: str | None = Field(default=None, max_length=8000)
    reason: str | None = Field(default=None, max_length=1000)


class FeedbackRequest(CamelModel):
    workspace_id: str
    asset_id: str | None = None
    event_type: FeedbackEventType
    before_text: str | None = None
    after_text: str | None = None
    reason: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class HealthResponse(CamelModel):
    status: Literal["ok", "degraded"]
    store_backend: str
    llm_provider: str
    store_reachable: bool
    skills_loaded: int
    warnings: list[str] = Field(default_factory=list)
