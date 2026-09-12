import React, { useState } from 'react';
import {
  SplitSquareVertical,
  Play,
  Trophy,
  Zap,
  Gauge,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText,
  FileJson,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { ABTestResponse } from '../types';
import { api } from '../api/client';

interface ABTestingProps {
  initialPromptA?: string;
  initialPromptB?: string;
  initialLabelA?: string;
  initialLabelB?: string;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const SAMPLE_INPUTS = [
  {
    name: 'Legal Terms Clause',
    structure: 'markdown_headers',
    keywords: ['arbitration', 'liability', 'termination', 'consumer'],
    text: `Section 14.2 Dispute Resolution: Any controversy or claim arising out of or relating to this Contract, or the breach thereof, shall be settled by arbitration administered by the American Arbitration Association in accordance with its Commercial Arbitration Rules. You explicitly waive the right to participate in any class action lawsuit or class-wide arbitration. The renewal terms require 60-day written notice prior to automatic 12-month extension.`,
  },
  {
    name: 'Customer Support Escalation',
    structure: 'bullet_list',
    keywords: ['refund', 'delay', 'resolution', 'compensation'],
    text: `Subject: URGENT - Broken laptop received on order #99281. I ordered the pro workstation 3 weeks ago for my client presentation tomorrow, and the box arrived damaged with a shattered screen. Your phone line disconnected twice and nobody responded to my ticket from yesterday. I demand an immediate replacement overnight or a full refund including express shipping fees!`,
  },
  {
    name: 'Python Function Refactor',
    structure: 'any',
    keywords: ['complexity', 'type annotations', 'exception', 'pytest'],
    text: `def process_orders(data):
    res = []
    for d in data:
        if d['status'] == 'active':
            if d.get('total') and d['total'] > 100:
                res.append({'id': d['id'], 'val': d['total'] * 0.9})
    return res`,
  },
];

export const ABTesting: React.FC<ABTestingProps> = ({
  initialPromptA = '',
  initialPromptB = '',
  initialLabelA = 'Variant A (Baseline)',
  initialLabelB = 'Variant B (Optimized)',
  onShowToast,
}) => {
  const [promptA, setPromptA] = useState(initialPromptA);
  const [promptB, setPromptB] = useState(initialPromptB);
  const [labelA, setLabelA] = useState(initialLabelA);
  const [labelB, setLabelB] = useState(initialLabelB);
  const [testInput, setTestInput] = useState(SAMPLE_INPUTS[0].text);
  const [expectedStructure, setExpectedStructure] = useState('markdown_headers');
  const [targetKeywordsInput, setTargetKeywordsInput] = useState('arbitration, liability, termination');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ABTestResponse | null>(null);
  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);

  // Sync if props update
  React.useEffect(() => {
    if (initialPromptA) setPromptA(initialPromptA);
    if (initialPromptB) setPromptB(initialPromptB);
    if (initialLabelA) setLabelA(initialLabelA);
    if (initialLabelB) setLabelB(initialLabelB);
  }, [initialPromptA, initialPromptB, initialLabelA, initialLabelB]);

  const handleRunTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptA.trim() || !promptB.trim()) {
      onShowToast('Please provide both Prompt A and Prompt B.', 'error');
      return;
    }
    if (!testInput.trim()) {
      onShowToast('Please enter sample test input to execute against.', 'error');
      return;
    }

    const keywords = targetKeywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    setLoading(true);
    try {
      const data = await api.runABTest({
        title: `${labelA} vs ${labelB}`,
        label_a: labelA,
        label_b: labelB,
        prompt_a: promptA,
        prompt_b: promptB,
        test_input: testInput,
        target_keywords: keywords.length > 0 ? keywords : undefined,
        expected_structure: expectedStructure,
      });
      setResult(data);
      onShowToast(`A/B Test complete! Winner: ${data.winner}`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'A/B Test run failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!result) return;
    try {
      await api.downloadABTestPDF(result);
      onShowToast('A/B Test PDF report downloaded!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'PDF export failed', 'error');
    }
  };

  const handleExportJSON = () => {
    if (!result) return;
    api.downloadJSON(`ab_test_run_${result.id || 'export'}.json`, result);
    onShowToast('JSON export downloaded!', 'success');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Module 3: Comparative A/B Testing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Prompt A/B Testing & Evaluation Harness
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Execute two prompt variants against identical test data in parallel. Compute objective quality metrics (
            <span className="text-indigo-300 font-semibold">Length & Token Density</span>,{' '}
            <span className="text-sky-300 font-semibold">Keyword Coverage</span>,{' '}
            <span className="text-emerald-300 font-semibold">Structural Compliance</span>, and{' '}
            <span className="text-amber-300 font-semibold">Execution Latency</span>
            ) with automated winner evaluation.
          </p>
        </div>
      </div>

      {/* Dual Prompt Configuration & Shared Input */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
        <form onSubmit={handleRunTest} className="space-y-6">
          {/* Dual Prompt Editors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prompt A */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={labelA}
                  onChange={(e) => setLabelA(e.target.value)}
                  className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs font-mono text-slate-500">{promptA.length} chars</span>
              </div>
              <textarea
                rows={6}
                value={promptA}
                onChange={(e) => setPromptA(e.target.value)}
                placeholder="Paste Prompt Variant A here..."
                className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono transition-all placeholder:text-slate-600 leading-relaxed"
              />
            </div>

            {/* Prompt B */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={labelB}
                  onChange={(e) => setLabelB(e.target.value)}
                  className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-sky-500"
                />
                <span className="text-xs font-mono text-slate-500">{promptB.length} chars</span>
              </div>
              <textarea
                rows={6}
                value={promptB}
                onChange={(e) => setPromptB(e.target.value)}
                placeholder="Paste Prompt Variant B here..."
                className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500 font-mono transition-all placeholder:text-slate-600 leading-relaxed"
              />
            </div>
          </div>

          {/* Shared Test Input */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Shared Test Input Payload <span className="text-rose-400">*</span>
              </label>

              {/* Sample presets */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400 flex items-center">
                  <Lightbulb className="w-3 h-3 text-amber-400 mr-1" />
                  Presets:
                </span>
                {SAMPLE_INPUTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTestInput(sample.text);
                      setExpectedStructure(sample.structure);
                      setTargetKeywordsInput(sample.keywords.join(', '));
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={4}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter the shared input data that both prompts will evaluate..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Metric Constraints Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Expected Output Structure
              </label>
              <select
                value={expectedStructure}
                onChange={(e) => setExpectedStructure(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="markdown_headers">Markdown Section Headers (## Executive, ## Key Findings)</option>
                <option value="bullet_list">Bulleted List Items (- Item)</option>
                <option value="numbered_steps">Numbered Sequential Steps (1. Step)</option>
                <option value="json">Valid JSON Schema Parse</option>
                <option value="any">Standard Text / General Prose</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Target Keywords for Coverage % (Comma-separated)
              </label>
              <input
                type="text"
                value={targetKeywordsInput}
                onChange={(e) => setTargetKeywordsInput(e.target.value)}
                placeholder="e.g. arbitration, liability, renewal, risks"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !promptA.trim() || !promptB.trim() || !testInput.trim()}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center space-x-2 transition-all transform active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Dual Comparison...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Live A/B Comparison</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results & Side-by-Side View */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Winner Callout Banner */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Evaluation Winner</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm">
                    {result.winner}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">{result.verdict_reason}</p>
              </div>
            </div>

            {/* PDF / JSON Export Actions */}
            <div className="flex items-center space-x-2 self-end sm:self-center">
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

          {/* Metrics Comparison Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-indigo-400" />
              <span>Comparative Quality Metrics Matrix</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Composite Quality Score */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] font-bold uppercase text-slate-400">Composite Score</div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-bold text-indigo-400">{result.metrics_a.composite_score}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{result.label_a}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-sky-400">{result.metrics_b.composite_score}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{result.label_b}</span>
                  </div>
                </div>
              </div>

              {/* Keyword Coverage */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] font-bold uppercase text-slate-400">Keyword Coverage</div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-bold text-indigo-400">{result.metrics_a.keyword_coverage_pct}%</span>
                    <span className="text-[10px] text-slate-500 block truncate">{result.label_a}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-sky-400">{result.metrics_b.keyword_coverage_pct}%</span>
                    <span className="text-[10px] text-slate-500 block truncate">{result.label_b}</span>
                  </div>
                </div>
              </div>

              {/* Structure Match */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] font-bold uppercase text-slate-400">Structure Match</div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-bold text-indigo-400">{result.metrics_a.structure_match_score}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{result.label_a}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-sky-400">{result.metrics_b.structure_match_score}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{result.label_b}</span>
                  </div>
                </div>
              </div>

              {/* Latency */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] font-bold uppercase text-slate-400">Execution Latency</div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-bold text-indigo-400">{result.latency_a_ms}ms</span>
                    <span className="text-[10px] text-slate-500 block truncate">{result.label_a}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-sky-400">{result.latency_b_ms}ms</span>
                    <span className="text-[10px] text-slate-500 block truncate">{result.label_b}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Outputs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Output A */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-indigo-400">{result.label_a} Output</span>
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <span>{result.metrics_a.word_count} words</span>
                    <span>?</span>
                    <span>~{result.metrics_a.estimated_tokens} tokens</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="font-semibold text-slate-300">Structure Feedback: </span>
                  {result.metrics_a.structure_feedback}
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap h-96 overflow-y-auto leading-relaxed">
                  {result.output_a}
                </pre>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(result.output_a);
                  setCopiedA(true);
                  setTimeout(() => setCopiedA(false), 2000);
                }}
                className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {copiedA ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedA ? 'Copied Output A' : 'Copy Output A'}</span>
              </button>
            </div>

            {/* Output B */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-sky-400">{result.label_b} Output</span>
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <span>{result.metrics_b.word_count} words</span>
                    <span>?</span>
                    <span>~{result.metrics_b.estimated_tokens} tokens</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="font-semibold text-slate-300">Structure Feedback: </span>
                  {result.metrics_b.structure_feedback}
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap h-96 overflow-y-auto leading-relaxed">
                  {result.output_b}
                </pre>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(result.output_b);
                  setCopiedB(true);
                  setTimeout(() => setCopiedB(false), 2000);
                }}
                className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {copiedB ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedB ? 'Copied Output B' : 'Copy Output B'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
