from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Generator Schemas ---
class GeneratePromptRequest(BaseModel):
    task_description: str = Field(..., description="Description of what the prompt should accomplish")
    category: Optional[str] = Field("General", description="Domain or category e.g. Legal, Coding, Marketing")
    tone: Optional[str] = Field("Professional", description="Tone e.g. Concise, Detailed, Step-by-Step")
    target_model: Optional[str] = Field("claude-3-5-sonnet", description="Target LLM model")
    api_key: Optional[str] = Field(None, description="Optional custom Anthropic API key")

class PromptCandidate(BaseModel):
    id: str
    technique: str
    title: str
    description: str
    system_prompt: Optional[str] = ""
    prompt_text: str
    why_it_works: str
    best_for: str

class GeneratePromptResponse(BaseModel):
    task_description: str
    category: str
    candidates: List[PromptCandidate]
    generation_mode: str  # 'live_api' or 'intelligent_heuristic'

class SavePromptRequest(BaseModel):
    task_description: str
    category: Optional[str] = "General"
    technique: str
    prompt_title: str
    prompt_text: str
    system_prompt: Optional[str] = None
    explanation: Optional[str] = None
    target_model: Optional[str] = "claude-3-5-sonnet"

# --- Optimizer Schemas ---
class OptimizePromptRequest(BaseModel):
    prompt_text: str = Field(..., description="The original prompt to optimize")
    goal: Optional[str] = Field(None, description="Optional specific goal for optimization")
    target_model: Optional[str] = Field("claude-3-5-sonnet")
    api_key: Optional[str] = None

class RubricScore(BaseModel):
    score: float = Field(..., ge=0, le=100)
    assessment: str
    strengths: List[str]
    weaknesses: List[str]

class ChangeItem(BaseModel):
    category: str
    description: str
    impact: str

class OptimizePromptResponse(BaseModel):
    id: Optional[int] = None
    original_prompt: str
    improved_prompt: str
    goal: Optional[str] = None
    clarity: RubricScore
    specificity: RubricScore
    completeness: RubricScore
    ambiguity: RubricScore
    overall_score: float
    original_overall_score: float
    improvement_pct: float
    explanation: str
    key_improvements: List[str]
    changes_breakdown: List[ChangeItem]
    optimization_mode: str

# --- A/B Testing Schemas ---
class ABTestRequest(BaseModel):
    title: Optional[str] = "A/B Prompt Comparison"
    label_a: Optional[str] = "Variant A"
    label_b: Optional[str] = "Variant B"
    prompt_a: str
    prompt_b: str
    test_input: str
    target_keywords: Optional[List[str]] = None
    expected_structure: Optional[str] = "any" # "json", "markdown_headers", "bullet_list", "numbered_steps", "any"
    api_key: Optional[str] = None

class QualityMetrics(BaseModel):
    char_count: int
    word_count: int
    estimated_tokens: int
    keyword_coverage_pct: float
    matched_keywords: List[str]
    missing_keywords: List[str]
    structure_match_score: float
    structure_feedback: str
    readability_score: float
    lexical_diversity: float
    composite_score: float

class ABTestResponse(BaseModel):
    id: Optional[int] = None
    title: str
    label_a: str
    label_b: str
    prompt_a: str
    prompt_b: str
    test_input: str
    output_a: str
    output_b: str
    latency_a_ms: float
    latency_b_ms: float
    metrics_a: QualityMetrics
    metrics_b: QualityMetrics
    winner: str
    verdict_reason: str
    execution_mode: str

# --- History & Dashboard Schemas ---
class PromptHistoryItem(BaseModel):
    id: int
    task_description: str
    category: str
    technique: str
    prompt_title: str
    prompt_text: str
    system_prompt: Optional[str]
    explanation: Optional[str]
    target_model: str
    is_favorite: bool
    created_at: datetime

    model_config = {'from_attributes': True}

class OptimizationHistoryItem(BaseModel):
    id: int
    task_goal: Optional[str]
    original_prompt: str
    improved_prompt: str
    clarity_score: float
    specificity_score: float
    completeness_score: float
    ambiguity_score: float
    overall_score: float
    original_overall_score: float
    improvement_pct: float
    explanation: str
    created_at: datetime

    model_config = {'from_attributes': True}

class ABTestHistoryItem(BaseModel):
    id: int
    title: str
    label_a: str
    label_b: str
    test_input: str
    winner: str
    latency_a_ms: float
    latency_b_ms: float
    created_at: datetime

    model_config = {'from_attributes': True}

class AnalyticsSummary(BaseModel):
    total_prompts_generated: int
    total_optimizations: int
    total_ab_tests: int
    avg_improvement_pct: float
    avg_optimized_score: float
    technique_distribution: Dict[str, int]
    category_distribution: Dict[str, int]
    recent_optimizations: List[Dict[str, Any]]
