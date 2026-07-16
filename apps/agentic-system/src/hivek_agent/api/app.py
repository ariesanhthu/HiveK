"""FastAPI application.

Routes are intentionally thin: validate input, call the service, return a typed model.
No prompts, no model calls, no business rules live here.
"""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sse_starlette.sse import EventSourceResponse

from hivek_agent.agentic.graph import build_chat_graph, build_checkpointer
from hivek_agent.agentic.nodes import NodeDeps
from hivek_agent.api.schemas import (
    BrandSetupRequest,
    ChatRequest,
    DecisionRequest,
    DriveSetupRequest,
    FeedbackRequest,
    HealthResponse,
    SocialSetupRequest,
)
from hivek_agent.config import get_settings
from hivek_agent.domain import HarnessResponse
from hivek_agent.infrastructure.llm import build_llm
from hivek_agent.infrastructure.store import build_store
from hivek_agent.repositories import Repositories
from hivek_agent.service import AgenticService

logger = logging.getLogger(__name__)

SSE_KEEPALIVE_SECONDS = 15
SSE_TIMEOUT_SECONDS = 300


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logging.basicConfig(
        level=settings.log_level.upper(),
        format="%(asctime)s %(levelname)-7s %(name)s | %(message)s",
    )

    store = await build_store(settings)
    llm = build_llm(settings)
    repos = Repositories(store)
    deps = NodeDeps(
        repos,
        llm,
        token_budget=settings.default_token_budget,
        fast_model=settings.gemini_model_fast,
        judge_model=settings.gemini_model_validator,
    )
    checkpointer = await build_checkpointer(settings)
    graph = build_chat_graph(deps, checkpointer=checkpointer)

    app.state.settings = settings
    app.state.store = store
    app.state.service = AgenticService(deps, graph, repos)

    logger.info(
        "HIVE-K agentic system ready | store=%s llm=%s skills=%d",
        store.backend_name,
        llm.provider_name,
        len(deps.skills.list_skills()),
    )
    try:
        yield
    finally:
        await store.close()


