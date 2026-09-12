import os
from typing import List

def _get_database_url() -> str:
    # Vercel sets the VERCEL env var; /tmp is the only writable path in serverless
    if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"):
        return "sqlite:////tmp/prompt_system.db"
    return os.getenv("DATABASE_URL", "sqlite:///./prompt_system.db")

class Settings:
    PROJECT_NAME: str = "AI Prompt Generation and Optimization System"
    VERSION: str = "1.0.0"
    DATABASE_URL: str = _get_database_url()
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    DEFAULT_CLAUDE_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
