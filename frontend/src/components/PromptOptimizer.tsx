import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Copy,
  Check,
  FileText,
  FileJson,
  SplitSquareVertical,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Target,
  ArrowRight,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { OptimizePromptResponse } from '../types';
import { api } from '../api/client';

interface PromptOptimizerProps {
  initialPrompt?: string;
  initialGoal?: string;
  onSendToABTesting: (promptA: string, promptB: string, labelA?: string, labelB?: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const ROTATING_OPTIMIZING_MSGS = [
  'Reading your draft with care...',
  'Evaluating clarity, specificity, and constraints...',
  'Removing ambiguous words and tightening instructions...',
  'Crafting your polished, production-ready version...',
];

export const PromptOptimizer: React.FC<PromptOptimizerProps> = ({
  initialPrompt = '',
  initialGoal = '',
  onSendToABTesting,
  onShowToast,
}) => {
  const [promptText, setPromptText] = useState(initialPrompt);
  const [goal, setGoal] = useState(initialGoal);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [result, setResult] = useState<OptimizePromptResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeDiffTab, setActiveDiffTab] = useState<'side-by-side' | 'improved' | 'original'>('side-by-side');

  // Sync if props update from generator
  React.useEffect(() => {
    if (initialPrompt) setPromptText(initialPrompt);
    if (initialGoal) setGoal(initialGoal);
  }, [initialPrompt, initialGoal]);

  // Rotate loading text
  React.useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % ROTATING_OPTIMIZING_MSGS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  const handleOptimize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) {
      onShowToast('Please paste or write a prompt first so we can polish it for you.', 'error');
      return;
    }

    setLoading(true);
    setLoadingMsgIndex(0);
    try {
      const data = await api.optimizePrompt({
        prompt_text: promptText.trim(),
        goal: goal.trim() || undefined,
      });
      setResult(data);
      onShowToast(`All done! We boosted your prompt score to ${data.overall_score}/100 (+${data.improvement_pct}%)`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Hmm, something went wrong while polishing your prompt. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyImproved = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.improved_prompt);
    setCopied(true);
    onShowToast('Copied your polished prompt to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!result) return;
    try {
      await api.downloadOptimizationPDF(result);
      onShowToast('Your clean PDF report has been downloaded!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Could not export the PDF right now. Please try again.', 'error');
    }
  };

  const handleExportJSON = () => {
    if (!result) return;
    api.downloadJSON(`prompt_optimization_${result.id || 'export'}.json`, result);
    onShowToast('Saved JSON report to your downloads!', 'success');
  };

  const handleSendToAB = () => {
    if (!result) return;
    onSendToABTesting(
      result.original_prompt,
      result.improved_prompt,
      'My Original Draft',
      'Polished Version'
    );
  };

  const getBadgeStyle = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-400';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 sm:p-8 shadow-soft">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>Prompt Optimizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2B2D42] tracking-tight">
            Let's polish your prompt
          </h1>
          <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
            Paste any prompt you are working on. We will review it across four essential areas (
            <span className="text-indigo-600 font-semibold">Clarity</span>,{' '}
            <span className="text-teal-600 font-semibold">Specificity</span>,{' '}
            <span className="text-emerald-600 font-semibold">Constraint Completeness</span>, and{' '}
            <span className="text-amber-600 font-semibold">Ambiguity Reduction</span>
            ), give you honest scores, and rewrite it into a crisp, high-performing version.
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 sm:p-8 shadow-card">
        <form onSubmit={handleOptimize} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#2B2D42] flex items-center space-x-1.5">
                <span>Paste your original prompt</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-[#94A3B8] font-mono">{promptText.length} characters</span>
            </div>
            <textarea
              rows={5}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Paste the draft prompt you want to improve (for example: 'Write a summary of this document and make it good and clear...')"
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#EFEBE4] text-[#2B2D42] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 font-sans transition-all placeholder:text-[#94A3B8] leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B2D42] mb-1.5 flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              <span>What is your main goal? (Optional)</span>
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="For example: Return strict JSON format, avoid bullet points, make the tone empathetic..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE4] text-[#2B2D42] text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition-all placeholder:text-[#94A3B8]"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setPromptText('Summarize this article and make it quick and clean.');
                setGoal('Make it structured with short bullet points and remove vague qualifiers.');
              }}
              className="inline-flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Try a sample prompt</span>
            </button>

