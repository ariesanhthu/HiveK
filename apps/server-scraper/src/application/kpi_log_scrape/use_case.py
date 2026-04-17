from core.entities.kpi_log import KpiLog
from core.interfaces.repository import IKpiRepository
from infrastructure.scraper.factory import ScraperFactory
from application.kpi_log_scrape.dtos import ScrapeKpiRequest, ScrapeKpiResponse
from infrastructure.di.decorators import Injectable

@Injectable()
class ScrapeKpiUseCase:
    def __init__(self, scraper_factory: ScraperFactory, repository: IKpiRepository):
        self._scraper_factory = scraper_factory
        self._repository = repository

    async def execute(self, request: ScrapeKpiRequest) -> ScrapeKpiResponse:
        """
        Orchestrates the KPI scraping process:
        1. Resolves the correct scraper for the platform.
        2. Retrieves the last tracking time from the repository.
        3. Scrapes the metrics.
        4. Saves the results.
        """
        # 1. Resolve Scraper
        scraper = self._scraper_factory.create_scraper(request.url)

        # 2. Get previous state (optional, for incrementing or checking delta)
        latest_log = await self._repository.get_latest_by_participant(request.participant_id)
        last_time = latest_log.timestamp if latest_log else None

        # 3. Perform Scraping
        metrics = await scraper.tracking_kpi(request.url, last_time_tracking=last_time)

        # 4. Create Entity and Persist
        log = KpiLog(
            participant_id=request.participant_id,
            metrics=metrics
        )
        await self._repository.save(log)

        # 5. Return Response DTO
        return ScrapeKpiResponse(
            participant_id=log.participant_id,
            scraped_at=log.timestamp,
            metrics=metrics
        )
