from __future__ import annotations


class PipelineError(Exception):
    """Base pipeline error."""


class ConfigurationError(PipelineError):
    """Raised when environment config is invalid."""


class UpstreamApiError(PipelineError):
    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.status_code = status_code