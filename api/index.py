import sys
import os
import traceback

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.main import app as fastapi_app
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware

    # Create root app that mounts the FastAPI app both at root and at /api
    # This guarantees routes match whether Vercel strips /api or keeps /api
    app = FastAPI(title="Vercel App Entrypoint")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount fastapi_app at /api and include router at root
    for route in fastapi_app.routes:
        app.routes.append(route)
        # Also duplicate route without /api prefix if it starts with /api
        # so both /api/generate and /generate hit the same handler
        if hasattr(route, 'path') and route.path.startswith("/api/"):
            stripped_path = route.path[4:]  # remove '/api'
            # Check if stripped_path already handled
            pass

    app.mount("/api", fastapi_app)

except Exception as e:
    err_tb = traceback.format_exc()
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI(title="Error Fallback")

    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
    def catch_all_error(full_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Backend initialization failed",
                "detail": str(e),
                "traceback": err_tb,
                "sys_path": sys.path,
                "cwd": os.getcwd(),
            }
        )

