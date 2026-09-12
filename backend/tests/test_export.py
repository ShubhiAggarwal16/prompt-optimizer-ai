import pytest
from app.services.pdf_service import pdf_service

def test_generate_optimization_and_ab_pdf():
    opt_data = {
        "original_prompt": "Summarize this data.",
        "improved_prompt": "You are a Data Analyst. Summarize the data in markdown.",
        "original_overall_score": 45.0,
        "overall_score": 94.0,
        "improvement_pct": 108.8,
        "clarity": {"score": 50},
        "specificity": {"score": 40},
        "completeness": {"score": 35},
        "ambiguity": {"score": 55},
        "explanation": "Added persona and markdown structure.",
        "key_improvements": ["Persona framing", "Structured headers"]
    }
    buf = pdf_service.generate_optimization_pdf(opt_data)
    pdf_bytes = buf.getvalue()
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")

    ab_data = {
        "title": "Persona vs Basic",
        "label_a": "Variant A",
        "label_b": "Variant B",
        "test_input": "Sample text for testing",
        "output_a": "## Heading A\nResult A",
        "output_b": "Result B",
        "metrics_a": {"composite_score": 92.0, "keyword_coverage_pct": 80.0, "structure_match_score": 90.0, "readability_score": 85.0, "word_count": 25, "estimated_tokens": 33},
        "metrics_b": {"composite_score": 55.0, "keyword_coverage_pct": 40.0, "structure_match_score": 50.0, "readability_score": 60.0, "word_count": 10, "estimated_tokens": 13},
        "latency_a_ms": 320.0,
        "latency_b_ms": 290.0,
        "winner": "Variant A",
        "verdict_reason": "Variant A scored higher structure match."
    }
    ab_buf = pdf_service.generate_ab_test_pdf(ab_data)
    ab_pdf_bytes = ab_buf.getvalue()
    assert len(ab_pdf_bytes) > 500
    assert ab_pdf_bytes.startswith(b"%PDF")
