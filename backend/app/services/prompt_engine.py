import re
import json
import math
from typing import List, Dict, Any, Optional, Tuple
from app.schemas import QualityMetrics

class PromptEngine:
    @staticmethod
    def calculate_quality_metrics(
        prompt: str,
        output: str,
        test_input: str,
        target_keywords: Optional[List[str]] = None,
        expected_structure: Optional[str] = "any"
    ) -> QualityMetrics:
        char_count = len(output)
        words = re.findall(r'\b\w+\b', output)
        word_count = len(words)
        estimated_tokens = int(word_count * 1.33)

        # Keyword Coverage Calculation
        keywords_to_check = []
        if target_keywords and len(target_keywords) > 0:
            keywords_to_check = [k.strip().lower() for k in target_keywords if k.strip()]
        else:
            stop_words = {
                "the", "and", "that", "have", "for", "not", "with", "you", "this", "but", "his", "from", 
                "they", "say", "her", "she", "will", "one", "all", "would", "there", "their", "what",
                "about", "which", "when", "make", "can", "like", "time", "just", "him", "know", "take",
                "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than",
                "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after",
                "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because"
            }
            input_words = re.findall(r'\b[a-zA-Z]{4,}\b', test_input.lower())
            salient = list(dict.fromkeys([w for w in input_words if w not in stop_words]))
            keywords_to_check = salient[:12] if salient else ["summary", "key", "analysis"]

        output_lower = output.lower()
        matched_keywords = [k for k in keywords_to_check if k in output_lower]
        missing_keywords = [k for k in keywords_to_check if k not in output_lower]
        
        keyword_coverage_pct = round(
            (len(matched_keywords) / max(len(keywords_to_check), 1)) * 100, 1
        )

        # Structure Match Evaluation
        structure_score, feedback = PromptEngine._evaluate_structure(output, expected_structure)

        # Readability & Lexical Diversity
        lexical_diversity = round((len(set(w.lower() for w in words)) / max(word_count, 1)) * 100, 1)
        
        avg_sentence_len = word_count / max(len(re.split(r'[.!?]+', output)), 1)
        readability = max(20.0, min(98.0, round(100 - (avg_sentence_len * 1.5) + (structure_score * 0.2), 1)))

        composite_score = round(
            (keyword_coverage_pct * 0.35) + 
            (structure_score * 0.35) + 
            (min(readability, 100.0) * 0.15) + 
            (min(lexical_diversity, 100.0) * 0.15),
            1
        )

        return QualityMetrics(
            char_count=char_count,
            word_count=word_count,
            estimated_tokens=estimated_tokens,
            keyword_coverage_pct=keyword_coverage_pct,
            matched_keywords=matched_keywords,
            missing_keywords=missing_keywords,
            structure_match_score=structure_score,
            structure_feedback=feedback,
            readability_score=readability,
            lexical_diversity=lexical_diversity,
            composite_score=composite_score
        )

    @staticmethod
    def _evaluate_structure(output: str, expected_structure: Optional[str]) -> Tuple[float, str]:
        has_headers = bool(re.search(r'^#{1,4}\s+.+', output, re.MULTILINE))
        has_bullets = bool(re.search(r'^\s*[-*]\s+.+', output, re.MULTILINE))
        has_numbers = bool(re.search(r'^\s*\d+\.\s+.+', output, re.MULTILINE))
        has_code_or_json = "```" in output or ("{" in output and "}" in output)
        has_xml_tags = bool(re.search(r'<[a-zA-Z_]+>.*?</[a-zA-Z_]+>', output, re.DOTALL))

        expected = (expected_structure or "any").lower()

        if expected == "json":
            try:
                json_str = output
                m = re.search(r'```json\s*(.*?)\s*```', output, re.DOTALL)
                if m:
                    json_str = m.group(1)
                else:
                    m2 = re.search(r'(\{.*\})', output, re.DOTALL)
                    if m2:
                        json_str = m2.group(1)
                json.loads(json_str)
                return 100.0, "Perfect JSON compliance. Schema parsed without errors."
            except Exception:
                return 40.0, "JSON format requested but output failed strict JSON parsing."

        elif expected == "markdown_headers":
            if has_headers and (has_bullets or has_numbers):
                return 95.0, "Excellent hierarchy with headings and structured itemization."
            elif has_headers:
                return 80.0, "Headers present with clean section breakdown."
            else:
                return 45.0, "Markdown headers missing; response is flat text."

        elif expected == "bullet_list":
            if has_bullets:
                return 95.0, "Bulleted formatting consistently applied."
            else:
                return 40.0, "Bulleted structure requested but omitted."

        elif expected == "numbered_steps":
            if has_numbers:
                return 95.0, "Numbered sequential steps cleanly defined."
            else:
                return 45.0, "Numbered sequence requested but omitted."

        # Default "any" structure evaluation
        score = 50.0
        details = []
        if has_headers:
            score += 20.0
            details.append("Markdown headers")
        if has_bullets or has_numbers:
            score += 15.0
            details.append("Structured list items")
        if has_code_or_json or has_xml_tags:
            score += 15.0
            details.append("Delimited code/tag blocks")

        score = min(100.0, score)
        feedback = f"Formatted with {', '.join(details)}." if details else "Standard continuous prose format."
        return score, feedback

    @staticmethod
    def compare_and_decide_winner(
        metrics_a: QualityMetrics,
        metrics_b: QualityMetrics,
        latency_a: float,
        latency_b: float,
        label_a: str = "Variant A",
        label_b: str = "Variant B"
    ) -> Tuple[str, str]:
        score_a = metrics_a.composite_score
        score_b = metrics_b.composite_score
        
        diff = score_a - score_b

        if abs(diff) < 2.5:
            if latency_a < latency_b * 0.8:
                return label_a, f"Both variants scored identically on quality ({score_a} vs {score_b}), but {label_a} executed significantly faster ({latency_a}ms vs {latency_b}ms)."
            elif latency_b < latency_a * 0.8:
                return label_b, f"Both variants scored identically on quality ({score_b} vs {score_a}), but {label_b} executed significantly faster ({latency_b}ms vs {latency_a}ms)."
            return "Tie", f"Both variants performed with virtually identical composite quality scores ({score_a} vs {score_b}) and balanced structural adherence."
        
        if diff > 0:
            reasons = []
            if metrics_a.keyword_coverage_pct > metrics_b.keyword_coverage_pct:
                reasons.append(f"higher keyword coverage ({metrics_a.keyword_coverage_pct}% vs {metrics_b.keyword_coverage_pct}%)")
            if metrics_a.structure_match_score > metrics_b.structure_match_score:
                reasons.append(f"superior structure formatting ({metrics_a.structure_match_score} vs {metrics_b.structure_match_score})")
            if metrics_a.lexical_diversity > metrics_b.lexical_diversity:
                reasons.append(f"greater vocabulary richness ({metrics_a.lexical_diversity}% vs {metrics_b.lexical_diversity}%)")
            
            reason_str = ", ".join(reasons) if reasons else "higher overall composite quality"
            return label_a, f"{label_a} outperformed {label_b} by {round(diff, 1)} points due to {reason_str}."
        else:
            diff_abs = round(abs(diff), 1)
            reasons = []
            if metrics_b.keyword_coverage_pct > metrics_a.keyword_coverage_pct:
                reasons.append(f"higher keyword coverage ({metrics_b.keyword_coverage_pct}% vs {metrics_a.keyword_coverage_pct}%)")
            if metrics_b.structure_match_score > metrics_a.structure_match_score:
                reasons.append(f"superior structure formatting ({metrics_b.structure_match_score} vs {metrics_a.structure_match_score})")
            if metrics_b.lexical_diversity > metrics_a.lexical_diversity:
                reasons.append(f"greater vocabulary richness ({metrics_b.lexical_diversity}% vs {metrics_a.lexical_diversity}%)")
            
            reason_str = ", ".join(reasons) if reasons else "higher overall composite quality"
            return label_b, f"{label_b} outperformed {label_a} by {diff_abs} points due to {reason_str}."

prompt_engine = PromptEngine()
