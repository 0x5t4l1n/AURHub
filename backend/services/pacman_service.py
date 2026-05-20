"""
Pacman service for ArchStore.
Handles all interactions with the pacman package manager via subprocess.
"""

import asyncio
import re
from typing import Optional
from utils.sanitize import sanitize_package_name


async def _run_command(cmd: list[str], timeout: int = 30) -> tuple[str, str, int]:
    """
    Run a shell command safely using argument list (no shell=True).
    Returns (stdout, stderr, returncode).
    """
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


def _parse_search_results(output: str) -> list[dict]:
    """Parse pacman -Ss output into structured results."""
    packages = []
    lines = output.strip().split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        # Match: repo/name version [installed] or repo/name version
        match = re.match(
            r'^(\S+)/(\S+)\s+(\S+)(?:\s+\[installed(?::?\s*(\S+))?\])?\s*$',
            line
        )
        if match:
            repo = match.group(1)
            name = match.group(2)
            version = match.group(3)
            installed = match.group(4) is not None or "[installed" in line
            description = ""
            if i + 1 < len(lines) and lines[i + 1].startswith("    "):
                description = lines[i + 1].strip()
                i += 1
            packages.append({
                "name": name,
                "version": version,
                "description": description,
                "repository": repo,
                "source": "pacman",
                "installed": installed,
            })
        i += 1
    return packages


def _parse_package_info(output: str) -> dict:
    """Parse pacman -Si or -Qi output into a dict."""
    info = {}
    current_key = None
    current_value = []

    for line in output.split("\n"):
        if ":" in line and not line.startswith(" "):
            if current_key:
                info[current_key] = " ".join(current_value).strip()
            parts = line.split(":", 1)
            current_key = parts[0].strip().lower().replace(" ", "_")
            current_value = [parts[1].strip()] if len(parts) > 1 else []
        elif line.startswith("  ") and current_key:
            current_value.append(line.strip())

    if current_key:
        info[current_key] = " ".join(current_value).strip()

    return info


async def search_packages(query: str) -> list[dict]:
    """Search pacman repositories."""
    stdout, stderr, code = await _run_command(
        ["pacman", "-Ss", query], timeout=15
    )
    if code != 0:
        return []
    return _parse_search_results(stdout)


async def get_package_info(name: str) -> Optional[dict]:
    """Get detailed info about a package from sync db."""
    name = sanitize_package_name(name)

    # Try sync database first
    stdout, stderr, code = await _run_command(
        ["pacman", "-Si", name], timeout=10
    )
    if code == 0:
        info = _parse_package_info(stdout)
        info["source"] = "pacman"
        info["installed"] = await is_installed(name)
        return info

    return None


async def get_installed_info(name: str) -> Optional[dict]:
    """Get info about an installed package."""
    name = sanitize_package_name(name)
    stdout, stderr, code = await _run_command(
        ["pacman", "-Qi", name], timeout=10
    )
    if code == 0:
        info = _parse_package_info(stdout)
        info["source"] = "pacman"
        info["installed"] = True
        return info
    return None


async def is_installed(name: str) -> bool:
    """Check if a package is installed."""
    name = sanitize_package_name(name)
    _, _, code = await _run_command(["pacman", "-Q", name], timeout=5)
    return code == 0


async def list_installed() -> list[dict]:
    """List all explicitly installed packages."""
    stdout, _, code = await _run_command(
        ["pacman", "-Qe"], timeout=15
    )
    if code != 0:
        return []

    packages = []
    for line in stdout.strip().split("\n"):
        if line.strip():
            parts = line.split()
            if len(parts) >= 2:
                packages.append({
                    "name": parts[0],
                    "version": parts[1],
                    "source": "pacman",
                    "installed": True,
                })
    return packages


async def check_updates() -> list[dict]:
    """Check for available updates using checkupdates."""
    stdout, _, code = await _run_command(
        ["checkupdates"], timeout=60
    )
    # checkupdates returns 2 if no updates, 0 if updates available
    if code not in (0,):
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
                    "source": "pacman",
                })
    return updates


async def install_package(name: str) -> dict:
    """Install a package using pacman (requires pkexec)."""
    name = sanitize_package_name(name)
    stdout, stderr, code = await _run_command(
        ["pkexec", "pacman", "-S", "--noconfirm", name], timeout=300
    )
    return {
        "success": code == 0,
        "message": stdout if code == 0 else stderr,
        "package": name,
    }


async def remove_package(name: str) -> dict:
    """Remove a package using pacman (requires pkexec)."""
    name = sanitize_package_name(name)
    stdout, stderr, code = await _run_command(
        ["pkexec", "pacman", "-R", "--noconfirm", name], timeout=120
    )
    return {
        "success": code == 0,
        "message": stdout if code == 0 else stderr,
        "package": name,
    }


async def get_package_groups() -> list[str]:
    """Get list of all package groups."""
    stdout, _, code = await _run_command(
        ["pacman", "-Sg"], timeout=10
    )
    if code != 0:
        return []

    groups = set()
    for line in stdout.strip().split("\n"):
        if line.strip():
            groups.add(line.strip().split()[0])
    return sorted(groups)


async def get_group_packages(group: str) -> list[dict]:
    """Get packages in a specific group."""
    stdout, _, code = await _run_command(
        ["pacman", "-Sg", group], timeout=10
    )
    if code != 0:
        return []

    packages = []
    for line in stdout.strip().split("\n"):
        parts = line.strip().split()
        if len(parts) >= 2:
            is_inst = await is_installed(parts[1])
            packages.append({
                "name": parts[1],
                "source": "pacman",
                "installed": is_inst,
                "group": parts[0],
            })
    return packages
