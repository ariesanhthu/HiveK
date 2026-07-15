"""Typed repositories over the document store.

Workspace isolation is enforced here rather than left to each caller: every method
takes `workspace_id` as a required argument and injects it into the query. A node
cannot construct a query that reads another workspace's data, because it never builds
the query itself.
"""

from __future__ import annotations

import uuid
from typing import Any, TypeVar

from pydantic import BaseModel

from hivek_agent.domain import (
    AgentRun,
    BrandOperatingProfile,
    BrandVoiceProfile,
    ContentAsset,
    ContentPlan,
    EditLearningEvent,
    FeedbackEvent,
    GraphEdge,
    KnowledgeAssertion,
    KnowledgeConflict,
    KnowledgeEntity,
    NodeRun,
    PreferenceCandidate,
    RunEvent,
    utc_now_iso,
)
from hivek_agent.infrastructure.store import (
    ASSERTIONS,
    ASSETS,
    AUDIT,
    BRAND_PROFILES,
    CONFLICTS,
    EDGES,
    EDIT_EVENTS,
    ENTITIES,
    EVENTS,
    FEEDBACK,
    NODE_RUNS,
    PLANS,
    PREFERENCES,
    RUNS,
    THREADS,
    VOICE_PROFILES,
    DocumentStore,
    DuplicateKeyError,
)

ModelT = TypeVar("ModelT", bound=BaseModel)


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:16]}"


def _load[T: BaseModel](schema: type[T], document: dict[str, Any] | None) -> T | None:
    return schema.model_validate(document) if document else None


class RunRepository:
    """Agent runs, per-node telemetry, and the SSE event log."""

    def __init__(self, store: DocumentStore) -> None:
        self._store = store

    async def create_run(self, run: AgentRun) -> AgentRun:
        await self._store.insert(RUNS, run.model_dump())
        return run

    async def get_run(self, workspace_id: str, run_id: str) -> AgentRun | None:
        return _load(
            AgentRun,
            await self._store.find_one(RUNS, {"run_id": run_id, "workspace_id": workspace_id}),
        )

    async def find_by_idempotency_key(self, workspace_id: str, key: str) -> AgentRun | None:
        """Lets a retried request return the original run instead of starting a new one."""
        return _load(
            AgentRun,
            await self._store.find_one(
                RUNS, {"workspace_id": workspace_id, "idempotency_key": key}
            ),
        )

    async def update_run(self, run: AgentRun) -> None:
        run.updated_at = utc_now_iso()
        await self._store.update_one(
            RUNS, {"run_id": run.run_id, "workspace_id": run.workspace_id}, run.model_dump()
        )

    async def record_node_run(self, node_run: NodeRun) -> None:
        await self._store.insert(NODE_RUNS, node_run.model_dump())

    async def list_node_runs(self, workspace_id: str, run_id: str) -> list[NodeRun]:
        rows = await self._store.find(
            NODE_RUNS, {"run_id": run_id, "workspace_id": workspace_id}, sort=[("at", 1)]
        )
        return [NodeRun.model_validate(row) for row in rows]

    async def append_event(self, workspace_id: str, event: RunEvent) -> None:
        # (run_id, seq) is unique; a duplicate means a retry already logged this frame.
        try:
            await self._store.insert(EVENTS, {**event.model_dump(), "workspace_id": workspace_id})
        except DuplicateKeyError:
            return

    async def list_events(
        self, workspace_id: str, run_id: str, after_seq: int = 0
    ) -> list[RunEvent]:
        rows = await self._store.find(
            EVENTS,
            {"run_id": run_id, "workspace_id": workspace_id, "seq": {"$gte": after_seq}},
            sort=[("seq", 1)],
        )
        return [
            RunEvent.model_validate({k: v for k, v in row.items() if k != "workspace_id"})
            for row in rows
        ]

    async def save_thread(
        self, workspace_id: str, thread_id: str, messages: list[dict[str, Any]]
    ) -> None:
        await self._store.update_one(
            THREADS,
            {"thread_id": thread_id, "workspace_id": workspace_id},
            {
                "thread_id": thread_id,
                "workspace_id": workspace_id,
                "messages": messages,
                "updated_at": utc_now_iso(),
            },
            upsert=True,
        )

    async def get_thread(self, workspace_id: str, thread_id: str) -> list[dict[str, Any]]:
        document = await self._store.find_one(
            THREADS, {"thread_id": thread_id, "workspace_id": workspace_id}
        )
        return document.get("messages", []) if document else []

    async def audit(self, workspace_id: str, action: str, detail: dict[str, Any]) -> str:
        event_id = new_id("audit")
        await self._store.insert(
            AUDIT,
            {
                "audit_id": event_id,
                "workspace_id": workspace_id,
                "action": action,
                "detail": detail,
                "at": utc_now_iso(),
            },
        )
        return event_id


