import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base
import app.models

Base.metadata.create_all(bind=engine)

from app.routers import generator, optimizer, ab_testing, history, analytics, export, config_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack AI-Powered Prompt Generation and Optimization System"
)

# CORS middleware for development Vite server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(generator.router)
app.include_router(optimizer.router)
app.include_router(ab_testing.router)
app.include_router(history.router)
app.include_router(analytics.router)
app.include_router(export.router)
app.include_router(config_router.router)

@app.get("/api/health")
def health():
    return {"status": "ok", "version": settings.VERSION}

# Mount static files if frontend dist exists
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    @app.get("/")
    def root():
        return {
            "message": "AI Prompt Generation and Optimization API is running",
            "docs": "/docs",
            "status": "healthy"
        }
