from __future__ import annotations

from dataclasses import dataclass
from os import getenv

from src.utils.errors import ConfigurationError


DEFAULT_API_BASE_URL = "https://hivek-main-backend-54ef5f252bc1.herokuapp.com/hivek/api"
DEFAULT_CRAWLER_API_BASE_URL = "https://www.googleapis.com/youtube/v3"


@dataclass(frozen=True)
class AppConfig:
    api_base_url: str = DEFAULT_API_BASE_URL
    platform_page_size: int = 10
    pipeline_max_profiles: int = 100
    pipeline_concurrency: int = 4
    api_timeout_seconds: float = 30.0
    crawler_mode: str = "placeholder"
    crawler_api_base_url: str = DEFAULT_CRAWLER_API_BASE_URL
    crawler_api_key: str | None = None
    crawler_timeout_seconds: float = 30.0
    crawler_retry_count: int = 3
    crawler_retry_delay_seconds: float = 1.0
    crawler_seed_salt: str = "hivek-placeholder"
    scheduler_enabled: bool = True
    scheduler_interval_seconds: int = 86_400
    scheduler_initial_delay_seconds: int = 0
    scheduler_top_kol_limit: int = 20
    scheduler_retry_attempts: int = 3
    scheduler_retry_delay_seconds: float = 30.0


def _read_int(name: str, default: int) -> int:
    value = getenv(name)
    return default if value is None else int(value)


def _read_float(name: str, default: float) -> float:
    value = getenv(name)
    return default if value is None else float(value)


def _read_bool(name: str, default: bool) -> bool:
    value = getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def load_app_config() -> AppConfig:
    crawler_mode = getenv("CRAWLER_MODE", "placeholder").strip().lower()
    if crawler_mode not in {"placeholder", "real"}:
        raise ConfigurationError(f"Unsupported CRAWLER_MODE value: {crawler_mode}")

    return AppConfig(
        api_base_url=getenv("API_BASE_URL", DEFAULT_API_BASE_URL),
        platform_page_size=_read_int("PIPELINE_PAGE_SIZE", 10),
        pipeline_max_profiles=_read_int("PIPELINE_MAX_PROFILES", 100),
        pipeline_concurrency=_read_int("PIPELINE_CONCURRENCY", 4),
        api_timeout_seconds=_read_float("API_TIMEOUT_SECONDS", 30.0),
        crawler_mode=crawler_mode,
        crawler_api_base_url=getenv("CRAWLER_API_BASE_URL", DEFAULT_CRAWLER_API_BASE_URL),
        crawler_api_key=getenv("CRAWLER_API_KEY") or None,
        crawler_timeout_seconds=_read_float("CRAWLER_TIMEOUT", 30.0),
        crawler_retry_count=_read_int("CRAWLER_RETRY_COUNT", 3),
        crawler_retry_delay_seconds=_read_float("CRAWLER_RETRY_DELAY", 1.0),
        crawler_seed_salt=getenv("CRAWLER_SEED_SALT", "hivek-placeholder"),
        scheduler_enabled=_read_bool("PIPELINE_SCHEDULER_ENABLED", True),
        scheduler_interval_seconds=_read_int("PIPELINE_SCHEDULER_INTERVAL_SECONDS", 86_400),
        scheduler_initial_delay_seconds=_read_int("PIPELINE_SCHEDULER_INITIAL_DELAY_SECONDS", 0),
        scheduler_top_kol_limit=_read_int("PIPELINE_SCHEDULER_TOP_KOL_LIMIT", 20),
        scheduler_retry_attempts=_read_int("PIPELINE_SCHEDULER_RETRY_ATTEMPTS", 3),
        scheduler_retry_delay_seconds=_read_float("PIPELINE_SCHEDULER_RETRY_DELAY_SECONDS", 30.0),
    )