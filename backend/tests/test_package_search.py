"""Regression tests for source filtering and unified package search."""

import unittest
from unittest.mock import AsyncMock, patch

from services import package_service


class PackageSearchTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        """Replace cache and package sources with isolated async mocks."""
        self.db = patch.object(package_service, "db").start()
        self.db.get_cached_search = AsyncMock(return_value=None)
        self.db.set_cached_search = AsyncMock()
        self.pacman = patch.object(
            package_service.pacman_service, "search_packages", new_callable=AsyncMock
        ).start()
        self.aur = patch.object(
            package_service.aur_service, "search_packages", new_callable=AsyncMock
        ).start()
        self.addCleanup(patch.stopall)

    async def test_filtered_search_only_calls_selected_source(self):
        """Each filter awaits its source once and leaves the other untouched."""
        for source, selected, unused in (
            ("pacman", self.pacman, self.aur),
            ("aur", self.aur, self.pacman),
        ):
            with self.subTest(source=source):
                self.pacman.reset_mock()
                self.aur.reset_mock()
                packages = [{"name": "git", "source": source}]
                selected.return_value = packages

                result = await package_service.search_packages("git", source)

                self.assertEqual(result, packages)
                selected.assert_called_once_with("git")
                selected.assert_awaited_once_with("git")
                unused.assert_not_called()
                self.db.set_cached_search.assert_awaited_with("git", source, packages)

    async def test_combined_search_calls_each_source_once_and_merges(self):
        """Combined search prioritizes official duplicates and installed packages."""
        official = {"name": "git", "source": "pacman"}
        installed = {"name": "z-git", "source": "aur", "installed": True}
        self.pacman.return_value = [official]
        self.aur.return_value = [{"name": "git", "source": "aur"}, installed]

        result = await package_service.search_packages("git")

        self.assertEqual(result, [installed, official])
        for service in (self.pacman, self.aur):
            service.assert_called_once_with("git")
            service.assert_awaited_once_with("git")
        self.db.set_cached_search.assert_awaited_once_with("git", "all", result)

    async def test_combined_search_preserves_results_when_one_source_fails(self):
        """A failed source does not discard results from the healthy source."""
        packages = [{"name": "git", "source": "pacman"}]
        self.pacman.return_value = packages
        self.aur.side_effect = RuntimeError("AUR unavailable")

        self.assertEqual(await package_service.search_packages("git"), packages)

    async def test_cache_hit_does_not_call_sources(self):
        """Cached results bypass both sources and avoid redundant cache writes."""
        packages = [{"name": "git", "source": "aur"}]
        self.db.get_cached_search.return_value = packages

        self.assertEqual(await package_service.search_packages("git", "aur"), packages)

        self.pacman.assert_not_called()
        self.aur.assert_not_called()
        self.db.set_cached_search.assert_not_awaited()
