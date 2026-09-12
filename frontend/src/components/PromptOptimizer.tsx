import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Copy,
  Check,
  Download,
  FileText,
  FileJson,
  SplitSquareVertical,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  Target,
  Zap,
} from 'lucide-react';
import { OptimizePromptResponse } from '../types';
import { api } from '../api/client';

interface PromptOptimizerProps {
  initialPrompt?: string;
  initialGoal?: string;
  onSendToABTesting: (promptA: string, promptB: string, labelA?: string, labelB?: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const PromptOptimizer: React.FC<PromptOptimizerProps> = ({
  initialPrompt = '',
  initialGoal = '',
  onSendToABTesting,
  onShowToast,
}) => {
  const [promptText, setPromptText] = useState(initialPrompt);
  const [goal, setGoal] = useState(initialGoal);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizePromptResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeDiffTab, setActiveDiffTab] = useState<'improved' | 'original' | 'side-by-side'>('side-by-side');

  // Sync if props update from generator
  React.useEffect(() => {
    if (initialPrompt) setPromptText(initialPrompt);
    if (initialGoal) setGoal(initialGoal);
  }, [initialPrompt, initialGoal]);

  const handleOptimize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) {
      onShowToast('Please paste or type an existing prompt to optimize.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await api.optimizePrompt({
        prompt_text: promptText.trim(),
        goal: goal.trim() || undefined,
      });
      setResult(data);
      onShowToast(`Optimized prompt! Score improved to ${data.overall_score}/100 (+${data.improvement_pct}%)`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Optimization failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyImproved = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.improved_prompt);
    setCopied(true);
    onShowToast('Optimized prompt copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!result) return;
    try {
      await api.downloadOptimizationPDF(result);
      onShowToast('Optimization PDF report downloaded!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'PDF export failed', 'error');
    }
  };

  const handleExportJSON = () => {
    if (!result) return;
    api.downloadJSON(`prompt_optimization_${result.id || 'export'}.json`, result);
    onShowToast('JSON export downloaded!', 'success');
  };

  const handleSendToAB = () => {
    if (!result) return;
    onSendToABTesting(
      result.original_prompt,
      result.improved_prompt,
      'Original (Baseline)',
      'Optimized Version'
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
    if (score >= 65) return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
    return 'text-rose-400 bg-rose-950/60 border-rose-500/30';
  };

  const getBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 65) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>Module 2: 4-Rubric Prompt Optimizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Prompt Analysis & Optimization Engine
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Paste any existing prompt. The engine evaluates it across a rigorous 4-factor rubric (
            <span className="text-indigo-300 font-semibold">Clarity</span>,{' '}
            <span className="text-sky-300 font-semibold">Specificity</span>,{' '}
            <span className="text-emerald-300 font-semibold">Constraint Completeness</span>, and{' '}
            <span className="text-amber-300 font-semibold">Ambiguity Reduction</span>
            ) and delivers an improved version with full transformation diffs.
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleOptimize} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <span>Existing Prompt to Analyze</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className="text-xs text-slate-500 font-mono">{promptText.length} characters</span>
            </div>
            <textarea
              rows={5}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Paste your existing raw prompt here (e.g. 'Write a summary of this document and make it good and clear...')"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 font-sans transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Optimization Goal / Specific Focus (Optional)</span>
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Enforce strict JSON output schema, eliminate hallucinations, improve conciseness..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setPromptText('Summarize this article and make it quick and clean.');
                  setGoal('Make it structured with bullet points and remove vague qualifiers.');
                }}
                className="text-xs text-slate-400 hover:text-indigo-400 underline underline-offset-2"
              >
                Load Example Prompt
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !promptText.trim()}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center space-x-2 transition-all transform active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Auditing & Transforming...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Analyze & Optimize Prompt</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Executive Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Overall Score */}
            <div className="md:col-span-1 bg-gradient-to-b from-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Composite Score</span>
                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-4xl font-extrabold text-white">{result.overall_score}</span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-indigo-500/20">
                <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{result.improvement_pct}% Improvement</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Baseline: {result.original_overall_score}/100</div>
              </div>
            </div>

            {/* 4 Rubric Gauges */}
            {[
              { label: 'Clarity', key: 'clarity', data: result.clarity, desc: 'Unambiguous directive phrasing' },
              { label: 'Specificity', key: 'specificity', data: result.specificity, desc: 'Defined parameters & formats' },
              { label: 'Completeness', key: 'completeness', data: result.completeness, desc: 'Negative constraints & edge cases' },
              { label: 'Ambiguity Reduction', key: 'ambiguity', data: result.ambiguity, desc: 'Eliminated vague words' },
            ].map((rubric) => (
              <div key={rubric.key} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{rubric.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getScoreColor(rubric.data.score)}`}>
                      {rubric.data.score}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden my-2">
                    <div className={`h-full ${getBarColor(rubric.data.score)} transition-all duration-700`} style={{ width: `${rubric.data.score}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mt-1">{rubric.data.assessment}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  {rubric.data.weaknesses && rubric.data.weaknesses.length > 0 && (
                    <div className="text-[10px] text-rose-400 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span className="truncate">{rubric.data.weaknesses[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Transformation Rationale & Key Changes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Transformation Rationale & Key Improvements</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{result.explanation}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {result.changes_breakdown.map((change, i) => (
                <div key={i} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{change.category}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {change.impact} Impact
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{change.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side Prompt Diff / Comparison */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Before vs After Comparison</h3>
                <p className="text-xs text-slate-400">Review the optimized production prompt alongside baseline</p>
              </div>

              {/* View Tabs */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
                <button
                  onClick={() => setActiveDiffTab('side-by-side')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    activeDiffTab === 'side-by-side' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setActiveDiffTab('improved')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    activeDiffTab === 'improved' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Improved Only
                </button>
                <button
                  onClick={() => setActiveDiffTab('original')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    activeDiffTab === 'original' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Original Only
                </button>
              </div>
            </div>

            {/* Prompt View Content */}
            {activeDiffTab === 'side-by-side' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Original */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-400">Original Baseline Prompt</span>
                    <span className="text-xs font-mono text-rose-400">Score: {result.original_overall_score}</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap h-96 overflow-y-auto leading-relaxed">
                    {result.original_prompt}
                  </pre>
                </div>

                {/* Improved */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Optimized Production Prompt</span>
                    </span>
                    <span className="text-xs font-mono text-emerald-400">Score: {result.overall_score}</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-100 font-mono whitespace-pre-wrap h-96 overflow-y-auto leading-relaxed shadow-inner">
                    {result.improved_prompt}
                  </pre>
                </div>
              </div>
            ) : activeDiffTab === 'improved' ? (
              <pre className="p-5 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-100 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                {result.improved_prompt}
              </pre>
            ) : (
              <pre className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                {result.original_prompt}
              </pre>
            )}

            {/* Actions Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyImproved}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Improved!' : 'Copy Improved Prompt'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendToAB}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/30 transition-colors"
                >
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                  <span>Send to A/B Testing</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>Export PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <FileJson className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
