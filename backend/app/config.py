import os
from typing import List

class Settings:
    PROJECT_NAME: str = "AI Prompt Generation and Optimization System"
    VERSION: str = "1.0.0"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./prompt_system.db")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    DEFAULT_CLAUDE_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