class KnowledgeRepository:
    """Facts, entities, edges and conflicts - all provenance-carrying."""

    def __init__(self, store: DocumentStore) -> None:
        self._store = store

    async def add_assertion(self, assertion: KnowledgeAssertion) -> KnowledgeAssertion:
        await self._store.insert(ASSERTIONS, assertion.model_dump())
        return assertion

    async def get_assertion(
        self, workspace_id: str, assertion_id: str
    ) -> KnowledgeAssertion | None:
        return _load(
            KnowledgeAssertion,
            await self._store.find_one(
                ASSERTIONS, {"assertion_id": assertion_id, "workspace_id": workspace_id}
            ),
        )

    async def update_assertion(self, assertion: KnowledgeAssertion) -> None:
        await self._store.update_one(
            ASSERTIONS,
            {"assertion_id": assertion.assertion_id, "workspace_id": assertion.workspace_id},
            assertion.model_dump(),
        )

    async def find_live_by_key(
        self, workspace_id: str, subject_id: str, predicate: str
    ) -> list[KnowledgeAssertion]:
        """Assertions still in play for a claim - excludes superseded and rejected."""
        rows = await self._store.find(
            ASSERTIONS,
            {
                "workspace_id": workspace_id,
                "subject_id": subject_id,
                "predicate": predicate,
                "approval_status": {"$nin": ["superseded", "rejected"]},
            },
        )
        return [KnowledgeAssertion.model_validate(row) for row in rows]

    async def list_assertions(
        self, workspace_id: str, *, subject_id: str | None = None, limit: int = 0
    ) -> list[KnowledgeAssertion]:
        query: dict[str, Any] = {"workspace_id": workspace_id}
        if subject_id:
            query["subject_id"] = subject_id
        rows = await self._store.find(ASSERTIONS, query, sort=[("created_at", 1)], limit=limit)
        return [KnowledgeAssertion.model_validate(row) for row in rows]

    async def add_conflict(self, conflict: KnowledgeConflict) -> None:
        await self._store.insert(CONFLICTS, conflict.model_dump())

    async def list_conflicts(
        self, workspace_id: str, *, unresolved_only: bool = True
    ) -> list[KnowledgeConflict]:
        query: dict[str, Any] = {"workspace_id": workspace_id}
        if unresolved_only:
            query["resolved"] = False
        rows = await self._store.find(CONFLICTS, query)
        return [KnowledgeConflict.model_validate(row) for row in rows]

    async def resolve_conflict(self, conflict: KnowledgeConflict) -> None:
        await self._store.update_one(
            CONFLICTS,
            {"conflict_id": conflict.conflict_id, "workspace_id": conflict.workspace_id},
            conflict.model_dump(),
        )

    async def upsert_entity(self, entity: KnowledgeEntity) -> None:
        await self._store.update_one(
            ENTITIES,
            {"entity_id": entity.entity_id, "workspace_id": entity.workspace_id},
            entity.model_dump(),
            upsert=True,
        )

    async def add_edge(self, edge: GraphEdge) -> None:
        try:
            await self._store.insert(EDGES, edge.model_dump())
        except DuplicateKeyError:
            return

    async def neighbors(self, workspace_id: str, from_id: str) -> list[GraphEdge]:
        rows = await self._store.find(EDGES, {"workspace_id": workspace_id, "from_id": from_id})
        return [GraphEdge.model_validate(row) for row in rows]

    async def save_brand_profile(self, profile: BrandOperatingProfile) -> None:
        profile.updated_at = utc_now_iso()
        await self._store.update_one(
            BRAND_PROFILES,
            {"workspace_id": profile.workspace_id},
            profile.model_dump(),
            upsert=True,
        )

    async def get_brand_profile(self, workspace_id: str) -> BrandOperatingProfile | None:
        return _load(
            BrandOperatingProfile,
            await self._store.find_one(BRAND_PROFILES, {"workspace_id": workspace_id}),
        )

    async def save_voice_profile(self, profile: BrandVoiceProfile) -> None:
        profile.updated_at = utc_now_iso()
        await self._store.update_one(
            VOICE_PROFILES,
            {"workspace_id": profile.workspace_id},
            profile.model_dump(),
            upsert=True,
        )

    async def get_voice_profile(self, workspace_id: str) -> BrandVoiceProfile | None:
        return _load(
            BrandVoiceProfile,
            await self._store.find_one(VOICE_PROFILES, {"workspace_id": workspace_id}),
        )


