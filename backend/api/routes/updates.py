"""
Updates API routes for ArchStore.
Handles update checking and applying updates.
"""

from fastapi import APIRouter, HTTPException
from services import package_service

router = APIRouter(prefix="/api/updates", tags=["updates"])


@router.get("/check")
async def check_updates():
    """Check for available package updates (pacman + AUR)."""
    try:
        updates = await package_service.check_updates()
        return {
            "results": updates,
            "count": len(updates),
            "pacman_count": sum(1 for u in updates if u["source"] == "pacman"),
            "aur_count": sum(1 for u in updates if u["source"] == "aur"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update check failed: {str(e)}")


@router.post("/apply")
async def apply_updates():
    """Apply all available updates. This is a long-running operation."""
    try:
        import asyncio
        from utils.sanitize import sanitize_package_name

        async def _run_command(cmd, timeout=600):
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)
            return stdout.decode(), stderr.decode(), proc.returncode

        # Run system update via yay (handles both pacman and AUR)
        stdout, stderr, code = await _run_command(
            ["yay", "-Syu", "--noconfirm"], timeout=600
        )

        return {
            "success": code == 0,
            "message": stdout if code == 0 else stderr,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")
