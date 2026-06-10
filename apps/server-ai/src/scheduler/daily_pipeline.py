from __future__ import annotations

import asyncio
import logging
from collections.abc import Awaitable, Callable

from src.configs.app import AppConfig
from src.models.dto import PipelineRunRequest


class DailyPipelineScheduler:
    def __init__(
        self,
        *,
        config: AppConfig,
        run_pipeline: Callable[[PipelineRunRequest], Awaitable[object]],
        logger: logging.Logger,
    ) -> None:
        self._config = config
        self._run_pipeline = run_pipeline
        self._logger = logger
        self._stop_event = asyncio.Event()
        self._task: asyncio.Task[None] | None = None
        self._next_cursor: str | None = None

    async def start(self) -> None:
        if not self._config.scheduler_enabled:
            self._logger.info("Daily pipeline scheduler is disabled")
            return

        if self._task is not None and not self._task.done():
            return

        self._stop_event.clear()
        self._task = asyncio.create_task(self._run_loop(), name="daily-pipeline-scheduler")
        self._logger.info(
            "Daily pipeline scheduler started: interval=%ss batch_limit=%s due_for_crawl=true",
            self._config.scheduler_interval_seconds,
            self._config.scheduler_top_kol_limit,
        )

    async def stop(self) -> None:
        self._stop_event.set()
        if self._task is None:
            return

        self._task.cancel()
        try:
            await self._task
        except asyncio.CancelledError:
            pass
        finally:
            self._task = None

    async def run_once(self) -> object:
        request = PipelineRunRequest(
            cursor=self._next_cursor,
            limit=self._config.scheduler_top_kol_limit,
            dueForCrawl=True,
            runMode="scheduled",
        )
        self._logger.info(
            "Daily pipeline scheduled run starting: cursor=%s limit=%s due_for_crawl=%s",
            request.cursor,
            request.limit,
            request.dueForCrawl,
        )
        result = await self._run_pipeline(request)
        next_cursor = getattr(result, "next_cursor", None)
        self._next_cursor = next_cursor
        self._logger.info(
            "Daily pipeline scheduled run finished: next_cursor=%s result=%s",
            self._next_cursor,
            result,
        )
        return result

    async def _run_loop(self) -> None:
        try:
            if self._config.scheduler_initial_delay_seconds > 0:
                await self._wait_for_stop(self._config.scheduler_initial_delay_seconds)

            while not self._stop_event.is_set():
                await self._execute_with_retry()
                if await self._wait_for_stop(self._config.scheduler_interval_seconds):
                    break
        except asyncio.CancelledError:
            raise
        except Exception:
            self._logger.exception("Daily pipeline scheduler loop failed")

    async def _execute_with_retry(self) -> None:
        attempts = max(1, self._config.scheduler_retry_attempts)
        for attempt in range(1, attempts + 1):
            try:
                result = await self.run_once()
                self._logger.info("Daily pipeline run completed: %s", result)
                return
            except Exception as exc:
                self._logger.exception(
                    "Daily pipeline run attempt %s/%s failed", attempt, attempts, exc_info=exc
                )
                if attempt >= attempts:
                    return
                await self._wait_for_stop(self._config.scheduler_retry_delay_seconds * attempt)

    async def _wait_for_stop(self, timeout_seconds: float) -> bool:
        if timeout_seconds <= 0:
            return self._stop_event.is_set()

        try:
            await asyncio.wait_for(self._stop_event.wait(), timeout=timeout_seconds)
            return True
        except TimeoutError:
            return False
