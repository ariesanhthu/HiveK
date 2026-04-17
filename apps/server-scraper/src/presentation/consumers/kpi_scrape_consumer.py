import json
from aio_pika import IncomingMessage
from application.kpi_log_scrape.dtos import ScrapeKpiRequest
from application.kpi_log_scrape.use_case import ScrapeKpiUseCase
from core.exceptions.domain_exceptions import DomainException
from infrastructure.di.decorators import Injectable
from infrastructure.monitoring.interface import IMonitoringService

@Injectable()
class KpiScrapeConsumer:
    def __init__(self, use_case: ScrapeKpiUseCase, monitor: IMonitoringService):
        self._use_case = use_case
        self._monitor = monitor

    async def on_message(self, message: IncomingMessage):
        async with message.process():
            try:
                # 1. Parse JSON body
                body = json.loads(message.body.decode())
                self._monitor.info(f"Received message: {body}")

                # 2. Validate with Pydantic DTO
                request = ScrapeKpiRequest(**body)
                
                # 3. Execute Use Case
                response = await self._use_case.execute(request)
                
                self._monitor.success(f"Successfully scraped KPI for participant {response.participant_id}")

            except json.JSONDecodeError:
                self._monitor.error("Failed to decode message body as JSON")
            except DomainException as e:
                self._monitor.error(f"Domain error during scraping: {e.message} (Code: {e.code})")
            except Exception as e:
                self._monitor.error(f"Unexpected error in consumer: {str(e)}")
