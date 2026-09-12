import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  SplitSquareVertical,
  Sliders,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ArrowRight,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { DomainCategory, PromptCandidate, GeneratePromptResponse } from '../types';
import { api } from '../api/client';

interface PromptGeneratorProps {
  onSendToOptimizer: (promptText: string, goal?: string) => void;
  onSendToABTesting: (promptA: string, labelA: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const CATEGORIES: DomainCategory[] = [
  'General',
  'Legal',
  'Coding',
  'Marketing',
  'Customer Support',
  'Data Analysis',
  'Education',
  'Creative Writing',
];

const PRESET_IDEAS = [
  {
    category: 'Legal',
    label: 'Legal Terms of Service Analyzer',
    prompt: 'Summarize complex legal terms of service for ordinary consumers, highlighting arbitration clauses, data privacy rights, and renewal traps.',
  },
  {
    category: 'Coding',
    label: 'Strict Code Review & Test Generation',
    prompt: 'Review Python codebase for memory leaks, type annotations, and generate comprehensive pytest unit test cases with edge coverage.',
  },
  {
    category: 'Marketing',
    label: 'High-Converting SaaS Landing Copy',
    prompt: 'Generate persuasive B2B SaaS landing page copy focusing on value propositions, objection handling, and actionable CTAs.',
  },
  {
    category: 'Data Analysis',
    label: 'Executive Financial Trend Synthesis',
    prompt: 'Analyze raw quarterly financial metrics, extract key revenue anomalies, and generate an executive synthesis with bulleted risks.',
  },
];

export const PromptGenerator: React.FC<PromptGeneratorProps> = ({
  onSendToOptimizer,
  onSendToABTesting,
  onShowToast,
}) => {
  const [taskDescription, setTaskDescription] = useState('');
  const [category, setCategory] = useState<DomainCategory>('General');
  const [tone, setTone] = useState('Professional');
  const [targetModel, setTargetModel] = useState('claude-3-5-sonnet');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratePromptResponse | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSystem, setExpandedSystem] = useState<Record<string, boolean>>({});

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskDescription.trim()) {
      onShowToast('Please enter a task description.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await api.generatePrompts({
        task_description: taskDescription.trim(),
        category,
        tone,
        target_model: targetModel,
      });
      setResult(data);
      onShowToast(`Generated 3 candidate prompt variants via ${data.generation_mode === 'live_api' ? 'Claude API' : 'Smart Heuristic Engine'}!`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast('Prompt copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToHistory = async (candidate: PromptCandidate) => {
    try {
      await api.saveCustomPrompt({
        task_description: taskDescription,
        category,
        technique: candidate.technique,
        prompt_title: candidate.title,
        prompt_text: candidate.prompt_text,
        system_prompt: candidate.system_prompt,
        explanation: candidate.why_it_works,
      });
      onShowToast('Saved candidate to history database!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Could not save prompt', 'error');
    }
  };

  const toggleSystemPrompt = (id: string) => {
    setExpandedSystem((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Module 1: Multi-Technique Generation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI-Powered Prompt Generator
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Specify a high-level task goal and generate 3 production-grade prompt variants built on proven prompt engineering principles:
            <span className="text-indigo-300 font-semibold"> Role Framing</span>,
            <span className="text-sky-300 font-semibold"> Few-Shot Exemplars</span>, and
            <span className="text-amber-300 font-semibold"> Chain-of-Thought with Format Delimiters</span>.
          </p>
        </div>
      </div>

      {/* Input Configuration Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Task Description Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <span>Task Objective / Requirement</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className="text-xs text-slate-500 font-mono">{taskDescription.length} characters</span>
            </div>
            <textarea
              rows={4}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="e.g. Summarize legal contracts for non-lawyers, identifying liability clauses, renewal risks, and termination conditions in structured markdown..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Quick Preset Starters */}
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-slate-300">Quick Starters (Click to test):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_IDEAS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTaskDescription(preset.prompt);
                    setCategory(preset.category as DomainCategory);
                  }}
                  className="text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 text-xs transition-all group"
                >
                  <div className="font-semibold text-slate-300 group-hover:text-indigo-300 truncate">
                    {preset.label}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{preset.prompt}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Domain Category, Tone & Target Model Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Domain Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DomainCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Tone & Style</span>
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Professional">Professional & Authoritative</option>
                <option value="Technical">Technical & Rigorous</option>
                <option value="Concise">Concise & Direct (Executive)</option>
                <option value="Step-by-Step">Step-by-Step & Analytical</option>
                <option value="Conversational">Empathetic & Conversational</option>
              </select>
            </div>

            {/* Target Model */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Model Architecture</span>
              </label>
              <select
                value={targetModel}
                onChange={(e) => setTargetModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Recommended)</option>
                <option value="claude-3-haiku">Claude 3 Haiku (High Speed)</option>
                <option value="claude-3-opus">Claude 3 Opus (Deep Reasoning)</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !taskDescription.trim()}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all transform active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Engineering Candidates...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate 3 Candidate Prompts</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Candidate Output Cards */}
      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-white">Generated Candidate Variants</h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {result.category} Domain
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Engine: <span className="font-semibold text-indigo-400">{result.generation_mode === 'live_api' ? 'Anthropic Claude API' : 'Smart Heuristic Engine'}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {result.candidates.map((candidate, idx) => {
              const techniqueColors = [
                { badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30', border: 'border-indigo-500/20' },
                { badge: 'bg-sky-950/80 text-sky-300 border-sky-500/30', border: 'border-sky-500/20' },
                { badge: 'bg-amber-950/80 text-amber-300 border-amber-500/30', border: 'border-amber-500/20' },
              ][idx % 3];

              return (
                <div
                  key={candidate.id}
                  className={`bg-slate-900 border ${techniqueColors.border} rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all`}
                >
                  <div className="space-y-4">
                    {/* Technique Badge & Title */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${techniqueColors.badge}`}>
                          {candidate.technique}
                        </span>
                        <span className="text-xs font-mono text-slate-500">Variant #{idx + 1}</span>
                      </div>
                      <h3 className="font-bold text-base text-white">{candidate.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{candidate.description}</p>
                    </div>

                    {/* Why It Works & Best For Callout */}
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1.5">
                      <div className="text-slate-300">
                        <span className="font-semibold text-indigo-400">Why it works: </span>
                        {candidate.why_it_works}
                      </div>
                      <div className="text-slate-400">
                        <span className="font-semibold text-slate-300">Best for: </span>
                        {candidate.best_for}
                      </div>
                    </div>

                    {/* Collapsible System Prompt */}
                    {candidate.system_prompt && (
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleSystemPrompt(candidate.id)}
                          className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-200 py-1"
                        >
                          <span>System Prompt Framing</span>
                          {expandedSystem[candidate.id] ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {expandedSystem[candidate.id] && (
                          <pre className="mt-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono whitespace-pre-wrap">
                            {candidate.system_prompt}
                          </pre>
                        )}
                      </div>
                    )}

                    {/* Main Prompt Text Body */}
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1 block">
                        Prompt Template Body
                      </label>
                      <div className="relative">
                        <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                          {candidate.prompt_text}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(candidate.id, candidate.prompt_text)}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      >
                        {copiedId === candidate.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveToHistory(candidate)}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Save</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onSendToOptimizer(candidate.prompt_text, `Refine variant ${candidate.title}`)}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 transition-colors"
                        title="Send this candidate into Prompt Optimizer"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Optimize</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSendToABTesting(candidate.prompt_text, candidate.title)}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-500/30 transition-colors"
                        title="Send this candidate into A/B Testing"
                      >
                        <SplitSquareVertical className="w-3.5 h-3.5" />
                        <span>A/B Test</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
