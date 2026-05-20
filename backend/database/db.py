"""
SQLite database manager for ArchStore.
Handles connection lifecycle, schema creation, and cache operations.
"""

import aiosqlite
import os
import time
import json
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "archstore.db")
CACHE_TTL = 900  # 15 minutes in seconds


class Database:
    """Async SQLite database manager."""

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._db: Optional[aiosqlite.Connection] = None

    async def connect(self):
        """Open database connection and create tables."""
        self._db = await aiosqlite.connect(self.db_path)
        self._db.row_factory = aiosqlite.Row
        await self._db.execute("PRAGMA journal_mode=WAL")
        await self._create_tables()

    async def close(self):
        """Close database connection."""
        if self._db:
            await self._db.close()
            self._db = None

    async def _create_tables(self):
        """Create required tables if they don't exist."""
        await self._db.executescript("""
            CREATE TABLE IF NOT EXISTS search_cache (
                query TEXT NOT NULL,
                source TEXT NOT NULL,
                results TEXT NOT NULL,
                created_at REAL NOT NULL,
                PRIMARY KEY (query, source)
            );

            CREATE TABLE IF NOT EXISTS package_cache (
                name TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                created_at REAL NOT NULL
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_search_cache_time
                ON search_cache(created_at);

            CREATE INDEX IF NOT EXISTS idx_package_cache_time
                ON package_cache(created_at);
        """)
        await self._db.commit()

    async def get_cached_search(self, query: str, source: str) -> Optional[list]:
        """Get cached search results if still fresh."""
        cursor = await self._db.execute(
            "SELECT results, created_at FROM search_cache WHERE query = ? AND source = ?",
            (query, source)
        )
        row = await cursor.fetchone()
        if row and (time.time() - row["created_at"]) < CACHE_TTL:
            return json.loads(row["results"])
        return None

    async def set_cached_search(self, query: str, source: str, results: list):
        """Cache search results."""
        await self._db.execute(
            """INSERT OR REPLACE INTO search_cache (query, source, results, created_at)
               VALUES (?, ?, ?, ?)""",
            (query, source, json.dumps(results), time.time())
        )
        await self._db.commit()

    async def get_cached_package(self, name: str) -> Optional[dict]:
        """Get cached package info if still fresh."""
        cursor = await self._db.execute(
            "SELECT data, created_at FROM package_cache WHERE name = ?",
            (name,)
        )
        row = await cursor.fetchone()
        if row and (time.time() - row["created_at"]) < CACHE_TTL:
            return json.loads(row["data"])
        return None

    async def set_cached_package(self, name: str, data: dict):
        """Cache package info."""
        await self._db.execute(
            """INSERT OR REPLACE INTO package_cache (name, data, created_at)
               VALUES (?, ?, ?)""",
            (name, json.dumps(data), time.time())
        )
        await self._db.commit()

    async def get_setting(self, key: str, default: str = "") -> str:
        """Get a setting value."""
        cursor = await self._db.execute(
            "SELECT value FROM settings WHERE key = ?", (key,)
        )
        row = await cursor.fetchone()
        return row["value"] if row else default

    async def set_setting(self, key: str, value: str):
        """Set a setting value."""
        await self._db.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            (key, value)
        )
        await self._db.commit()

    async def clear_cache(self):
        """Clear all cached data."""
        await self._db.execute("DELETE FROM search_cache")
        await self._db.execute("DELETE FROM package_cache")
        await self._db.commit()

    async def cleanup_expired(self):
        """Remove expired cache entries."""
        cutoff = time.time() - CACHE_TTL
        await self._db.execute(
            "DELETE FROM search_cache WHERE created_at < ?", (cutoff,)
        )
        await self._db.execute(
            "DELETE FROM package_cache WHERE created_at < ?", (cutoff,)
        )
        await self._db.commit()


# Global database instance
db = Database()
