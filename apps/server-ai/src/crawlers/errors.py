from __future__ import annotations

from src.utils.errors import PipelineError


class CrawlerError(PipelineError):
    """Base crawler error."""

    def __init__(self, message: str, status_code: int = 500) -> None:
        super().__init__(message)
        self.status_code = status_code


class CrawlerInputError(CrawlerError):
    """Raised when crawler input is missing or invalid."""


class CrawlerTransportError(CrawlerError):
    """Raised for network timeouts, transport failures, and retryable upstream failures."""


class CrawlerRateLimitError(CrawlerTransportError):
    """Raised when the upstream crawler API rate limits the request."""


class CrawlerResponseError(CrawlerError):
    """Raised when the upstream crawler response is malformed or incomplete."""