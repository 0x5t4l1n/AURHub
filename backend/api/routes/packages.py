"""
Package API routes for ArchStore.
Handles search, info, install, and remove endpoints.
"""

from fastapi import APIRouter, HTTPException, Query
from services import package_service, aur_service
from scanner.security import scan_pkgbuild
from utils.sanitize import sanitize_package_name, sanitize_search_query

router = APIRouter(prefix="/api/packages", tags=["packages"])


@router.get("/search")
async def search_packages(
    q: str = Query(..., min_length=1, max_length=128, description="Search query"),
    source: str = Query("all", description="Source filter: all, pacman, aur"),
):
    """Search packages across pacman and AUR."""
    try:
        query = sanitize_search_query(q)
        results = await package_service.search_packages(query, source)
        return {"results": results, "count": len(results), "query": query, "source": source}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/installed")
async def list_installed():
    """List all installed packages."""
    try:
        packages = await package_service.list_installed()
        return {"results": packages, "count": len(packages)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list packages: {str(e)}")


@router.get("/{name}")
async def get_package_info(name: str):
    """Get detailed info about a specific package."""
    try:
        name = sanitize_package_name(name)
        info = await package_service.get_package_info(name)
        if not info:
            raise HTTPException(status_code=404, detail=f"Package '{name}' not found")
        return info
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get package info: {str(e)}")


@router.get("/{name}/scan")
async def scan_package(name: str):
    """Scan an AUR package's PKGBUILD for security issues."""
    try:
        name = sanitize_package_name(name)
        pkgbuild = await aur_service.get_pkgbuild(name)
        if not pkgbuild:
            return {
                "package_name": name,
                "risk_score": 0,
                "findings": [],
                "scanned": False,
                "risk_level": "unknown",
                "message": "PKGBUILD not found (may be a pacman package)",
            }
        result = scan_pkgbuild(name, pkgbuild)
        return result.to_dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{name}/install")
async def install_package(name: str):
    """Install a package."""
    try:
        name = sanitize_package_name(name)
        result = await package_service.install_package(name)
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["message"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Install failed: {str(e)}")


@router.post("/{name}/remove")
async def remove_package(name: str):
    """Remove an installed package."""
    try:
        name = sanitize_package_name(name)
        result = await package_service.remove_package(name)
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["message"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Remove failed: {str(e)}")
