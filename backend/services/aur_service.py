"""
AUR RPC API service for ArchStore.
Handles all interactions with the Arch User Repository via the official RPC API
and yay for installations.
"""

import asyncio
import httpx
from typing import Optional
from utils.sanitize import sanitize_package_name, sanitize_search_query

AUR_RPC_BASE = "https://aur.archlinux.org/rpc/v5"
AUR_PACKAGE_URL = "https://aur.archlinux.org/packages"


async def _run_command(cmd: list[str], timeout: int = 30) -> tuple[str, str, int]:
    """Run a shell command safely."""
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(
            proc.communicate(), timeout=timeout
        )
        return (
            stdout.decode("utf-8", errors="replace"),
            stderr.decode("utf-8", errors="replace"),
            proc.returncode,
        )
    except asyncio.TimeoutError:
        proc.kill()
        return "", "Command timed out", -1
    except Exception as e:
        return "", str(e), -1


async def search_packages(query: str) -> list[dict]:
    """Search AUR packages using the RPC API."""
    query = sanitize_search_query(query)

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            response = await client.get(
                f"{AUR_RPC_BASE}/search/{query}",
                params={"by": "name-desc"},
            )
            response.raise_for_status()
            data = response.json()

            if data.get("type") != "search":
                return []

            packages = []
            for pkg in data.get("results", []):
                packages.append(_normalize_aur_package(pkg))

            # Sort by popularity descending
            packages.sort(key=lambda p: p.get("popularity", 0), reverse=True)
            return packages[:100]  # Limit results

        except (httpx.HTTPError, Exception):
            return []


async def get_package_info(name: str) -> Optional[dict]:
    """Get detailed info about an AUR package."""
    name = sanitize_package_name(name)

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            response = await client.get(
                f"{AUR_RPC_BASE}/info",
                params={"arg[]": name},
            )
            response.raise_for_status()
            data = response.json()

            results = data.get("results", [])
            if not results:
                return None

            pkg = _normalize_aur_package(results[0])

            # Check if installed
            _, _, code = await _run_command(["pacman", "-Q", name], timeout=5)
            pkg["installed"] = code == 0

            return pkg

        except (httpx.HTTPError, Exception):
            return None


async def install_package(name: str) -> dict:
    """Install an AUR package using yay."""
    name = sanitize_package_name(name)
    stdout, stderr, code = await _run_command(
        ["yay", "-S", "--noconfirm", name], timeout=600
    )
    return {
        "success": code == 0,
        "message": stdout if code == 0 else stderr,
        "package": name,
    }


async def check_updates() -> list[dict]:
    """Check for AUR package updates."""
    stdout, _, code = await _run_command(
        ["yay", "-Qua"], timeout=30
    )
    if code != 0:
        return []

    updates = []
    for line in stdout.strip().split("\n"):
        if line.strip():
            parts = line.split()
            if len(parts) >= 4:
                updates.append({
                    "name": parts[0],
                    "current_version": parts[1],
                    "new_version": parts[3],
                    "source": "aur",
                })
    return updates


async def get_pkgbuild(name: str) -> Optional[str]:
    """Fetch the PKGBUILD content for an AUR package."""
    name = sanitize_package_name(name)

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            url = f"https://aur.archlinux.org/cgit/aur.git/plain/PKGBUILD?h={name}"
            response = await client.get(url)
            if response.status_code == 200:
                return response.text
            return None
        except httpx.HTTPError:
            return None


def _normalize_aur_package(pkg: dict) -> dict:
    """Convert AUR RPC response to our standard package format."""
    return {
        "name": pkg.get("Name", ""),
        "version": pkg.get("Version", ""),
        "description": pkg.get("Description", ""),
        "maintainer": pkg.get("Maintainer", "Orphaned"),
        "url": pkg.get("URL", ""),
        "votes": pkg.get("NumVotes", 0),
        "popularity": pkg.get("Popularity", 0),
        "out_of_date": pkg.get("OutOfDate") is not None,
        "first_submitted": pkg.get("FirstSubmitted", 0),
        "last_modified": pkg.get("LastModified", 0),
        "source": "aur",
        "repository": "aur",
        "aur_url": f"{AUR_PACKAGE_URL}/{pkg.get('Name', '')}",
        "package_base": pkg.get("PackageBase", ""),
        "installed": False,
    }
