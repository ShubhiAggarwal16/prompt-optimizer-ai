from fastapi import APIRouter
from pydantic import BaseModel
from app.config import settings
from app.services.claude_service import claude_service

router = APIRouter(prefix="/api/config", tags=["Configuration"])

class ValidateKeyRequest(BaseModel):
    api_key: str

@router.get("")
def get_config_status():
    has_env_key = bool(settings.ANTHROPIC_API_KEY and len(settings.ANTHROPIC_API_KEY) > 10)
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "has_anthropic_key": has_env_key,
        "default_model": settings.DEFAULT_CLAUDE_MODEL,
        "supported_techniques": [
            "Role-Based Contextual Framing",
            "Few-Shot Exemplar Grounding",
            "Chain-of-Thought & Constraint Hardening",
            "Delimited XML Schema Enforcement"
        ]
    }

@router.post("/test-key")
def test_anthropic_key(req: ValidateKeyRequest):
    return claude_service.test_api_key(req.api_key)
