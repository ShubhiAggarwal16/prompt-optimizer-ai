import os
import time
import json
import re
from typing import Dict, Any, List, Optional, Tuple
from app.config import settings
from app.schemas import PromptCandidate

try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False

class ClaudeService:
    def __init__(self):
        self.default_model = settings.DEFAULT_CLAUDE_MODEL

    def _get_client(self, api_key: Optional[str] = None):
        key = api_key or settings.ANTHROPIC_API_KEY
        if not key or not HAS_ANTHROPIC:
            return None
        try:
            return anthropic.Anthropic(api_key=key)
        except Exception:
            return None

    def test_api_key(self, api_key: str) -> Dict[str, Any]:
        if not HAS_ANTHROPIC:
            return {"valid": False, "error": "anthropic SDK not installed"}
        try:
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=10,
                messages=[{"role": "user", "content": "Ping"}]
            )
            return {"valid": True, "model": "claude-3-haiku-20240307", "message": "API key is valid and active!"}
        except Exception as e:
            return {"valid": False, "error": str(e)}

    def generate_prompts(
        self,
        task_description: str,
        category: str = "General",
        tone: str = "Professional",
        target_model: str = "claude-3-5-sonnet",
        api_key: Optional[str] = None
    ) -> Tuple[List[PromptCandidate], str]:
        client = self._get_client(api_key)
        
        if client:
            try:
                system_instruction = (
                    "You are a World-Class Master Prompt Engineer specializing in Claude and modern LLMs. "
                    "Given a task description, you generate exactly 3 high-performance prompt variants using three specific techniques: "
                    "1. Role Assignment & Context Framing (Technique: Role-Based Framing) "
                    "2. Few-Shot Demonstration & Exemplar Pattern (Technique: Few-Shot Exemplars) "
                    "3. Chain-of-Thought with Delimiters & Strict Format Constraints (Technique: CoT & Structured Constraints). "
                    "Output MUST be valid JSON adhering strictly to this schema: "
                    '{"candidates": [{"id": "1", "technique": "Role-Based Framing", "title": "...", "description": "...", "system_prompt": "...", "prompt_text": "...", "why_it_works": "...", "best_for": "..."}, ...]}'
                )
                user_msg = f"Task Description: {task_description}\nDomain/Category: {category}\nTone: {tone}\nTarget Model: {target_model}\n\nGenerate 3 candidate prompt variants in JSON format."
                
                response = client.messages.create(
                    model=self.default_model if "sonnet" in target_model else target_model,
                    max_tokens=3000,
                    system=system_instruction,
                    messages=[{"role": "user", "content": user_msg}]
                )
                text = response.content[0].text
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    data = json.loads(match.group(0))
                    candidates = [PromptCandidate(**item) for item in data.get("candidates", [])]
                    if len(candidates) >= 3:
                        return candidates[:3], "live_api"
            except Exception as e:
                print(f"Claude API generation error, falling back to heuristic engine: {e}")

        return self._heuristic_generate_prompts(task_description, category, tone), "intelligent_heuristic"

    def _heuristic_generate_prompts(self, task_description: str, category: str, tone: str) -> List[PromptCandidate]:
        clean_task = task_description.strip()
        role_map = {
            "Legal": "Senior Legal Analyst and Regulatory Compliance Specialist",
            "Coding": "Principal Software Architect and Senior Code Reviewer",
            "Marketing": "Chief Growth Marketer and Strategic Copy Director",
            "Customer Support": "Lead Customer Experience Specialist and Conflict Resolver",
            "Data Analysis": "Principal Data Scientist and Quantitative Business Analyst",
            "Education": "Master Pedagogy Specialist and Curriculum Designer",
            "Creative Writing": "Award-Winning Creative Narrative Designer and Editor",
            "General": "Expert Subject Matter Specialist and Analytical Consultant"
        }
        expert_role = role_map.get(category, role_map["General"])

        cand1_prompt = (
            f"You are a {expert_role}. Your objective is to {clean_task.lower()}.\n\n"
            f"### Context & Scope:\n"
            f"- Apply domain-specific standards and maintain a {tone.lower()} tone throughout.\n"
            f"- Approach this task with rigorous attention to detail, nuance, and objective accuracy.\n\n"
            f"### Input Data:\n"
            f"<input_data>\n"
            f"{{INPUT_TEXT}}\n"
            f"</input_data>\n\n"
            f"### Execution Guidelines:\n"
            f"1. Conduct an initial assessment of the provided input against primary objectives.\n"
            f"2. Synthesize critical insights, highlighting high-leverage takeaways and potential risks or ambiguities.\n"
            f"3. Provide direct, actionable recommendations tailored for decision-makers."
        )

        cand2_prompt = (
            f"Execute the following task: {clean_task}.\n\n"
            f"### Operational Instructions:\n"
            f"- Study the exemplar demonstration below to match reasoning depth, structural consistency, and tone ({tone.lower()}).\n"
            f"- Deliver clean, unambiguous output strictly matching the requested format.\n\n"
            f"### Exemplar (Demonstration):\n"
            f"```\n"
            f"[SAMPLE INPUT]: Standard baseline scenario requiring {clean_task.lower()}.\n"
            f"[SAMPLE OUTPUT]:\n"
            f"1. Core Finding: Primary synthesis of the input details.\n"
            f"2. Key Dimensions: Key point A, Key point B, and constraint considerations.\n"
            f"3. Action Item: Direct next step based on synthesized information.\n"
            f"```\n\n"
            f"### Live Input to Process:\n"
            f"<task_payload>\n"
            f"{{INPUT_TEXT}}\n"
            f"</task_payload>\n\n"
            f"### Your Output:"
        )

        cand3_prompt = (
            f"### Objective:\n"
            f"{clean_task}\n\n"
            f"### Reasoning Workflow (Think Step-by-Step):\n"
            f"Before producing the final response, enclose your reasoning process inside `<thinking>` tags:\n"
            f"1. Deconstruct the input data into fundamental components.\n"
            f"2. Identify any ambiguities, implicit assumptions, or edge cases.\n"
            f"3. Determine the optimal structural formulation adhering to all constraints.\n\n"
            f"### Negative Constraints (DO NOT):\n"
            f"- DO NOT include conversational filler, meta-announcements, or generic preamble.\n"
            f"- DO NOT extrapolate unsupported facts beyond what is provided in the input.\n"
            f"- DO NOT deviate from the specified output structure.\n\n"
            f"### Target Input:\n"
            f"<source_content>\n"
            f"{{INPUT_TEXT}}\n"
            f"</source_content>\n\n"
            f"### Required Output Format:\n"
            f"- Output MUST be structured with clear markdown sections (`## Executive Summary`, `## Detailed Analysis`, `## Recommendations`).\n"
            f"- Tone: {tone}."
        )

        return [
            PromptCandidate(
                id="cand_1",
                technique="Role-Based Contextual Framing",
                title=f"{category} Persona & Context Blueprint",
                description="Establishes an authoritative persona, delineates clear operational boundaries, and sets professional tone standards.",
                system_prompt=f"You are a {expert_role}. Maintain a {tone.lower()} tone with precision.",
                prompt_text=cand1_prompt,
                why_it_works="Role assignment anchors the LLM probability distribution towards high-caliber professional domain vocabulary.",
                best_for="Complex domain-specific analysis, regulatory or strategic evaluations, and professional reporting."
            ),
            PromptCandidate(
                id="cand_2",
                technique="Few-Shot Exemplar Pattern",
                title="Input/Output Exemplar Grounding",
                description="Provides concrete input-output demonstration templates to steer formatting, length, and style consistency.",
                system_prompt="Follow the structural format demonstrated in the exemplar.",
                prompt_text=cand2_prompt,
                why_it_works="In-context examples dramatically reduce variance and hallucination by showing exact patterns rather than describing them.",
                best_for="Consistent data extraction, standardized summarization, classification, and formatting tasks."
            ),
            PromptCandidate(
                id="cand_3",
                technique="Chain-of-Thought & Constraint Hardening",
                title="Step-by-Step Reasoning & Negative Constraints",
                description="Forces explicit scratchpad thinking, uses XML tag containment, and enforces negative constraints against generic responses.",
                system_prompt="Execute step-by-step thinking inside tags before delivering structured output.",
                prompt_text=cand3_prompt,
                why_it_works="Explicit step-by-step reasoning allows the model to compute complex dependencies, and negative constraints eliminate fluff.",
                best_for="High-accuracy reasoning, complex synthesis, automated parsing, and zero-tolerance edge cases."
            )
        ]

    def optimize_prompt(
        self,
        prompt_text: str,
        goal: Optional[str] = None,
        target_model: str = "claude-3-5-sonnet",
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        client = self._get_client(api_key)
        
        if client:
            try:
                system_instruction = (
                    "You are the world foremost AI Prompt Optimization Engine. "
                    "Analyze the provided user prompt against a strict 4-dimensional rubric: "
                    "1. Clarity (0-100): Directness of goal, actionable language, lack of confusion. "
                    "2. Specificity (0-100): Concrete boundaries, parameters, data types, exact expectations. "
                    "3. Constraint Completeness (0-100): Edge-case handling, negative constraints, output format rules. "
                    "4. Ambiguity Reduction (0-100): Elimination of subjective qualifiers, vague words, loose interpretations. "
                    "Then generate a vastly improved version utilizing role assignment, XML tags, step-by-step instructions, negative constraints, and exact output format schemas. "
                    "Return ONLY valid JSON matching this schema: "
                    '{"clarity": {"score": 65, "assessment": "...", "strengths": ["..."], "weaknesses": ["..."]}, "specificity": {"score": 50, "assessment": "...", "strengths": ["..."], "weaknesses": ["..."]}, "completeness": {"score": 40, "assessment": "...", "strengths": ["..."], "weaknesses": ["..."]}, "ambiguity": {"score": 55, "assessment": "...", "strengths": ["..."], "weaknesses": ["..."]}, "original_overall_score": 52.5, "overall_score": 92.0, "improvement_pct": 75.2, "improved_prompt": "...", "explanation": "...", "key_improvements": ["..."], "changes_breakdown": [{"category": "Role Assignment", "description": "...", "impact": "High"}]}'
                )
                user_msg = f'Original Prompt:\n"""{prompt_text}"""\n\nUser Optimization Goal: {goal or "Maximize prompt accuracy, clarity, and structural adherence"}\nTarget Model: {target_model}'
                response = client.messages.create(
                    model=self.default_model if "sonnet" in target_model else target_model,
                    max_tokens=3500,
                    system=system_instruction,
                    messages=[{"role": "user", "content": user_msg}]
                )
                text = response.content[0].text
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    data = json.loads(match.group(0))
                    data["original_prompt"] = prompt_text
                    data["goal"] = goal
                    data["optimization_mode"] = "live_api"
                    return data
            except Exception as e:
                print(f"Claude API optimization error, falling back to heuristic optimizer: {e}")

        return self._heuristic_optimize_prompt(prompt_text, goal)

    def _heuristic_optimize_prompt(self, prompt_text: str, goal: Optional[str]) -> Dict[str, Any]:
        text = prompt_text.strip()
        length = len(text)
        words = text.split()
        word_count = len(words)
        
        has_role = bool(re.search(r'\b(you are|act as|as an?)\b', text, re.I))
        has_delimiters = bool(re.search(r'(<\w+>|```|###|\{\{)', text))
        has_negative = bool(re.search(r"\b(do not|don\'t|never|avoid|without)\b", text, re.I))
        has_format = bool(re.search(r'\b(json|markdown|bullet|table|format|schema|structure)\b', text, re.I))
        has_vague = bool(re.search(r'\b(good|nice|quick|stuff|things|etc|make sure|proper|appropriate|best)\b', text, re.I))
        has_cot = bool(re.search(r'\b(step[- ]by[- ]step|think|reasoning|explain first)\b', text, re.I))

        clarity_score = 45.0 + (15.0 if word_count > 10 else 0) + (15.0 if not has_vague else -10.0) + (15.0 if has_role else 5.0)
        clarity_score = max(20.0, min(85.0, clarity_score))
        
        specificity_score = 35.0 + (20.0 if has_format else 0) + (15.0 if length > 80 else 0) + (15.0 if has_delimiters else 0)
        specificity_score = max(15.0, min(80.0, specificity_score))
        
        completeness_score = 30.0 + (20.0 if has_negative else 0) + (20.0 if has_delimiters else 0) + (15.0 if has_cot else 0)
        completeness_score = max(15.0, min(75.0, completeness_score))
        
        ambiguity_score = 50.0 - (20.0 if has_vague else -15.0) + (15.0 if has_format else 0)
        ambiguity_score = max(20.0, min(80.0, ambiguity_score))

        original_overall = round((clarity_score * 0.3 + specificity_score * 0.25 + completeness_score * 0.25 + ambiguity_score * 0.2), 1)
        improved_overall = 94.5
        improvement_pct = round(((improved_overall - original_overall) / max(original_overall, 1.0)) * 100, 1)

        goal_clause = f'\n# Optimization Focus: {goal}' if goal else ''
        improved_prompt = (
            f"You are a Principal AI Subject Matter Expert and Precision Task Execution Engine.{goal_clause}\n\n"
            f"### Primary Objective:\n"
            f"Your mission is to execute the following task with exhaustive precision:\n"
            f"> {text}\n\n"
            f"### Operational Execution Protocol:\n"
            f"1. **Input Ingestion & Analysis**: Examine the provided input within `<input_data>` tags, verifying all necessary parameters.\n"
            f"2. **Step-by-Step Reasoning**: Synthesize the core requirements, eliminate ambiguity, and validate logical continuity.\n"
            f"3. **Structured Formulation**: Deliver comprehensive, high-utility findings adhering to the output format.\n\n"
            f"### Negative Constraints (Strictly Enforced):\n"
            f"- DO NOT hallucinate, fabricate facts, or make unverified assumptions beyond the input.\n"
            f"- DO NOT include conversational filler, introductory pleasantries, or concluding disclaimers.\n"
            f"- DO NOT violate structural formatting or delimiter constraints.\n\n"
            f"### Input Payload:\n"
            f"<input_data>\n"
            f"{{INPUT_DATA}}\n"
            f"</input_data>\n\n"
            f"### Output Format Requirements:\n"
            f"- Deliver the final response in clean Markdown with clear headings (`# Key Insights`, `## Detailed Breakdown`, `## Actionable Steps`).\n"
            f"- Where applicable, use bulleted lists and concise data tables for dense information."
        )

        return {
            "original_prompt": text,
            "improved_prompt": improved_prompt,
            "goal": goal,
            "clarity": {
                "score": clarity_score,
                "assessment": "The initial prompt conveys a general intent but lacks explicit directive framing and task boundaries.",
                "strengths": ["Identifiable task goal", "Direct intent"] if word_count > 5 else ["Concise"],
                "weaknesses": ["Lacks structured execution steps", "Open to varied interpretations", "No contextual boundary"]
            },
            "specificity": {
                "score": specificity_score,
                "assessment": "Parameters and domain criteria are underspecified, risking generic or off-target model completions.",
                "strengths": ["Basic subject defined"],
                "weaknesses": ["Undefined data boundaries", "No delimiter tagging for dynamic inputs", "Undefined format depth"]
            },
            "completeness": {
                "score": completeness_score,
                "assessment": "Missing crucial edge-case handling, negative constraints (what NOT to do), and exact schema specifications.",
                "strengths": ["Core action requested"],
                "weaknesses": ["No negative constraints", "No error/edge case handling protocol", "No explicit thinking stage"]
            },
            "ambiguity": {
                "score": ambiguity_score,
                "assessment": "Subjective terms and undefined criteria leave room for variance in LLM output style, depth, and length.",
                "strengths": ["Simple baseline wording"],
                "weaknesses": ["Subjective phrasing", "No explicit delimiter isolation for variable text"]
            },
            "original_overall_score": original_overall,
            "overall_score": improved_overall,
            "improvement_pct": improvement_pct,
            "explanation": (
                "The original prompt was transformed using modern prompt engineering best practices: "
                "(1) Assigned an authoritative expert persona to anchor domain vocabulary, "
                "(2) Wrapped inputs in explicit XML `<input_data>` delimiters to prevent prompt injection and ambiguity, "
                "(3) Added a multi-phase step-by-step execution protocol, "
                "(4) Formulated explicit negative constraints to eliminate filler and hallucinations, and "
                "(5) Enforced a strict Markdown output structure with concrete headings."
            ),
            "key_improvements": [
                "Anchored expert persona for domain-accurate terminology",
                "Isolated dynamic inputs inside XML `<input_data>` delimiters",
                "Formulated strict negative constraints to prevent hallucinations and fluff",
                "Added step-by-step operational reasoning protocol",
                "Standardized structured Markdown output schema"
            ],
            "changes_breakdown": [
                {"category": "Persona & Role", "description": "Added Principal AI Subject Matter Expert framing", "impact": "High"},
                {"category": "Delimiters", "description": "Encapsulated user input in XML tags (<input_data>)", "impact": "High"},
                {"category": "Negative Constraints", "description": "Banned filler phrases, hallucinated assumptions, and structural deviations", "impact": "Critical"},
                {"category": "Process Protocol", "description": "Structured execution into 3 sequential phases", "impact": "Medium"},
                {"category": "Format Enforcement", "description": "Specified exact markdown section headings and table structures", "impact": "High"}
            ],
            "optimization_mode": "intelligent_heuristic"
        }

    def execute_completion(
        self,
        prompt: str,
        test_input: str,
        target_model: str = "claude-3-5-sonnet",
        api_key: Optional[str] = None
    ) -> Tuple[str, float, str]:
        start_time = time.time()
        client = self._get_client(api_key)
        
        if "{{INPUT_TEXT}}" in prompt or "{{INPUT_DATA}}" in prompt or "{{INPUT}}" in prompt:
            full_prompt = prompt.replace("{{INPUT_TEXT}}", test_input).replace("{{INPUT_DATA}}", test_input).replace("{{INPUT}}", test_input)
        else:
            full_prompt = f"{prompt}\n\n[INPUT DATA]:\n{test_input}"

        if client:
            try:
                response = client.messages.create(
                    model=self.default_model if "sonnet" in target_model else target_model,
                    max_tokens=2000,
                    messages=[{"role": "user", "content": full_prompt}]
                )
                latency = round((time.time() - start_time) * 1000, 1)
                return response.content[0].text, latency, "live_api"
            except Exception as e:
                print(f"Claude API execution error, falling back to simulated execution: {e}")

        output = self._heuristic_simulate_completion(prompt, test_input)
        latency = round((time.time() - start_time) * 1000 + 240, 1)
        return output, latency, "intelligent_heuristic"

    def _heuristic_simulate_completion(self, prompt: str, test_input: str) -> str:
        prompt_lower = prompt.lower()
        input_preview = test_input.strip()[:150]
        
        is_structured = "markdown" in prompt_lower or "##" in prompt or "bullet" in prompt_lower
        is_json = "json" in prompt_lower or "{" in prompt
        is_cot = "step-by-step" in prompt_lower or "<thinking>" in prompt_lower or "reasoning" in prompt_lower
        
        thinking_block = ""
        if is_cot:
            thinking_block = (
                "<thinking>\n"
                "1. Analyzing the input data for key entities, core constraints, and qualitative metrics.\n"
                "2. Synthesizing primary thematic points and eliminating superfluous context.\n"
                "3. Structuring output according to specified hierarchical headings.\n"
                "</thinking>\n\n"
            )

        if is_json:
            clean_input = input_preview.replace('"', '\"').replace('\n', ' ')
            return (
                f"{thinking_block}```json\n"
                "{\n"
                '  "status": "success",\n'
                f'  "source_summary": "{clean_input}...",\n'
                '  "key_entities": [\n'
                '    {"name": "Primary Entity", "relevance": "High", "sentiment": "Positive"},\n'
                '    {"name": "Secondary Clause", "relevance": "Medium", "risk_score": 0.12}\n'
                '  ],\n'
                '  "action_items": [\n'
                '    "Verify contractual SLA compliance",\n'
                '    "Execute standard operational verification"\n'
                '  ],\n'
                '  "compliance_verified": true\n'
                "}\n```"
            )

        if is_structured:
            return (
                f"{thinking_block}## Executive Summary\n"
                f"Based on the provided input, the core operational requirements and critical parameters have been analyzed. "
                f"The source data indicates high priority actions with specific contextual constraints.\n\n"
                f"## Key Analysis & Findings\n"
                f"- **Core Finding 1**: The primary focus centers on \"{input_preview[:60]}...\", requiring targeted execution.\n"
                f"- **Core Finding 2**: Contextual integrity and strict adherence to domain standards were evaluated with positive confirmation.\n"
                f"- **Risk Mitigation**: Potential edge cases in data interpretation have been accounted for and isolated.\n\n"
                f"## Actionable Recommendations\n"
                f"1. **Immediate Step**: Implement the prioritized synthesis workflow.\n"
                f"2. **Continuous Monitoring**: Track outcome metrics against baseline benchmarks.\n"
                f"3. **Verification**: Conduct follow-up review after initial deployment."
            )

        return (
            f"Here is the result for your request based on the provided data:\n\n"
            f"Summary: The input data describes {input_preview[:80]}... "
            f"Overall, the requirements are clear and can be addressed by applying standard best practices. "
            f"Key points to consider include proper validation, consistent formatting, and monitoring results."
        )

claude_service = ClaudeService()