class ContentRepository:
    def __init__(self, store: DocumentStore) -> None:
        self._store = store

    async def save_plan(self, plan: ContentPlan) -> None:
        await self._store.update_one(
            PLANS,
            {"plan_id": plan.plan_id, "workspace_id": plan.workspace_id},
            plan.model_dump(),
            upsert=True,
        )

    async def get_plan(self, workspace_id: str, plan_id: str) -> ContentPlan | None:
        return _load(
            ContentPlan,
            await self._store.find_one(PLANS, {"plan_id": plan_id, "workspace_id": workspace_id}),
        )

    async def latest_plan(self, workspace_id: str) -> ContentPlan | None:
        rows = await self._store.find(
            PLANS, {"workspace_id": workspace_id}, sort=[("created_at", -1)], limit=1
        )
        return ContentPlan.model_validate(rows[0]) if rows else None

    async def save_asset(self, asset: ContentAsset) -> None:
        asset.updated_at = utc_now_iso()
        await self._store.update_one(
            ASSETS,
            {"asset_id": asset.asset_id, "workspace_id": asset.workspace_id},
            asset.model_dump(),
            upsert=True,
        )

    async def get_asset(self, workspace_id: str, asset_id: str) -> ContentAsset | None:
        return _load(
            ContentAsset,
            await self._store.find_one(
                ASSETS, {"asset_id": asset_id, "workspace_id": workspace_id}
            ),
        )

    async def list_assets(
        self, workspace_id: str, *, status: str | None = None, limit: int = 20
    ) -> list[ContentAsset]:
        query: dict[str, Any] = {"workspace_id": workspace_id}
        if status:
            query["status"] = status
        rows = await self._store.find(ASSETS, query, sort=[("created_at", -1)], limit=limit)
        return [ContentAsset.model_validate(row) for row in rows]

    async def find_by_run(self, workspace_id: str, run_id: str) -> ContentAsset | None:
        return _load(
            ContentAsset,
            await self._store.find_one(ASSETS, {"workspace_id": workspace_id, "run_id": run_id}),
        )

    async def find_by_context_hash(
        self, workspace_id: str, context_hash: str
    ) -> ContentAsset | None:
        """Idempotency: same context + prompt version must not create a second asset."""
        return _load(
            ContentAsset,
            await self._store.find_one(
                ASSETS, {"workspace_id": workspace_id, "context_hash": context_hash}
            ),
        )


class LearningRepository:
    def __init__(self, store: DocumentStore) -> None:
        self._store = store

    async def add_feedback(self, event: FeedbackEvent) -> None:
        await self._store.insert(FEEDBACK, event.model_dump())

    async def list_feedback(self, workspace_id: str, *, limit: int = 50) -> list[FeedbackEvent]:
        rows = await self._store.find(
            FEEDBACK, {"workspace_id": workspace_id}, sort=[("created_at", -1)], limit=limit
        )
        return [FeedbackEvent.model_validate(row) for row in rows]

    async def add_edit_event(self, event: EditLearningEvent) -> None:
        await self._store.insert(EDIT_EVENTS, event.model_dump())

    async def get_preference(self, workspace_id: str, key: str) -> PreferenceCandidate | None:
        document = await self._store.find_one(
            PREFERENCES, {"workspace_id": workspace_id, "key": key}
        )
        if not document:
            return None
        return PreferenceCandidate.model_validate({k: v for k, v in document.items() if k != "key"})

    async def upsert_preference(self, preference: PreferenceCandidate) -> None:
        preference.updated_at = utc_now_iso()
        # `key` is stored denormalised because it backs the unique index.
        await self._store.update_one(
            PREFERENCES,
            {"workspace_id": preference.workspace_id, "key": preference.key},
            {**preference.model_dump(), "key": preference.key},
            upsert=True,
        )

    async def list_preferences(
        self, workspace_id: str, *, active_only: bool = False
    ) -> list[PreferenceCandidate]:
        query: dict[str, Any] = {"workspace_id": workspace_id}
        if active_only:
            query["status"] = {"$in": ["repeated", "stable"]}
        rows = await self._store.find(PREFERENCES, query, sort=[("observation_count", -1)])
        return [
            PreferenceCandidate.model_validate({k: v for k, v in row.items() if k != "key"})
            for row in rows
        ]


class Repositories:
    """Bundle handed to nodes so they receive one dependency instead of four."""

    def __init__(self, store: DocumentStore) -> None:
        self.store = store
        self.runs = RunRepository(store)
        self.knowledge = KnowledgeRepository(store)
        self.content = ContentRepository(store)
        self.learning = LearningRepository(store)
