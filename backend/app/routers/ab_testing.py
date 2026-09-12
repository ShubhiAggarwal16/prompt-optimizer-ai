import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ABTestRun
from app.schemas import ABTestRequest, ABTestResponse
from app.services.claude_service import claude_service
from app.services.prompt_engine import prompt_engine

router = APIRouter(prefix="/api/ab-test", tags=["A/B Testing"])

@router.post("/run", response_model=ABTestResponse)
def run_ab_test(req: ABTestRequest, db: Session = Depends(get_db)):
    if not req.prompt_a.strip() or not req.prompt_b.strip():
        raise HTTPException(status_code=400, detail="Both Prompt A and Prompt B are required.")
    if not req.test_input.strip():
        raise HTTPException(status_code=400, detail="Test input is required.")

    # Execute Prompt A
    out_a, lat_a, mode_a = claude_service.execute_completion(
        prompt=req.prompt_a,
        test_input=req.test_input,
        api_key=req.api_key
    )

    # Execute Prompt B
    out_b, lat_b, mode_b = claude_service.execute_completion(
        prompt=req.prompt_b,
        test_input=req.test_input,
        api_key=req.api_key
    )

    # Calculate Quality Metrics for both
    metrics_a = prompt_engine.calculate_quality_metrics(
        prompt=req.prompt_a,
        output=out_a,
        test_input=req.test_input,
        target_keywords=req.target_keywords,
        expected_structure=req.expected_structure
    )

    metrics_b = prompt_engine.calculate_quality_metrics(
        prompt=req.prompt_b,
        output=out_b,
        test_input=req.test_input,
        target_keywords=req.target_keywords,
        expected_structure=req.expected_structure
    )

    # Decide Winner
    winner, reason = prompt_engine.compare_and_decide_winner(
        metrics_a=metrics_a,
        metrics_b=metrics_b,
        latency_a=lat_a,
        latency_b=lat_b,
        label_a=req.label_a or "Variant A",
        label_b=req.label_b or "Variant B"
    )

    # Store in Database
    run_record = ABTestRun(
        title=req.title or "A/B Prompt Comparison",
        label_a=req.label_a or "Variant A",
        label_b=req.label_b or "Variant B",
        prompt_a=req.prompt_a,
        prompt_b=req.prompt_b,
        test_input=req.test_input,
        output_a=out_a,
        output_b=out_b,
        metrics_a=metrics_a.model_dump_json(),
        metrics_b=metrics_b.model_dump_json(),
        latency_a_ms=lat_a,
        latency_b_ms=lat_b,
        winner=winner,
        verdict_reason=reason
    )
    db.add(run_record)
    db.commit()
    db.refresh(run_record)

    return ABTestResponse(
        id=run_record.id,
        title=req.title or "A/B Prompt Comparison",
        label_a=req.label_a or "Variant A",
        label_b=req.label_b or "Variant B",
        prompt_a=req.prompt_a,
        prompt_b=req.prompt_b,
        test_input=req.test_input,
        output_a=out_a,
        output_b=out_b,
        latency_a_ms=lat_a,
        latency_b_ms=lat_b,
        metrics_a=metrics_a,
        metrics_b=metrics_b,
        winner=winner,
        verdict_reason=reason,
        execution_mode=mode_a if mode_a == mode_b else f"{mode_a}/{mode_b}"
    )