def get_service(request: Request) -> AgenticService:
    return request.app.state.service


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="HIVE-K Agentic System",
        version="0.1.0",
        description="Stateful content operations harness for multi-account social workspaces.",
        lifespan=lifespan,
    )

    # The Next.js client calls this service from the browser, so CORS is required.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
        allow_headers=["*"],
    )

    @app.exception_handler(ValidationError)
    async def validation_error_handler(_: Request, exc: ValidationError) -> JSONResponse:
        # A domain model rejecting a write is a contract bug, not a transient fault.
        # Surface it loudly: an opaque 500 here once looked like "the field just did
        # not save", which is far harder to diagnose than a 422 naming the field.
        logger.error("domain validation failed: %s", exc.errors())
        return JSONResponse(
            status_code=422,
            content={
                "detail": "payload rejected by domain contract",
                "errors": [
                    {"field": ".".join(str(part) for part in err["loc"]), "message": err["msg"]}
                    for err in exc.errors()
                ][:10],
            },
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(_: Request, exc: ValueError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(LookupError)
    async def lookup_error_handler(_: Request, exc: LookupError) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    # --- health ---------------------------------------------------------
    @app.get("/health", response_model=HealthResponse, tags=["ops"])
    async def health(request: Request) -> HealthResponse:
        store = request.app.state.store
        service: AgenticService = request.app.state.service
        warnings: list[str] = []

        try:
            reachable = await store.ping()
        except Exception as exc:
            reachable = False
            warnings.append(f"store unreachable: {type(exc).__name__}")

        if store.backend_name == "memory":
            warnings.append("Using in-memory store - data will not persist across restarts.")
        if service.deps.llm.provider_name == "mock":
            warnings.append("Using mock LLM - set GEMINI_API_KEY for real generation.")

        return HealthResponse(
            status="ok" if reachable else "degraded",
            store_backend=store.backend_name,
            llm_provider=service.deps.llm.provider_name,
            store_reachable=reachable,
            skills_loaded=len(service.deps.skills.list_skills()),
            warnings=warnings,
        )

    # --- chat -----------------------------------------------------------
    @app.post("/v1/chat/messages", response_model=HarnessResponse, tags=["chat"])
    async def send_message(
        body: ChatRequest,
        request: Request,
        service: AgenticService = Depends(get_service),
    ) -> HarnessResponse:
        return await service.send_message(
            workspace_id=body.workspace_id,
            user_id=body.user_id,
            thread_id=body.thread_id,
            message=body.message,
            payload=body.to_payload(),
            idempotency_key=request.headers.get("Idempotency-Key"),
        )

    @app.get("/v1/runs/{run_id}/events", tags=["chat"])
    async def stream_run_events(
        run_id: str,
        workspace_id: str,
        request: Request,
        service: AgenticService = Depends(get_service),
    ) -> EventSourceResponse:
        """SSE stream for one run.

        Replays persisted events first so a client that connects after the run started
        still sees the whole story, then follows live ones.
        """
        queue = service.events.subscribe(run_id)

        async def publisher():
            try:
                for event in await service.repos.runs.list_events(workspace_id, run_id):
                    yield {"event": event.event, "data": event.model_dump_json()}

                while True:
                    if await request.is_disconnected():
                        break
                    try:
                        event = await asyncio.wait_for(queue.get(), timeout=SSE_KEEPALIVE_SECONDS)
                    except TimeoutError:
                        yield {"event": "ping", "data": "{}"}
                        continue
                    if event is None:
                        break
                    yield {"event": event.event, "data": event.model_dump_json()}
            finally:
                service.events.unsubscribe(run_id, queue)

        return EventSourceResponse(publisher())

    @app.get("/v1/runs/{run_id}", tags=["chat"])
    async def get_run(
        run_id: str, workspace_id: str, service: AgenticService = Depends(get_service)
    ) -> dict[str, Any]:
        run = await service.repos.runs.get_run(workspace_id, run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="run not found")
        nodes = await service.repos.runs.list_node_runs(workspace_id, run_id)
        return {
            "run": run.model_dump(by_alias=True),
            "nodes": [item.model_dump(by_alias=True) for item in nodes],
            "total_latency_ms": sum(item.latency_ms for item in nodes),
            "total_tokens": sum(item.input_tokens + item.output_tokens for item in nodes),
        }

    # --- setup (mirrors the client's three chat widgets) ------------------
    @app.post("/v1/setup/social", tags=["setup"])
    async def setup_social(
        body: SocialSetupRequest, service: AgenticService = Depends(get_service)
    ) -> dict[str, Any]:
        return await service.record_setup_step(
            workspace_id=body.workspace_id,
            step="social",
            value=body.platforms,
            user_id=body.user_id,
        )

    @app.post("/v1/setup/brand", tags=["setup"])
    async def setup_brand(
        body: BrandSetupRequest, service: AgenticService = Depends(get_service)
    ) -> dict[str, Any]:
        await service.record_setup_step(
            workspace_id=body.workspace_id,
            step="brand",
            value=body.name,
            user_id=body.user_id,
        )
        return await service.record_setup_step(
            workspace_id=body.workspace_id,
            step="tone",
            value=body.tone,
            user_id=body.user_id,
        )

    @app.post("/v1/setup/drive", tags=["setup"])
    async def setup_drive(
        body: DriveSetupRequest, service: AgenticService = Depends(get_service)
    ) -> dict[str, Any]:
        return await service.record_setup_step(
            workspace_id=body.workspace_id,
            step="drive",
            value=body.url,
            user_id=body.user_id,
        )

    # --- knowledge -------------------------------------------------------
    @app.get("/v1/workspaces/{workspace_id}/brand-profile", tags=["knowledge"])
    async def brand_profile(
        workspace_id: str, service: AgenticService = Depends(get_service)
    ) -> dict[str, Any]:
        profile = await service.deps.brand.build_profile(workspace_id)
        return profile.model_dump(by_alias=True)

    @app.get("/v1/workspaces/{workspace_id}/missing-items", tags=["knowledge"])
    async def missing_items(
        workspace_id: str, service: AgenticService = Depends(get_service)
    ) -> dict[str, Any]:
        gaps = await service.deps.brand.detect_gaps(workspace_id)
        return {"items": [gap.model_dump(by_alias=True) for gap in gaps]}

    @app.post("/v1/workspaces/{workspace_id}/facts/{assertion_id}/confirm", tags=["knowledge"])
    async def confirm_fact(
        workspace_id: str, assertion_id: str, service: AgenticService = Depends(get_service)
    ) -> dict[str, Any]:
        assertion = await service.deps.facts.confirm_fact(workspace_id, assertion_id)
        if assertion is None:
            raise HTTPException(status_code=404, detail="assertion not found")
        return assertion.model_dump(by_alias=True)

    @app.get("/v1/workspaces/{workspace_id}/conflicts", tags=["knowledge"])
    async def conflicts(
        workspace_id: str, service: AgenticService = Depends(get_service)
    ) -> dict[str, Any]:
        items = await service.repos.knowledge.list_conflicts(workspace_id)
        return {"items": [item.model_dump(by_alias=True) for item in items]}

    # --- the feedback loop ------------------------------------------------
    @app.post("/v1/content-assets/{asset_id}/decision", tags=["feedback"])
    async def decide(
        asset_id: str, body: DecisionRequest, service: AgenticService = Depends(get_service)
    ) -> dict[str, Any]:
        return await service.decide(
            workspace_id=body.workspace_id,
            asset_id=asset_id,
            decision=body.decision,
            edited_text=body.edited_text,
            reason=body.reason,
            user_id=body.user_id,
        )

    @app.post("/v1/feedback", tags=["feedback"])
    async def feedback(
        body: FeedbackRequest, service: AgenticService = Depends(get_service)
    ) -> dict[str, Any]:
        event = await service.learning.record_feedback(
            workspace_id=body.workspace_id,
            asset_id=body.asset_id,
            event_type=body.event_type,
            before_text=body.before_text,
            after_text=body.after_text,
            reason=body.reason,
        )
        return {"success": True, "feedbackId": event.feedback_id}

    @app.get("/v1/workspaces/{workspace_id}/voice-profile", tags=["feedback"])
    async def voice_profile(
        workspace_id: str, service: AgenticService = Depends(get_service)
    ) -> dict[str, Any]:
        profile = await service.repos.knowledge.get_voice_profile(workspace_id)
        preferences = await service.repos.learning.list_preferences(workspace_id)
        return {
            "profile": profile.model_dump(by_alias=True) if profile else None,
            "preferences": [item.model_dump(by_alias=True) for item in preferences],
        }

    @app.get("/v1/workspaces/{workspace_id}/assets", tags=["content"])
    async def assets(
        workspace_id: str,
        status: str | None = None,
        limit: int = 20,
        service: AgenticService = Depends(get_service),
    ) -> dict[str, Any]:
        items = await service.repos.content.list_assets(
            workspace_id, status=status, limit=min(limit, 100)
        )
        return {"items": [item.model_dump(by_alias=True) for item in items]}

    return app


app = create_app()
