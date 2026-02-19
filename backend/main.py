"""
Perspectra Backend — FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db.mongo import connect_mongo, close_mongo
from db.neo4j import connect_neo4j, close_neo4j
from auth.router import router as auth_router
from profile.router import router as profile_router
from review.router import router as review_router
from tutor.router import router as tutor_router
from graph.router import router as graph_router
from insights.router import insights_router, problems_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_mongo()
    await connect_neo4j()
    yield
    # Shutdown
    await close_mongo()
    await close_neo4j()


app = FastAPI(
    title="Perspectra API",
    description="Agentic EdTech — Knowledge Graph Driven Adaptive Learning",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins in dev (lock down in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(review_router)
app.include_router(tutor_router)
app.include_router(graph_router)
app.include_router(insights_router)
app.include_router(problems_router)


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "service": "Perspectra API", "version": "1.0.0"}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    from config import get_settings
    s = get_settings()
    uvicorn.run("main:app", host=s.app_host, port=s.app_port, reload=True)
