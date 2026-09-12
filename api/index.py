import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Top-level app required by Vercel's Python builder AST parser
app = FastAPI(title="PromptCraft AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from app.main import app as fastapi_app
    for route in fastapi_app.routes:
        app.routes.append(route)
except Exception as e:
    import traceback
    err_msg = traceback.format_exc()

    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
    def error_route(full_path: str):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={"error": "Backend load error", "detail": str(e), "traceback": err_msg}
        )

# Also expose handler for standard WSGI/ASGI serverless runtimes
handler = app
application = app


