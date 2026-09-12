import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PromptOptimization
from app.schemas import OptimizePromptRequest, OptimizePromptResponse
from app.services.claude_service import claude_service

router = APIRouter(prefix="/api/optimize", tags=["Prompt Optimizer"])

@router.post("", response_model=OptimizePromptResponse)
def optimize_prompt(req: OptimizePromptRequest, db: Session = Depends(get_db)):
    if not req.prompt_text.strip():
        raise HTTPException(status_code=400, detail="Prompt text cannot be empty.")

    result = claude_service.optimize_prompt(
        prompt_text=req.prompt_text,
        goal=req.goal,
        target_model=req.target_model or "claude-3-5-sonnet",
        api_key=req.api_key
    )

    # Persist in DB
    record = PromptOptimization(
        task_goal=req.goal,
        original_prompt=result["original_prompt"],
        improved_prompt=result["improved_prompt"],
        clarity_score=result["clarity"]["score"],
        specificity_score=result["specificity"]["score"],
        completeness_score=result["completeness"]["score"],
        ambiguity_score=result["ambiguity"]["score"],
        overall_score=result["overall_score"],
        original_overall_score=result["original_overall_score"],
        improvement_pct=result["improvement_pct"],
        explanation=result["explanation"],
        suggestions_json=json.dumps(result.get("key_improvements", [])),
        diff_summary_json=json.dumps(result.get("changes_breakdown", []))
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    result["id"] = record.id
    return OptimizePromptResponse(**result)
