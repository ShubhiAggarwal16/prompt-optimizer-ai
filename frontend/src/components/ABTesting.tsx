import React, { useState } from 'react';
import {
  SplitSquareVertical,
  Play,
  Trophy,
  Gauge,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileJson,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  Sparkles,
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
    name: 'Rental Agreement Clause',
    structure: 'markdown_headers',
    keywords: ['arbitration', 'liability', 'termination', 'consumer'],
    text: `Section 14.2 Dispute Resolution: Any controversy or claim arising out of or relating to this Contract, or the breach thereof, shall be settled by arbitration administered by the American Arbitration Association in accordance with its Commercial Arbitration Rules. You explicitly waive the right to participate in any class action lawsuit or class-wide arbitration. The renewal terms require 60-day written notice prior to automatic 12-month extension.`,
  },
  {
    name: 'Customer Support Inquiry',
    structure: 'bullet_list',
    keywords: ['refund', 'delay', 'resolution', 'compensation'],
    text: `Subject: URGENT - Broken laptop received on order #99281. I ordered the pro workstation 3 weeks ago for my client presentation tomorrow, and the box arrived damaged with a shattered screen. Your phone line disconnected twice and nobody responded to my ticket from yesterday. I demand an immediate replacement overnight or a full refund including express shipping fees!`,
  },
  {
    name: 'Python Code Refactor',
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
  initialLabelA = 'Prompt A (Draft)',
  initialLabelB = 'Prompt B (Optimized)',
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
      onShowToast('Please provide text for both Prompt A and Prompt B to compare.', 'error');
      return;
    }
    if (!testInput.trim()) {
      onShowToast('Please provide a sample input for both prompts to test against.', 'error');
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
      onShowToast(`Comparison complete! The winner is ${data.winner}`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Hmm, the test comparison failed. Please try again.', 'error');
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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 sm:p-8 shadow-soft">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold mb-3">
            <SplitSquareVertical className="w-3.5 h-3.5 text-teal-600" />
            <span>A/B Benchmark Testing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2B2D42] tracking-tight">
            Put two prompts to the test
          </h1>
          <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
            Run two prompt variations side by side with the same sample input, compare how they perform across quality, keyword accuracy, structure, and speed, and see which one does the best job.
          </p>
        </div>
      </div>

      {/* Dual Prompt Configuration & Shared Input */}
      <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 sm:p-8 shadow-card space-y-6">
        <form onSubmit={handleRunTest} className="space-y-6">
          {/* Dual Prompt Editors: Side-by-Side Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prompt A */}
            <div className="bg-[#FAF7F2] border border-[#EFEBE4] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <input
                    type="text"
                    value={labelA}
                    onChange={(e) => setLabelA(e.target.value)}
                    className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-[#EFEBE4] focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  />
                </div>
                <span className="text-xs text-[#94A3B8] font-mono">{promptA.length} chars</span>
              </div>
              <textarea
                rows={6}
                value={promptA}
                onChange={(e) => setPromptA(e.target.value)}
                placeholder="Paste Prompt Variant A here..."
                className="w-full px-3.5 py-3 rounded-xl bg-white border border-[#EFEBE4] text-[#2B2D42] text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/40 font-mono transition-all placeholder:text-[#94A3B8] leading-relaxed"
              />
            </div>

            {/* Prompt B */}
            <div className="bg-[#FAF7F2] border border-[#EFEBE4] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <input
                    type="text"
                    value={labelB}
                    onChange={(e) => setLabelB(e.target.value)}
                    className="text-xs font-bold text-teal-800 bg-white px-2.5 py-1 rounded-lg border border-[#EFEBE4] focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                  />
                </div>
                <span className="text-xs text-[#94A3B8] font-mono">{promptB.length} chars</span>
              </div>
              <textarea
                rows={6}
                value={promptB}
                onChange={(e) => setPromptB(e.target.value)}
                placeholder="Paste Prompt Variant B here..."
                className="w-full px-3.5 py-3 rounded-xl bg-white border border-[#EFEBE4] text-[#2B2D42] text-xs focus:outline-none focus:ring-2 focus:ring-teal-400/40 font-mono transition-all placeholder:text-[#94A3B8] leading-relaxed"
              />
            </div>
          </div>

          {/* Shared Test Input */}
          <div className="space-y-3 pt-4 border-t border-[#EFEBE4]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-[#2B2D42]">
                Shared sample input for both prompts <span className="text-rose-500">*</span>
              </label>

              {/* Sample presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#64748B] flex items-center">
                  <Lightbulb className="w-3 h-3 text-amber-500 mr-1" />
                  Try a starter:
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
                    className="px-2.5 py-1 rounded-xl bg-[#FAF7F2] hover:bg-white text-[#2B2D42] text-[11px] font-medium border border-[#EFEBE4] transition-colors"
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
              placeholder="Enter the sample text or question that both prompts will evaluate..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EFEBE4] text-[#2B2D42] text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/40 font-sans transition-all placeholder:text-[#94A3B8] leading-relaxed"
            />
          </div>

          {/* Metric Constraints Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#2B2D42] mb-1.5">
                Expected output format
              </label>
              <select
                value={expectedStructure}
                onChange={(e) => setExpectedStructure(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE4] text-[#2B2D42] text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              >
                <option value="markdown_headers">Markdown section headers (## Overview, ## Details)</option>
                <option value="bullet_list">Bulleted list items (- Point)</option>
                <option value="numbered_steps">Numbered sequential steps (1. Step)</option>
                <option value="json">Valid JSON schema format</option>
                <option value="any">Standard text / general paragraphs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2D42] mb-1.5">
                Key terms to look for (comma-separated)
              </label>
              <input
                type="text"
                value={targetKeywordsInput}
                onChange={(e) => setTargetKeywordsInput(e.target.value)}
                placeholder="For example: arbitration, liability, renewal"
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE4] text-[#2B2D42] text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/40 font-sans"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !promptA.trim() || !promptB.trim() || !testInput.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-soft disabled:opacity-50 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running comparison side by side...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run A/B benchmark</span>
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
          <div className="bg-white border border-[#EFEBE4] rounded-3xl p-6 sm:p-7 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shrink-0">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Clear Winner</span>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-sm">
                    {result.winner}
                  </span>
                </div>
                <p className="text-sm text-[#2B2D42] mt-1.5 max-w-2xl leading-relaxed font-medium">
                  {result.verdict_reason}
                </p>
              </div>
            </div>

            {/* PDF / JSON Export Actions */}
            <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleExportPDF}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] shadow-sm transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <span>Export PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] shadow-sm transition-colors"
              >
                <FileJson className="w-3.5 h-3.5 text-amber-500" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Metrics Comparison Matrix */}
          <div className="bg-white border border-[#EFEBE4] rounded-3xl p-6 sm:p-7 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-[#2B2D42] flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-indigo-600" />
              <span>Side-by-side performance breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Quality Score */}
              <div className="bg-[#FAF7F2] border border-[#EFEBE4] rounded-2xl p-4 space-y-2">
                <div className="text-[11px] font-bold uppercase text-[#64748B]">Quality Score</div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-indigo-700">{result.metrics_a.composite_score}</span>
                    <span className="text-[10px] text-[#94A3B8] block truncate max-w-[80px]">{result.label_a}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-teal-700">{result.metrics_b.composite_score}</span>
                    <span className="text-[10px] text-[#94A3B8] block truncate max-w-[80px]">{result.label_b}</span>
                  </div>
                </div>
              </div>

              {/* Keyword Coverage */}
              <div className="bg-[#FAF7F2] border border-[#EFEBE4] rounded-2xl p-4 space-y-2">
                <div className="text-[11px] font-bold uppercase text-[#64748B]">Keyword Coverage</div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-indigo-700">{result.metrics_a.keyword_coverage_pct}%</span>
                    <span className="text-[10px] text-[#94A3B8] block truncate max-w-[80px]">{result.label_a}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-teal-700">{result.metrics_b.keyword_coverage_pct}%</span>
                    <span className="text-[10px] text-[#94A3B8] block truncate max-w-[80px]">{result.label_b}</span>
                  </div>
                </div>
              </div>

              {/* Structure Match */}
              <div className="bg-[#FAF7F2] border border-[#EFEBE4] rounded-2xl p-4 space-y-2">
                <div className="text-[11px] font-bold uppercase text-[#64748B]">Structure Match</div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-indigo-700">{result.metrics_a.structure_match_score}</span>
                    <span className="text-[10px] text-[#94A3B8] block truncate max-w-[80px]">{result.label_a}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-teal-700">{result.metrics_b.structure_match_score}</span>
                    <span className="text-[10px] text-[#94A3B8] block truncate max-w-[80px]">{result.label_b}</span>
                  </div>
                </div>
              </div>

              {/* Latency */}
              <div className="bg-[#FAF7F2] border border-[#EFEBE4] rounded-2xl p-4 space-y-2">
                <div className="text-[11px] font-bold uppercase text-[#64748B]">Response Time</div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-indigo-700">{result.latency_a_ms}ms</span>
                    <span className="text-[10px] text-[#94A3B8] block truncate max-w-[80px]">{result.label_a}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-teal-700">{result.latency_b_ms}ms</span>
                    <span className="text-[10px] text-[#94A3B8] block truncate max-w-[80px]">{result.label_b}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Outputs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Output A */}
            <div className="bg-white border border-[#EFEBE4] rounded-3xl p-5 sm:p-6 shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE4]">
                  <span className="text-xs font-bold text-indigo-700">{result.label_a} Result</span>
                  <div className="flex items-center space-x-2 text-xs font-mono text-[#64748B]">
                    <span>{result.metrics_a.word_count} words</span>
                    <span>•</span>
                    <span>~{result.metrics_a.estimated_tokens} tokens</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#64748B] bg-[#FAF7F2] p-3 rounded-xl border border-[#EFEBE4] leading-relaxed">
                  <span className="font-bold text-[#2B2D42]">Format Notes: </span>
                  {result.metrics_a.structure_feedback}
                </div>

                <pre className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFEBE4] text-xs text-[#2B2D42] font-mono whitespace-pre-wrap h-80 overflow-y-auto leading-relaxed">
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
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] shadow-sm transition-colors"
              >
                {copiedA ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedA ? 'Copied output!' : `Copy ${result.label_a} Output`}</span>
              </button>
            </div>

            {/* Output B */}
            <div className="bg-white border border-[#EFEBE4] rounded-3xl p-5 sm:p-6 shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE4]">
                  <span className="text-xs font-bold text-teal-800">{result.label_b} Result</span>
                  <div className="flex items-center space-x-2 text-xs font-mono text-[#64748B]">
                    <span>{result.metrics_b.word_count} words</span>
                    <span>•</span>
                    <span>~{result.metrics_b.estimated_tokens} tokens</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#64748B] bg-[#FAF7F2] p-3 rounded-xl border border-[#EFEBE4] leading-relaxed">
                  <span className="font-bold text-[#2B2D42]">Format Notes: </span>
                  {result.metrics_b.structure_feedback}
                </div>

                <pre className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFEBE4] text-xs text-[#2B2D42] font-mono whitespace-pre-wrap h-80 overflow-y-auto leading-relaxed">
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
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] shadow-sm transition-colors"
              >
                {copiedB ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedB ? 'Copied output!' : `Copy ${result.label_b} Output`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
