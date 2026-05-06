from contextlib import asynccontextmanager
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .database import Base, SessionLocal, engine
from .migrations import ensure_runtime_schema
from .routers import admin, appointments, auth, catalog, users
from .seed import seed_demo_data


PROJECT_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIST = PROJECT_ROOT / "dist"


def _parse_origins(raw: str | None) -> list[str]:
    if not raw:
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_runtime_schema(engine)
    with SessionLocal() as db:
        seed_demo_data(db)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="MedConnect API",
        description="Production-ready FastAPI backend for the MedConnect React app.",
        version="2.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    allowed_origins = _parse_origins(os.getenv("ALLOWED_ORIGINS"))
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    app.include_router(auth.router, prefix="/api")
    app.include_router(catalog.router, prefix="/api")
    app.include_router(users.router, prefix="/api")
    app.include_router(appointments.router, prefix="/api")
    app.include_router(admin.router, prefix="/api")

    @app.get("/api/health", tags=["health"])
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "medconnect-api"}

    if (FRONTEND_DIST / "assets").exists():
        app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False, response_model=None)
    def serve_react_app(full_path: str) -> FileResponse | dict[str, str]:
        index_file = FRONTEND_DIST / "index.html"
        requested_file = FRONTEND_DIST / full_path
        if requested_file.is_file():
            return FileResponse(requested_file)
        if index_file.exists():
            return FileResponse(index_file)
        return {
            "status": "ok",
            "message": "MedConnect API is running. Build React with npm run build to serve the frontend.",
        }

    return app


app = create_app()
