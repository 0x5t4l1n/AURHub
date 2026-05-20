"""
Unified package service for ArchStore.
Merges pacman and AUR results, handles deduplication and ranking.
"""

import asyncio
from typing import Optional
from services import pacman_service, aur_service
from database.db import db
from utils.sanitize import sanitize_search_query, sanitize_package_name, validate_source_filter


# Category definitions — maps friendly names to pacman groups
CATEGORIES = {
    "Development": {
        "icon": "code",
        "description": "Programming tools, compilers, and IDEs",
        "groups": ["base-devel"],
        "keywords": ["gcc", "git", "python", "nodejs", "rust", "go", "vim", "neovim", "code"],
    },
    "System": {
        "icon": "monitor",
        "description": "Core system utilities and tools",
        "groups": ["base", "sys-utils"],
        "keywords": ["systemd", "kernel", "grub", "filesystem", "coreutils"],
    },
    "Network": {
        "icon": "wifi",
        "description": "Networking tools, browsers, and servers",
        "groups": ["network"],
        "keywords": ["firefox", "chromium", "curl", "wget", "nginx", "ssh"],
    },
    "Multimedia": {
        "icon": "music",
        "description": "Audio, video, and image tools",
        "groups": ["multimedia"],
        "keywords": ["vlc", "mpv", "ffmpeg", "gimp", "audacity", "obs"],
    },
    "Games": {
        "icon": "gamepad-2",
        "description": "Games and gaming tools",
        "groups": ["games"],
        "keywords": ["steam", "lutris", "wine", "gamemode"],
    },
    "Desktop": {
        "icon": "layout-dashboard",
        "description": "Desktop environments and window managers",
        "groups": ["gnome", "kde-applications", "xfce4"],
        "keywords": ["gnome", "kde", "xfce", "i3", "sway", "hyprland"],
    },
    "Fonts": {
        "icon": "type",
        "description": "Fonts and typography",
        "groups": ["fonts"],
        "keywords": ["ttf", "otf", "nerd-fonts", "noto"],
    },
    "Security": {
        "icon": "shield",
        "description": "Security and privacy tools",
        "groups": [],
        "keywords": ["firewall", "gpg", "openssl", "wireguard", "tor"],
    },
}


async def search_packages(query: str, source: str = "all") -> list[dict]:
    """
    Search packages from pacman, AUR, or both.
    Results are deduplicated, merged, and ranked.
    """
    query = sanitize_search_query(query)
    source = validate_source_filter(source)

    # Check cache first
    cached = await db.get_cached_search(query, source)
    if cached:
        return cached

    results = []

    if source in ("all", "pacman"):
        pacman_task = pacman_service.search_packages(query)
    else:
        pacman_task = asyncio.coroutine(lambda: [])()

    if source in ("all", "aur"):
        aur_task = aur_service.search_packages(query)
    else:
        aur_task = asyncio.coroutine(lambda: [])()

    # Run both searches concurrently
    if source == "all":
        pacman_results, aur_results = await asyncio.gather(
            pacman_service.search_packages(query),
            aur_service.search_packages(query),
            return_exceptions=True,
        )
        if isinstance(pacman_results, Exception):
            pacman_results = []
        if isinstance(aur_results, Exception):
            aur_results = []
        results = _merge_results(pacman_results, aur_results)
    elif source == "pacman":
        results = await pacman_service.search_packages(query)
    elif source == "aur":
        results = await aur_service.search_packages(query)

    # Cache results
    await db.set_cached_search(query, source, results)

    return results


async def get_package_info(name: str) -> Optional[dict]:
    """Get detailed package info, trying pacman first then AUR."""
    name = sanitize_package_name(name)

    # Check cache
    cached = await db.get_cached_package(name)
    if cached:
        return cached

    # Try pacman first
    info = await pacman_service.get_package_info(name)
    if not info:
        # Try AUR
        info = await aur_service.get_package_info(name)
    if not info:
        # Check if installed locally
        info = await pacman_service.get_installed_info(name)

    if info:
        await db.set_cached_package(name, info)

    return info


async def install_package(name: str) -> dict:
    """Install a package, auto-detecting source."""
    name = sanitize_package_name(name)

    # Try pacman first
    info = await pacman_service.get_package_info(name)
    if info:
        return await pacman_service.install_package(name)

    # Fall back to AUR via yay
    return await aur_service.install_package(name)


async def remove_package(name: str) -> dict:
    """Remove an installed package."""
    name = sanitize_package_name(name)
    return await pacman_service.remove_package(name)


async def list_installed() -> list[dict]:
    """List all installed packages."""
    return await pacman_service.list_installed()


async def check_updates() -> list[dict]:
    """Check for all available updates (pacman + AUR)."""
    pacman_updates, aur_updates = await asyncio.gather(
        pacman_service.check_updates(),
        aur_service.check_updates(),
        return_exceptions=True,
    )
    if isinstance(pacman_updates, Exception):
        pacman_updates = []
    if isinstance(aur_updates, Exception):
        aur_updates = []

    return pacman_updates + aur_updates


async def get_categories() -> list[dict]:
    """Get list of package categories."""
    return [
        {"name": name, **data}
        for name, data in CATEGORIES.items()
    ]


async def get_category_packages(category: str) -> list[dict]:
    """Get packages for a specific category using search."""
    cat = CATEGORIES.get(category)
    if not cat:
        return []

    # Search using category keywords
    all_results = []
    for keyword in cat.get("keywords", [])[:5]:
        try:
            results = await search_packages(keyword, "all")
            all_results.extend(results)
        except Exception:
            continue

    # Deduplicate by name
    seen = set()
    unique = []
    for pkg in all_results:
        if pkg["name"] not in seen:
            seen.add(pkg["name"])
            unique.append(pkg)

    return unique[:50]


def _merge_results(pacman: list[dict], aur: list[dict]) -> list[dict]:
    """Merge and deduplicate pacman + AUR results."""
    seen = {}

    # Pacman results take priority
    for pkg in pacman:
        seen[pkg["name"]] = pkg

    # Add AUR results if not already from pacman
    for pkg in aur:
        if pkg["name"] not in seen:
            seen[pkg["name"]] = pkg

    # Sort: installed first, then by name
    results = list(seen.values())
    results.sort(key=lambda p: (not p.get("installed", False), p.get("name", "")))

    return results
