from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path

class Settings(BaseSettings):
    CLOUDFLARE_ACCOUNT_ID: str
    CLOUDFLARE_ACCESS_KEY_ID: str
    CLOUDFLARE_SECRET_ACCESS_KEY: str
    BUCKET_NAME: str
    BUCKET_ENDPOINT: str
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]  # 前端开发服务器地址

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        # 确保在任何位置都能找到 .env 文件
        env_file = Path(__file__).parents[2] / '.env'

@lru_cache()
def get_settings() -> Settings:
    return Settings() 