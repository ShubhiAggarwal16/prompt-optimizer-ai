from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime
from app.database import Base

class PromptHistory(Base):
    __tablename__ = "prompt_history"

    id = Column(Integer, primary_key=True, index=True)
    task_description = Column(Text, nullable=False)
    category = Column(String(100), default="General")
    technique = Column(String(100), nullable=False)
    prompt_title = Column(String(255), default="Generated Prompt")
    prompt_text = Column(Text, nullable=False)
    system_prompt = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    target_model = Column(String(100), default="claude-3-5-sonnet")
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PromptOptimization(Base):
    __tablename__ = "prompt_optimizations"

    id = Column(Integer, primary_key=True, index=True)
    task_goal = Column(String(255), nullable=True)
    original_prompt = Column(Text, nullable=False)
    improved_prompt = Column(Text, nullable=False)
    
    # 4-Rubric Scores (0 - 100)
    clarity_score = Column(Float, nullable=False, default=0.0)
    specificity_score = Column(Float, nullable=False, default=0.0)
    completeness_score = Column(Float, nullable=False, default=0.0)
    ambiguity_score = Column(Float, nullable=False, default=0.0)
    overall_score = Column(Float, nullable=False, default=0.0)
    original_overall_score = Column(Float, nullable=False, default=0.0)
    improvement_pct = Column(Float, nullable=False, default=0.0)
    
    explanation = Column(Text, nullable=False)
    suggestions_json = Column(Text, nullable=True)  # JSON string of list of tips
    diff_summary_json = Column(Text, nullable=True) # JSON string of change breakdown
    created_at = Column(DateTime, default=datetime.utcnow)

class ABTestRun(Base):
    __tablename__ = "ab_test_runs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), default="A/B Prompt Evaluation")
    label_a = Column(String(100), default="Variant A")
    label_b = Column(String(100), default="Variant B")
    prompt_a = Column(Text, nullable=False)
    prompt_b = Column(Text, nullable=False)
    test_input = Column(Text, nullable=False)
    
    output_a = Column(Text, nullable=False)
    output_b = Column(Text, nullable=False)
    
    # JSON encoded metrics
    metrics_a = Column(Text, nullable=False)
    metrics_b = Column(Text, nullable=False)
    
    latency_a_ms = Column(Float, default=0.0)
    latency_b_ms = Column(Float, default=0.0)
    winner = Column(String(50), default="Tie")
    verdict_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
