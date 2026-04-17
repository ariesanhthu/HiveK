from urllib.parse import urlparse
from core.enums.platform import SocialPlatform
from core.interfaces.scraper import ISocialScraper
from infrastructure.scraper.tiktok_scraper import TikTokScraper
from infrastructure.scraper.youtube_scraper import YouTubeScraper
from infrastructure.di.decorators import Injectable

@Injectable()
class ScraperFactory:
    @staticmethod
    def get_platform(url: str) -> SocialPlatform:
        """
        Detects the social media platform from a URL.
        """
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        if "tiktok.com" in domain:
            return SocialPlatform.TIKTOK
        if "youtube.com" in domain or "youtu.be" in domain:
            return SocialPlatform.YOUTUBE
            
        return SocialPlatform.UNKNOWN

    @staticmethod
    def create_scraper(url: str) -> ISocialScraper:
        """
        Returns the appropriate scraper implementation for a given URL.
        """
        platform = ScraperFactory.get_platform(url)
        
        if platform == SocialPlatform.TIKTOK:
            return TikTokScraper()
        if platform == SocialPlatform.YOUTUBE:
            return YouTubeScraper()
            
        raise ValueError(f"No scraper implementation found for platform: {platform}")
