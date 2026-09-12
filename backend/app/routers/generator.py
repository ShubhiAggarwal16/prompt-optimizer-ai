import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PromptHistory
from app.schemas import GeneratePromptRequest, GeneratePromptResponse, SavePromptRequest
from app.services.claude_service import claude_service

router = APIRouter(prefix="/api/generate", tags=["Prompt Generator"])

@router.post("", response_model=GeneratePromptResponse)
def generate_candidate_prompts(req: GeneratePromptRequest, db: Session = Depends(get_db)):
    if not req.task_description.strip():
        raise HTTPException(status_code=400, detail="Task description cannot be empty.")
    
    candidates, mode = claude_service.generate_prompts(
        task_description=req.task_description,
        category=req.category or "General",
        tone=req.tone or "Professional",
        target_model=req.target_model or "claude-3-5-sonnet",
        api_key=req.api_key
    )
    
    # Save automatically to history
    for c in candidates:
        hist = PromptHistory(
            task_description=req.task_description,
            category=req.category or "General",
            technique=c.technique,
            prompt_title=c.title,
            prompt_text=c.prompt_text,
            system_prompt=c.system_prompt,
            explanation=c.why_it_works,
            target_model=req.target_model or "claude-3-5-sonnet"
        )
        db.add(hist)
    db.commit()

    return GeneratePromptResponse(
        task_description=req.task_description,
        category=req.category or "General",
        candidates=candidates,
        generation_mode=mode
    )

@router.post("/save")
def save_custom_prompt(req: SavePromptRequest, db: Session = Depends(get_db)):
    hist = PromptHistory(
        task_description=req.task_description,
        category=req.category or "General",
        technique=req.technique,
        prompt_title=req.prompt_title,
        prompt_text=req.prompt_text,
        system_prompt=req.system_prompt,
        explanation=req.explanation,
        target_model=req.target_model or "claude-3-5-sonnet"
    )
    db.add(hist)
    db.commit()
    db.refresh(hist)
    return {"status": "success", "id": hist.id, "message": "Prompt saved to history."}
