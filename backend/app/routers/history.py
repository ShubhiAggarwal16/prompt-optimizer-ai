import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PromptHistory, PromptOptimization, ABTestRun
from app.schemas import PromptHistoryItem, OptimizationHistoryItem, ABTestHistoryItem

router = APIRouter(prefix="/api/history", tags=["History"])

@router.get("/prompts", response_model=List[PromptHistoryItem])
def get_prompt_history(
    category: str = Query(None),
    search: str = Query(None),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(PromptHistory)
    if category and category != "All":
        query = query.filter(PromptHistory.category == category)
    if search:
        query = query.filter(
            (PromptHistory.task_description.ilike(f"%{search}%")) |
            (PromptHistory.prompt_text.ilike(f"%{search}%")) |
            (PromptHistory.technique.ilike(f"%{search}%"))
        )
    return query.order_by(PromptHistory.created_at.desc()).limit(limit).all()

@router.get("/optimizations", response_model=List[OptimizationHistoryItem])
def get_optimization_history(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(PromptOptimization).order_by(PromptOptimization.created_at.desc()).limit(limit).all()

@router.get("/ab-tests", response_model=List[ABTestHistoryItem])
def get_ab_test_history(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(ABTestRun).order_by(ABTestRun.created_at.desc()).limit(limit).all()

@router.get("/optimizations/{id}")
def get_single_optimization(id: int, db: Session = Depends(get_db)):
    opt = db.query(PromptOptimization).filter(PromptOptimization.id == id).first()
    if not opt:
        raise HTTPException(status_code=404, detail="Optimization record not found")
    return {
        "id": opt.id,
        "task_goal": opt.task_goal,
        "original_prompt": opt.original_prompt,
        "improved_prompt": opt.improved_prompt,
        "clarity": {"score": opt.clarity_score, "assessment": "Clarity evaluated.", "strengths": [], "weaknesses": []},
        "specificity": {"score": opt.specificity_score, "assessment": "Specificity evaluated.", "strengths": [], "weaknesses": []},
        "completeness": {"score": opt.completeness_score, "assessment": "Completeness evaluated.", "strengths": [], "weaknesses": []},
        "ambiguity": {"score": opt.ambiguity_score, "assessment": "Ambiguity evaluated.", "strengths": [], "weaknesses": []},
        "overall_score": opt.overall_score,
        "original_overall_score": opt.original_overall_score,
        "improvement_pct": opt.improvement_pct,
        "explanation": opt.explanation,
        "key_improvements": json.loads(opt.suggestions_json) if opt.suggestions_json else [],
        "changes_breakdown": json.loads(opt.diff_summary_json) if opt.diff_summary_json else [],
        "created_at": opt.created_at
    }

@router.get("/ab-tests/{id}")
def get_single_ab_test(id: int, db: Session = Depends(get_db)):
    run = db.query(ABTestRun).filter(ABTestRun.id == id).first()
    if not run:
        raise HTTPException(status_code=404, detail="A/B Test record not found")
    return {
        "id": run.id,
        "title": run.title,
        "label_a": run.label_a,
        "label_b": run.label_b,
        "prompt_a": run.prompt_a,
        "prompt_b": run.prompt_b,
        "test_input": run.test_input,
        "output_a": run.output_a,
        "output_b": run.output_b,
        "metrics_a": json.loads(run.metrics_a),
        "metrics_b": json.loads(run.metrics_b),
        "latency_a_ms": run.latency_a_ms,
        "latency_b_ms": run.latency_b_ms,
        "winner": run.winner,
        "verdict_reason": run.verdict_reason,
        "created_at": run.created_at
    }

@router.delete("/{record_type}/{id}")
def delete_history_item(record_type: str, id: int, db: Session = Depends(get_db)):
    if record_type == "prompt":
        item = db.query(PromptHistory).filter(PromptHistory.id == id).first()
    elif record_type == "optimization":
        item = db.query(PromptOptimization).filter(PromptOptimization.id == id).first()
    elif record_type == "ab-test":
        item = db.query(ABTestRun).filter(ABTestRun.id == id).first()
    else:
        raise HTTPException(status_code=400, detail="Invalid record type")
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    return {"status": "success", "message": f"{record_type} record deleted."}

@router.patch("/prompts/{id}/favorite")
def toggle_favorite_prompt(id: int, db: Session = Depends(get_db)):
    prompt = db.query(PromptHistory).filter(PromptHistory.id == id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    prompt.is_favorite = not prompt.is_favorite
    db.commit()
    return {"status": "success", "id": prompt.id, "is_favorite": prompt.is_favorite}
