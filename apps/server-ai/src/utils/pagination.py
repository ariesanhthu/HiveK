from __future__ import annotations

from dataclasses import dataclass
from typing import Awaitable, Callable, Generic, TypeVar


T = TypeVar("T")


@dataclass(frozen=True)
class CursorPage(Generic[T]):
    items: list[T]
    next_cursor: str | None


class CursorPaginator(Generic[T]):
    def __init__(self, page_size: int) -> None:
        self._page_size = max(1, page_size)

    async def collect(
        self,
        fetch_page: Callable[[str | None, int], Awaitable[CursorPage[T]]],
        start_cursor: str | None = None,
        max_items: int | None = None,
    ) -> list[T]:
        collected: list[T] = []
        async for item in self.iterate(fetch_page, start_cursor=start_cursor, max_items=max_items):
            collected.append(item)
        return collected

    async def iterate(
        self,
        fetch_page: Callable[[str | None, int], Awaitable[CursorPage[T]]],
        start_cursor: str | None = None,
        max_items: int | None = None,
    ):
        cursor = start_cursor
        remaining = max_items

        while True:
            if remaining is not None and remaining <= 0:
                return

            page_limit = self._page_size if remaining is None else min(self._page_size, remaining)
            page = await fetch_page(cursor, page_limit)

            if not page.items:
                return

            for item in page.items:
                yield item
                if remaining is not None:
                    remaining -= 1
                    if remaining <= 0:
                        return

            cursor = page.next_cursor
            if cursor is None:
                return