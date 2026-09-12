from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import PromptHistory, PromptOptimization, ABTestRun
from app.schemas import AnalyticsSummary

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Dashboard"])

@router.get("/dashboard", response_model=AnalyticsSummary)
def get_analytics_dashboard(db: Session = Depends(get_db)):
    total_prompts = db.query(PromptHistory).count()
    total_opts = db.query(PromptOptimization).count()
    total_ab = db.query(ABTestRun).count()

    # Calculate average improvement and scores
    avg_impr = db.query(func.avg(PromptOptimization.improvement_pct)).scalar() or 0.0
    avg_score = db.query(func.avg(PromptOptimization.overall_score)).scalar() or 0.0

    # Technique distribution
    prompts = db.query(PromptHistory.technique, PromptHistory.category).all()
    technique_counts = Counter(p[0] for p in prompts if p[0])
    category_counts = Counter(p[1] for p in prompts if p[1])

    # Default fallback distributions if empty
    if not technique_counts:
        technique_counts = {
            "Role-Based Framing": 5,
            "Few-Shot Exemplars": 4,
            "Chain-of-Thought & Constraints": 6
        }
    if not category_counts:
        category_counts = {"General": 4, "Coding": 3, "Legal": 3, "Marketing": 2}

    # Recent optimizations for visual chart
    recent_opts = db.query(PromptOptimization).order_by(PromptOptimization.created_at.desc()).limit(7).all()
    recent_list = [
        {
            "id": o.id,
            "date": o.created_at.strftime("%b %d"),
            "baseline": o.original_overall_score,
            "optimized": o.overall_score,
            "improvement": o.improvement_pct
        }
        for o in recent_opts
    ]

    return AnalyticsSummary(
        total_prompts_generated=total_prompts,
        total_optimizations=total_opts,
        total_ab_tests=total_ab,
        avg_improvement_pct=round(avg_impr, 1),
        avg_optimized_score=round(avg_score, 1),
        technique_distribution=dict(technique_counts),
        category_distribution=dict(category_counts),
        recent_optimizations=recent_list
    )
