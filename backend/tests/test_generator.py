import pytest
from app.services.claude_service import claude_service

def test_generate_prompts_returns_three_candidates():
    task = "Summarize complex legal terms of service for consumers"
    candidates, mode = claude_service.generate_prompts(task, category="Legal", tone="Professional")
    
    assert len(candidates) == 3
    assert any("Role" in c.technique for c in candidates)
    assert any("Exemplar" in c.technique or "Few-Shot" in c.technique for c in candidates)
    assert any("Chain-of-Thought" in c.technique or "Constraint" in c.technique for c in candidates)
    for c in candidates:
        assert len(c.prompt_text) > 50
        assert c.title
        assert c.why_it_works
