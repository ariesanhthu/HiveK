class DomainException(Exception):
    """Base class for all domain-related exceptions."""
    def __init__(self, message: str, code: str = "DOMAIN_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class ScraperError(DomainException):
    """Raised when an error occurs during social media scraping."""
    def __init__(self, message: str, url: str):
        super().__init__(message, code="SCRAPER_ERROR")
        self.url = url


class PersistenceError(DomainException):
    """Raised when an error occurs during data persistence."""
    def __init__(self, message: str):
        super().__init__(message, code="PERSISTENCE_ERROR")


class InvalidEntityError(DomainException):
    """Raised when an entity fails domain validation."""
    def __init__(self, message: str):
        super().__init__(message, code="INVALID_ENTITY")
