from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional
from core.entities.kpi_log import KpiMetrics


class ISocialScraper(ABC):
    @abstractmethod
    async def tracking_kpi(self, url: str, last_time_tracking: Optional[datetime] = None) -> KpiMetrics:
        """
        Tracks KPI metrics from a given social media URL.
        
        Args:
            url: The URL of the social media content to track.
            last_time_tracking: Optional timestamp of the previous tracking session.
            
        Returns:
            KpiMetrics: The scraped metrics (views, likes, comments, shares).
            
        Raises:
            ScraperError: If the scraping process fails.
        """
        pass
