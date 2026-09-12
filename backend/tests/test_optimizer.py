import pytest
from app.services.claude_service import claude_service

def test_optimize_prompt_scores_all_four_rubrics():
    raw_prompt = "Make a good summary of this article and keep it short."
    result = claude_service.optimize_prompt(raw_prompt, goal="Enforce strict markdown output and eliminate vagueness")
    
    assert "clarity" in result
    assert "specificity" in result
    assert "completeness" in result
    assert "ambiguity" in result
    
    assert 0 <= result["clarity"]["score"] <= 100
    assert 0 <= result["specificity"]["score"] <= 100
    assert 0 <= result["completeness"]["score"] <= 100
    assert 0 <= result["ambiguity"]["score"] <= 100
    
    assert result["overall_score"] > result["original_overall_score"]
    assert result["improvement_pct"] > 0
    assert len(result["improved_prompt"]) > len(raw_prompt)
    assert len(result["key_improvements"]) > 0
