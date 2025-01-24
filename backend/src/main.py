from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import images
from .core.config import get_settings
from .core.sync import start_sync_task
import asyncio

settings = get_settings()

app = FastAPI(title="R2 Gallery API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # 启动同步任务
    asyncio.create_task(start_sync_task())

app.include_router(images.router, prefix="/api/images", tags=["images"]) 