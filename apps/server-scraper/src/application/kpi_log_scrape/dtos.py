from pydantic import BaseModel, Field
from datetime import datetime
from core.entities.kpi_log import KpiMetrics


class ScrapeKpiRequest(BaseModel):
    url: str = Field(..., description="The URL of the social media content to scrape")
    participant_id: str = Field(..., description="The ID of the campaign participant")


class ScrapeKpiResponse(BaseModel):
    participant_id: str
    status: str = "success"
    scraped_at: datetime = Field(default_factory=datetime.utcnow)
    metrics: KpiMetrics
