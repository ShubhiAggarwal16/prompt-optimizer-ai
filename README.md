# AI-Powered Prompt Generation and Optimization System

A modern, full-stack platform designed to generate, optimize, benchmark, and audit prompts for Large Language Models.

---

## Architecture Overview

```
PromptCraft AI
??? Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
??? Backend: Python FastAPI + Uvicorn + Pydantic v2 + SQLAlchemy
??? Storage: SQLite (prompt_system.db) with automatic schema migration
??? LLM Integration: Anthropic Claude API (Sonnet / Haiku / Opus) + Built-in Intelligent Heuristic Engine
??? PDF Engine: ReportLab document generator for executive reports
```

### Component & Data Flow Diagram

See [`architecture_diagram.md`](./architecture_diagram.md) for full visual Mermaid workflow and sequence diagrams.

```
[ User UI ] <---> [ FastAPI Router ] <---> [ Claude Service / Heuristic ] <---> [ Anthropic API ]
                          ?
                          ??---> [ Quality & Rubric Engine ]
                          ??---> [ SQLite DB (prompt_system.db) ]
                          ??---> [ ReportLab PDF Exporter ]
```

---

## Core Modules & Features

### 1. Prompt Generator (`Module 1`)
- Input high-level task goals (e.g. *"Summarize legal terms of service for consumers"*, *"Extract structured JSON from receipts"*).
- Domain category filters: `Legal`, `Coding`, `Marketing`, `Customer Support`, `Data Analysis`, `Education`, `Creative Writing`, `General`.
- Generates **3 distinct candidate prompt variants** using core prompt-engineering techniques:
  - **Variant 1 (Role-Based Contextual Framing)**: Persona specification, operational scope, and vocabulary grounding.
  - **Variant 2 (Few-Shot Exemplar Pattern)**: In-context input/output exemplar demonstrations to minimize output variance.
  - **Variant 3 (Chain-of-Thought & Constraint Hardening)**: Explicit `<thinking>` scratchpad reasoning, XML delimiters, and negative constraints.
- 1-click actions: **Send to Optimizer**, **Send to A/B Testing**, **Copy**, and **Save to History**.

### 2. Prompt Optimizer (`Module 2`)
- Analyzes existing raw prompts against a standardized **4-factor rubric**:
  - **Clarity (0-100)**: Directive language, unambiguous action verbs.
  - **Specificity (0-100)**: Defined parameters, data types, and expectations.
  - **Constraint Completeness (0-100)**: Negative constraints, edge cases, format schemas.
  - **Ambiguity Reduction (0-100)**: Elimination of fuzzy qualifiers (*"good"*, *"clean"*, *"stuff"*).
- Calculates **baseline score**, **improved score**, and **net percentage improvement (+X%)**.
- Provides a **before vs after side-by-side diff** and a **detailed transformation changelog**.
- Quick actions: **Export as PDF**, **Export as JSON**, **Send to A/B Testing**, **Copy Improved Prompt**.

### 3. A/B Testing Module (`Module 3`)
- Dual prompt execution harness (Variant A vs Variant B).
- Pre-loaded test input presets (Legal Clauses, Customer Escalations, Code Refactoring).
- Computes automated **objective quality metrics**:
  - **Output Length**: Characters, word count, and token estimates.
  - **Keyword Coverage %**: Calculates presence of key terms and missing concepts.
  - **Structural Compliance Score**: Validates JSON syntax, Markdown header hierarchy, bullet lists, or numbered sequences.
  - **Execution Latency**: Milliseconds per model response.
  - **Readability & Lexical Diversity Index**.
- Automated **winner verdict** with qualitative comparative rationale.

### 4. History & Dashboard (`Module 4`)
- SQLite database persistence for all generated prompts, optimization audits, and A/B test runs.
- **Analytics KPIs**: Total prompts generated, average improvement %, most-used techniques, domain distribution.
- Searchable & filterable data tables with favorite toggles, inspection modals, and direct export.

### 5. Multi-Format Export (`Module 5`)
- **Executive PDF Reports**: Professionally styled with ReportLab (scorecards, metric tables, before/after diffs, winner callouts).
- **Standard JSON Exports**: Machine-readable schema format for prompt version control and CI/CD pipelines.

---

## Quick Start & Setup Instructions

### Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** & **npm** (Tested on Node v24.14)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Set your Anthropic API Key
# If omitted, the system seamlessly uses the built-in intelligent heuristic engine
export ANTHROPIC_API_KEY="sk-ant-api03-..."   # Linux/macOS
$env:ANTHROPIC_API_KEY="sk-ant-api03-..."    # Windows PowerShell

# Start FastAPI server on port 8000
uvicorn app.main:app --reload --port 8000
```

FastAPI will be available at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Running Automated Tests

Run the full pytest suite for the backend:

```bash
pytest backend/tests -v
```

All 4 test suites will execute:
- `test_generator.py`: Verifies 3-candidate prompt generation logic.
- `test_optimizer.py`: Tests 4-rubric scoring and prompt improvement.
- `test_ab_test.py`: Tests metrics calculation (length, keyword coverage, structure match, readability) and winner determination.
- `test_export.py`: Tests ReportLab PDF binary generation.

---

## Directory Structure

```
prompt-system/
??? backend/
?   ??? app/
?   ?   ??? config.py             # Environment & settings
?   ?   ??? database.py           # SQLite SQLAlchemy engine
?   ?   ??? models.py             # ORM models (History, Optimizations, ABTests)
?   ?   ??? schemas.py            # Pydantic v2 schemas
?   ?   ??? main.py               # FastAPI entry point & CORS
?   ?   ??? routers/
?   ?   ?   ??? generator.py      # POST /api/generate
?   ?   ?   ??? optimizer.py      # POST /api/optimize
?   ?   ?   ??? ab_testing.py     # POST /api/ab-test/run
?   ?   ?   ??? history.py        # GET /api/history/*
?   ?   ?   ??? analytics.py      # GET /api/analytics/dashboard
?   ?   ?   ??? export.py         # POST /api/export/*
?   ?   ?   ??? config_router.py  # GET /api/config
?   ?   ??? services/
?   ?       ??? claude_service.py # Anthropic Claude API + Heuristic Engine
?   ?       ??? prompt_engine.py  # Rubric calculator & A/B quality metrics
?   ?       ??? pdf_service.py    # ReportLab PDF generator
?   ??? tests/
?   ?   ??? test_generator.py
?   ?   ??? test_optimizer.py
?   ?   ??? test_ab_test.py
?   ?   ??? test_export.py
?   ??? requirements.txt
??? frontend/
?   ??? src/
?   ?   ??? api/client.ts         # Type-safe API client
?   ?   ??? components/
?   ?   ?   ??? Navbar.tsx        # Header & API key indicator
?   ?   ?   ??? PromptGenerator.tsx # Module 1: Task input -> 3 candidates
?   ?   ?   ??? PromptOptimizer.tsx # Module 2: 4-rubric scoring & diff view
?   ?   ?   ??? ABTesting.tsx     # Module 3: Dual prompt comparison & metrics
?   ?   ?   ??? Dashboard.tsx     # Module 4: Analytics KPIs & data table
?   ?   ?   ??? ApiKeyModal.tsx   # Anthropic API Key configuration dialog
?   ?   ??? types/index.ts        # TypeScript domain models
?   ?   ??? App.tsx               # Root view router & notifications
?   ?   ??? index.css             # Tailwind styling & dark theme
?   ??? package.json
?   ??? vite.config.ts
?   ??? tailwind.config.js
??? architecture_diagram.md       # Detailed visual Mermaid diagrams
??? README.md
```
