export type DomainCategory = 'General' | 'Legal' | 'Coding' | 'Marketing' | 'Customer Support' | 'Data Analysis' | 'Education' | 'Creative Writing';

export interface PromptCandidate {
  id: string;
  technique: string;
  title: string;
  description: string;
  system_prompt?: string;
  prompt_text: string;
  why_it_works: string;
  best_for: string;
}

export interface GeneratePromptResponse {
  task_description: string;
  category: string;
  candidates: PromptCandidate[];
  generation_mode: string;
}

export interface RubricScore {
  score: number;
  assessment: string;
  strengths: string[];
  weaknesses: string[];
}

export interface ChangeItem {
  category: string;
  description: string;
  impact: string;
}

export interface OptimizePromptResponse {
  id?: number;
  original_prompt: string;
  improved_prompt: string;
  goal?: string;
  clarity: RubricScore;
  specificity: RubricScore;
  completeness: RubricScore;
  ambiguity: RubricScore;
  overall_score: number;
  original_overall_score: number;
  improvement_pct: number;
  explanation: string;
  key_improvements: string[];
  changes_breakdown: ChangeItem[];
  optimization_mode: string;
}

export interface QualityMetrics {
  char_count: number;
  word_count: number;
  estimated_tokens: number;
  keyword_coverage_pct: number;
  matched_keywords: string[];
  missing_keywords: string[];
  structure_match_score: number;
  structure_feedback: string;
  readability_score: number;
  lexical_diversity: number;
  composite_score: number;
}

export interface ABTestResponse {
  id?: number;
  title: string;
  label_a: string;
  label_b: string;
  prompt_a: string;
  prompt_b: string;
  test_input: string;
  output_a: string;
  output_b: string;
  latency_a_ms: number;
  latency_b_ms: number;
  metrics_a: QualityMetrics;
  metrics_b: QualityMetrics;
  winner: string;
  verdict_reason: string;
  execution_mode: string;
}

export interface PromptHistoryItem {
  id: number;
  task_description: string;
  category: string;
  technique: string;
  prompt_title: string;
  prompt_text: string;
  system_prompt?: string;
  explanation?: string;
  target_model: string;
  is_favorite: boolean;
  created_at: string;
}

export interface OptimizationHistoryItem {
  id: number;
  task_goal?: string;
  original_prompt: string;
  improved_prompt: string;
  clarity_score: number;
  specificity_score: number;
  completeness_score: number;
  ambiguity_score: number;
  overall_score: number;
  original_overall_score: number;
  improvement_pct: number;
  explanation: string;
  created_at: string;
}

export interface ABTestHistoryItem {
  id: number;
  title: string;
  label_a: string;
  label_b: string;
  test_input: string;
  winner: string;
  latency_a_ms: number;
  latency_b_ms: number;
  created_at: string;
}

export interface AnalyticsSummary {
  total_prompts_generated: number;
  total_optimizations: number;
  total_ab_tests: number;
  avg_improvement_pct: number;
  avg_optimized_score: number;
  technique_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  recent_optimizations: Array<{
    id: number;
    date: string;
    baseline: number;
    optimized: number;
    improvement: number;
  }>;
}

export interface ConfigStatus {
  project_name: string;
  version: string;
  has_anthropic_key: boolean;
  default_model: string;
  supported_techniques: string[];
}