            <button
              type="submit"
              disabled={loading || !promptText.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-soft disabled:opacity-50 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{ROTATING_OPTIMIZING_MSGS[loadingMsgIndex]}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & improve prompt</span>
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
            {/* Overall Score Card */}
            <div className="md:col-span-1 bg-white border border-indigo-100 rounded-3xl p-5 flex flex-col justify-between shadow-soft">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Overall Score</span>
                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-4xl font-extrabold text-[#2B2D42]">{result.overall_score}</span>
                  <span className="text-xs text-[#94A3B8]">/ 100</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EFEBE4]">
                <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{result.improvement_pct}% improvement</span>
                </div>
                <div className="text-[11px] text-[#64748B] mt-0.5">Original draft was {result.original_overall_score}/100</div>
              </div>
            </div>

            {/* 4 Rubric Gauges */}
            {[
              { label: 'Clarity', key: 'clarity', data: result.clarity, desc: 'Is the directive clear and direct?' },
              { label: 'Specificity', key: 'specificity', data: result.specificity, desc: 'Are formats & parameters well defined?' },
              { label: 'Completeness', key: 'completeness', data: result.completeness, desc: 'Are boundaries & edge cases covered?' },
              { label: 'Ambiguity Reduction', key: 'ambiguity', data: result.ambiguity, desc: 'Are vague words eliminated?' },
            ].map((rubric) => (
              <div key={rubric.key} className="bg-white border border-[#EFEBE4] rounded-3xl p-4 flex flex-col justify-between shadow-soft">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#2B2D42]">{rubric.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(rubric.data.score)}`}>
                      {rubric.data.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-[#FAF7F2] h-2 rounded-full overflow-hidden my-2 border border-[#EFEBE4]">
                    <div
                      className={`h-full ${getProgressColor(rubric.data.score)} transition-all duration-700`}
                      style={{ width: `${rubric.data.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed mt-1">{rubric.data.assessment}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#F1EFEA]">
                  {rubric.data.weaknesses && rubric.data.weaknesses.length > 0 ? (
                    <div className="text-[11px] text-rose-600 flex items-start space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                      <span className="line-clamp-2">{rubric.data.weaknesses[0]}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-600 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      <span>Looks solid!</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Transformation Rationale & Key Changes */}
          <div className="bg-white border border-[#EFEBE4] rounded-3xl p-6 sm:p-7 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-[#2B2D42] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>What we improved and why</span>
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">{result.explanation}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {result.changes_breakdown.map((change, i) => (
                <div key={i} className="bg-[#FAF7F2] border border-[#EFEBE4] rounded-2xl p-3.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2B2D42]">{change.category}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {change.impact} Impact
                    </span>
                  </div>
                  <p className="text-[#64748B] text-[11px] leading-relaxed">{change.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side Prompt Diff / Comparison */}
          <div className="bg-white border border-[#EFEBE4] rounded-3xl p-6 sm:p-7 shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#2B2D42]">Before and After comparison</h3>
                <p className="text-xs text-[#64748B]">Review your original draft side-by-side with the improved version.</p>
              </div>

              {/* View Tabs */}
              <div className="flex items-center space-x-1 bg-[#FAF7F2] p-1 rounded-2xl border border-[#EFEBE4] self-start">
                <button
                  type="button"
                  onClick={() => setActiveDiffTab('side-by-side')}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                    activeDiffTab === 'side-by-side' ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#64748B] hover:text-[#2B2D42]'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDiffTab('improved')}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                    activeDiffTab === 'improved' ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#64748B] hover:text-[#2B2D42]'
                  }`}
                >
                  Polished Only
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDiffTab('original')}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                    activeDiffTab === 'original' ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#64748B] hover:text-[#2B2D42]'
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
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-[#64748B]">Original Draft</span>
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Score: {result.original_overall_score}/100
                    </span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFEBE4] text-xs text-[#64748B] font-mono whitespace-pre-wrap h-80 overflow-y-auto leading-relaxed">
                    {result.original_prompt}
                  </pre>
                </div>

                {/* Improved */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Polished Version</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Score: {result.overall_score}/100
                    </span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-white border border-emerald-200 text-xs text-[#2B2D42] font-mono whitespace-pre-wrap h-80 overflow-y-auto leading-relaxed shadow-soft">
                    {result.improved_prompt}
                  </pre>
                </div>
              </div>
            ) : activeDiffTab === 'improved' ? (
              <pre className="p-5 rounded-2xl bg-white border border-emerald-200 text-xs text-[#2B2D42] font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed shadow-soft">
                {result.improved_prompt}
              </pre>
            ) : (
              <pre className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EFEBE4] text-xs text-[#64748B] font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                {result.original_prompt}
              </pre>
            )}

            {/* Actions Bar */}
            <div className="pt-4 border-t border-[#EFEBE4] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyImproved}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft transition-all active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to clipboard!' : 'Copy polished prompt'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendToAB}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                >
                  <SplitSquareVertical className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Compare in A/B Test</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] shadow-sm transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>Export as PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] shadow-sm transition-colors"
                >
                  <FileJson className="w-3.5 h-3.5 text-amber-500" />
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
