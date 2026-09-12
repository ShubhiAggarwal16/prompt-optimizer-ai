import pytest
from app.services.prompt_engine import prompt_engine

def test_calculate_quality_metrics_and_decide_winner():
    prompt_a = "Summarize the text in 3 bullet points with markdown headers."
    prompt_b = "Give me summary."
    test_input = "Antigravity is an advanced agentic coding platform designed for full-stack engineering."
    
    output_a = "## Executive Summary\n- Antigravity platform enables full-stack engineering.\n- Built for agentic coding workflows."
    output_b = "It is about antigravity platform."
    
    metrics_a = prompt_engine.calculate_quality_metrics(prompt_a, output_a, test_input, expected_structure="markdown_headers")
    metrics_b = prompt_engine.calculate_quality_metrics(prompt_b, output_b, test_input, expected_structure="markdown_headers")
    
    assert metrics_a.char_count > 0
    assert metrics_a.word_count > 0
    assert metrics_a.structure_match_score > metrics_b.structure_match_score
    assert metrics_a.composite_score > metrics_b.composite_score
    
    winner, reason = prompt_engine.compare_and_decide_winner(
        metrics_a, metrics_b, latency_a=150.0, latency_b=140.0, label_a="Structured Variant", label_b="Basic Variant"
    )
    assert winner == "Structured Variant"
    assert "outperformed" in reason
