from __future__ import annotations

from fastapi import APIRouter, Request

from src.models.dto import (
    PipelineDebugRequest,
    PipelineDebugResponse,
    PipelineRunRequest,
    PipelineRunResponse,
    PipelineStatusResponse,
)


router = APIRouter()


@router.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/pipeline/run", response_model=PipelineRunResponse)
async def run_pipeline(request: Request, payload: PipelineRunRequest) -> PipelineRunResponse:
    orchestrator = request.app.state.orchestrator
    summary = await orchestrator.run(payload)
    return PipelineRunResponse(
        processed=summary.processed,
        updated=summary.updated,
        failed=summary.failed,
        nextCursor=summary.next_cursor,
        durationSeconds=summary.duration_seconds,
        runMode=payload.runMode,
        dueForCrawl=payload.dueForCrawl,
    )


@router.post("/pipeline/run/debug", response_model=PipelineDebugResponse)
async def run_pipeline_debug(request: Request, payload: PipelineDebugRequest) -> PipelineDebugResponse:
    orchestrator = request.app.state.orchestrator
    result = await orchestrator.run_debug(payload)
    summary = result["summary"]
    return PipelineDebugResponse(
        summary=PipelineRunResponse(
            processed=summary.processed,
            updated=summary.updated,
            failed=summary.failed,
            nextCursor=summary.next_cursor,
            durationSeconds=summary.duration_seconds,
            runMode=payload.runMode,
            dueForCrawl=payload.dueForCrawl,
        ),
        traces=result["traces"],
    )


@router.get("/pipeline/status", response_model=PipelineStatusResponse)
async def pipeline_status(request: Request) -> PipelineStatusResponse:
    orchestrator = request.app.state.orchestrator
    status = orchestrator.get_status()
    return PipelineStatusResponse(
        status=status.status,
        processed=status.processed,
        updated=status.updated,
        failed=status.failed,
        total=status.total,
        startedAt=status.started_at,
        finishedAt=status.finished_at,
        currentProfileId=status.current_profile_id,
        lastError=status.last_error,
        nextCursor=status.next_cursor,
        runMode=status.run_mode,
        dueForCrawl=status.due_for_crawl,
    )
