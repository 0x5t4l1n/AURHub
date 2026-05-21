"""
ArchStore Backend — Main Application
A lightweight package store API for Arch Linux.
"""

import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database.db import db
from api.routes import packages, updates, categories


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown."""
    # Startup
    await db.connect()
    print("✓ Database connected")
    print("✓ ArchStore backend ready")
    yield
    # Shutdown
    await db.close()
    print("✗ Database disconnected")


app = FastAPI(
    title="ArchStore API",
    description="A lightweight package store API for Arch Linux combining pacman and AUR.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount route modules
app.include_router(packages.router)
app.include_router(updates.router)
app.include_router(categories.router)


@app.get("/api/health")
async def health():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "version": "1.0.0",
    }


@app.post("/api/cache/clear")
async def clear_cache():
    """Clear all cached data."""
    await db.clear_cache()
    return {"status": "ok", "message": "Cache cleared"}


# Frontend Static Files Serving for Production / Desktop Launch
STATIC_DIR = "/usr/share/archstore/frontend"
if not os.path.exists(STATIC_DIR):
    STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(STATIC_DIR):
    assets_dir = os.path.join(STATIC_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{fallback_path:path}")
    async def serve_frontend(fallback_path: str):
        # Serve favicon or other root files directly if they exist
        file_path = os.path.join(STATIC_DIR, fallback_path)
        if fallback_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise fallback to index.html for React SPA routing
        index_path = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
else:
    @app.get("/")
    async def root():
        """Health check fallback when static files are missing."""
        return {
            "name": "ArchStore API",
            "version": "1.0.0",
            "status": "running",
            "info": "Frontend static files not found. Run dev server on port 5173."
        }

