import json
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PromptOptimization, ABTestRun, PromptHistory
from app.services.pdf_service import pdf_service

router = APIRouter(prefix="/api/export", tags=["Export"])

@router.post("/optimization/pdf")
def export_optimization_pdf_direct(data: dict):
    pdf_buffer = pdf_service.generate_optimization_pdf(data)
    filename = f"prompt_optimization_report_{int(data.get('overall_score', 90))}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/optimization/pdf/{id}")
def export_optimization_pdf(id: int, db: Session = Depends(get_db)):
    opt = db.query(PromptOptimization).filter(PromptOptimization.id == id).first()
    if not opt:
        raise HTTPException(status_code=404, detail="Optimization record not found")
    
    data = {
        "original_prompt": opt.original_prompt,
        "improved_prompt": opt.improved_prompt,
        "clarity": {"score": opt.clarity_score},
        "specificity": {"score": opt.specificity_score},
        "completeness": {"score": opt.completeness_score},
        "ambiguity": {"score": opt.ambiguity_score},
        "overall_score": opt.overall_score,
        "original_overall_score": opt.original_overall_score,
        "improvement_pct": opt.improvement_pct,
        "explanation": opt.explanation,
        "key_improvements": json.loads(opt.suggestions_json) if opt.suggestions_json else []
    }
    
    pdf_buffer = pdf_service.generate_optimization_pdf(data)
    filename = f"prompt_optimization_report_{opt.id}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.post("/ab-test/pdf")
def export_ab_test_pdf_direct(data: dict):
    pdf_buffer = pdf_service.generate_ab_test_pdf(data)
    filename = "ab_test_comparison_report.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/ab-test/pdf/{id}")
def export_ab_test_pdf(id: int, db: Session = Depends(get_db)):
    run = db.query(ABTestRun).filter(ABTestRun.id == id).first()
    if not run:
        raise HTTPException(status_code=404, detail="A/B Test record not found")

    data = {
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
        "verdict_reason": run.verdict_reason
    }

    pdf_buffer = pdf_service.generate_ab_test_pdf(data)
    filename = f"ab_test_report_{run.id}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.post("/json")
def export_prompt_json(data: dict):
    return JSONResponse(
        content=data,
        headers={"Content-Disposition": 'attachment; filename="prompt_export.json"'}
    )
