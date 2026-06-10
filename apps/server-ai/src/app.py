from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from src.api.routes import router as pipeline_router
from src.configs.app import load_app_config
from src.configs.scoring import load_scoring_config
from src.crawlers.factory import build_crawlers
from src.feature_extractors.embeddings import MockEmbeddingProvider
from src.feature_extractors.social import SocialFeatureExtractor
from src.pipeline.orchestrator import KOLPipelineOrchestrator
from src.processors.normalization import SocialNormalizer
from src.scheduler.daily_pipeline import DailyPipelineScheduler
from src.scoring.engine import KOLScoringEngine
from src.services.api_client import HiveKApiClient
from src.services.kol_profile_service import KolProfileService
from src.utils.errors import ConfigurationError, PipelineError, UpstreamApiError
from src.utils.logging import configure_logging, get_logger


def _problem_details(status: int, title: str, detail: str, instance: str) -> dict[str, object]:
    return {
        "type": "about:blank",
        "title": title,
        "status": status,
        "detail": detail,
        "instance": instance,
    }


def create_app() -> FastAPI:
    configure_logging()
    logger = get_logger(__name__)
    app_config = load_app_config()
    scoring_config = load_scoring_config()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        api_client = HiveKApiClient(app_config)
        await api_client.start()
        crawlers = build_crawlers(app_config)

        for crawler in crawlers.values():
            await crawler.start()

        profile_service = KolProfileService(api_client=api_client, page_size=app_config.platform_page_size)
        orchestrator = KOLPipelineOrchestrator(
            profile_service=profile_service,
            crawlers=crawlers,
            normalizer=SocialNormalizer(),
            feature_extractor=SocialFeatureExtractor(embedding_provider=MockEmbeddingProvider()),
            scoring_engine=KOLScoringEngine(scoring_config),
            config=app_config,
            logger=logger,
        )
        scheduler = DailyPipelineScheduler(
            config=app_config,
            run_pipeline=orchestrator.run,
            logger=logger,
        )

        app.state.config = app_config
        app.state.scoring_config = scoring_config
        app.state.api_client = api_client
        app.state.profile_service = profile_service
        app.state.orchestrator = orchestrator
        app.state.scheduler = scheduler

        await scheduler.start()

        try:
            yield
        finally:
            for crawler in crawlers.values():
                await crawler.close()
            await scheduler.stop()
            await api_client.close()

    app = FastAPI(
        title="HiveK AI Pipeline",
        version="1.0.0",
        lifespan=lifespan,
    )

    async def configuration_error_handler(request: Request, exc: ConfigurationError) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content=_problem_details(500, "Configuration error", str(exc), str(request.url.path)),
        )

    async def upstream_error_handler(request: Request, exc: UpstreamApiError) -> JSONResponse:
        status_code = exc.status_code if exc.status_code >= 400 else 502
        return JSONResponse(
            status_code=status_code,
            content=_problem_details(status_code, "Upstream API error", str(exc), str(request.url.path)),
        )

    async def pipeline_error_handler(request: Request, exc: PipelineError) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content=_problem_details(500, "Pipeline error", str(exc), str(request.url.path)),
        )

    app.add_exception_handler(ConfigurationError, configuration_error_handler)
    app.add_exception_handler(UpstreamApiError, upstream_error_handler)
    app.add_exception_handler(PipelineError, pipeline_error_handler)

    app.include_router(pipeline_router)
    return app