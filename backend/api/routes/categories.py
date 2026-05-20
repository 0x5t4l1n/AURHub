"""
Categories API routes for ArchStore.
Handles package category browsing.
"""

from fastapi import APIRouter, HTTPException
from services import package_service

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("")
async def list_categories():
    """Get all available package categories."""
    try:
        categories = await package_service.get_categories()
        return {"results": categories, "count": len(categories)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get categories: {str(e)}")


@router.get("/{name}")
async def get_category_packages(name: str):
    """Get packages in a specific category."""
    try:
        packages = await package_service.get_category_packages(name)
        if not packages and name not in [c["name"] for c in await package_service.get_categories()]:
            raise HTTPException(status_code=404, detail=f"Category '{name}' not found")
        return {"category": name, "results": packages, "count": len(packages)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get category: {str(e)}")
