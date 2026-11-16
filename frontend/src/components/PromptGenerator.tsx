import React, { useState, useEffect } from 'react';
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
  Lightbulb,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Info
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
    category: 'Legal' as DomainCategory,
    label: 'Rental Agreement Summary',
    prompt: 'Explain a standard apartment rental agreement in simple words for a first-time renter, pointing out common traps like security deposit deductions and renewal rules.',
  },
  {
    category: 'Coding' as DomainCategory,
    label: 'Clean Code Review & Tests',
    prompt: 'Review a Python function for edge-case bugs, type hints, and write clean unit tests using pytest.',
  },
  {
    category: 'Marketing' as DomainCategory,
    label: 'Friendly Product Launch Email',
    prompt: 'Draft a warm, conversational product announcement email for a small craft coffee subscription box.',
  },
  {
    category: 'Data Analysis' as DomainCategory,
    label: 'Plain-English Sales Summary',
    prompt: 'Summarize quarterly sales numbers in plain language for team members who do not have a finance background.',
  },
];

const LOADING_MESSAGES = [
  'Thinking it through...',
  'Writing your 3 prompts...',
  'Polishing the phrasing...',
  'Almost ready with your prompts...',
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
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [result, setResult] = useState<GeneratePromptResponse | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [expandedSystem, setExpandedSystem] = useState<Record<string, boolean>>({});

  // Cycle friendly loading messages
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskDescription.trim()) {
      onShowToast('Please tell us what you need help with first!', 'error');
      return;
    }

    setLoading(true);
    setLoadingMsgIndex(0);
    try {
      const data = await api.generatePrompts({
        task_description: taskDescription.trim(),
        category,
        tone,
        target_model: targetModel,
      });
      setResult(data);
      onShowToast('Done! Here are your 3 prompts.', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Hmm, something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast('Copied to your clipboard!', 'success');
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
      setSavedIds((prev) => ({ ...prev, [candidate.id]: true }));
      onShowToast('Saved to your collection!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Could not save prompt right now.', 'error');
    }
  };

  const toggleSystemPrompt = (id: string) => {
    setExpandedSystem((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Friendly Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <span>✨ Step 1 of 3</span>
          <span>&bull;</span>
          <span>Prompt Generator</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#2B2D42] tracking-tight">
          What do you need help with today?
        </h1>
        <p className="text-base text-[#64748B] leading-relaxed">
          Tell us your goal in a sentence or two. We will write three different prompts you can use right away.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-[#EFEBE4] rounded-3xl p-6 sm:p-8 shadow-card">
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Prompt Task Input */}
          <div>
            <label
              htmlFor="taskDescription"
              className="block font-semibold text-sm text-[#2B2D42] mb-2"
            >
              Describe your task
            </label>
            <textarea
              id="taskDescription"
              rows={4}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="For example: Explain a rental agreement in simple words for a first time renter, highlighting key renewal traps."
              className="w-full px-4 py-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFEBE4] text-[#2B2D42] text-sm sm:text-base focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-[#8E90A6] leading-relaxed resize-y"
            />
          </div>

          {/* Quick Starter Suggestions */}
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#64748B] mb-2.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Not sure where to begin? Try one of these:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_IDEAS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTaskDescription(preset.prompt);
                    setCategory(preset.category);
                  }}
                  className="text-left p-3 rounded-2xl bg-[#FAF7F2] hover:bg-indigo-50/60 border border-[#EFEBE4] hover:border-indigo-200 text-xs transition-all group"
                >
                  <span className="font-semibold text-[#2B2D42] group-hover:text-indigo-700 block">
                    {preset.label}
                  </span>
                  <span className="text-[#64748B] line-clamp-1 mt-0.5">
                    {preset.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dropdown Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                What area is this for?
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DomainCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE4] text-xs sm:text-sm font-medium text-[#2B2D42] focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                How should it sound?
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE4] text-xs sm:text-sm font-medium text-[#2B2D42] focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
              >
                <option value="Professional">Professional &amp; Clear</option>
                <option value="Conversational">Warm &amp; Conversational</option>
                <option value="Concise">Concise &amp; Direct</option>
                <option value="Technical">Technical &amp; Rigorous</option>
                <option value="Creative">Creative &amp; Engaging</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                Which AI will use it?
              </label>
              <select
                value={targetModel}
                onChange={(e) => setTargetModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE4] text-xs sm:text-sm font-medium text-[#2B2D42] focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
              >
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Recommended)</option>
                <option value="claude-3-haiku">Claude 3 Haiku (Fast)</option>
                <option value="claude-3-opus">Claude 3 Opus (In-depth)</option>
              </select>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={loading || !taskDescription.trim()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{LOADING_MESSAGES[loadingMsgIndex]}</span>
                </>
              ) : (
                <>
                  <span>Write my 3 prompts</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Candidates Display */}
      {result && (
        <div className="space-y-6 animate-fade-in pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl text-[#2B2D42]">
                Here are your 3 prompt candidates
              </h2>
              <p className="text-sm text-[#64748B] mt-0.5">
                Each prompt uses a different proven strategy. Pick the one that fits your task best.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Generated via {result.generation_mode === 'live_api' ? 'Live Claude 3.5' : 'Offline Helper'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {result.candidates.map((cand, idx) => {
              const isCopied = copiedId === cand.id;
              const isSaved = Boolean(savedIds[cand.id]);
              const isSystemOpen = Boolean(expandedSystem[cand.id]);

              // Friendly badges for each technique
              const badgeColors = [
                'bg-indigo-50 text-indigo-700 border-indigo-100',
                'bg-teal-50 text-teal-700 border-teal-100',
                'bg-amber-50 text-amber-800 border-amber-100',
              ];

              return (
                <div
                  key={cand.id}
                  className="bg-white border border-[#EFEBE4] hover:border-indigo-200 rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-card-hover transition-all space-y-5"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${badgeColors[idx % 3]}`}>
                          Variant {idx + 1}: {cand.technique}
                        </span>
                        <span className="text-xs text-[#8E90A6]">
                          Best for: {cand.best_for}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-[#2B2D42]">
                        {cand.title}
                      </h3>
                    </div>

                    {/* Quick Card Top Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleCopy(cand.id, cand.prompt_text)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#FAF7F2] hover:bg-stone-100 text-[#2B2D42] border border-[#EFEBE4] transition-all flex items-center space-x-1.5"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSaveToHistory(cand)}
                        disabled={isSaved}
                        className={`p-2 rounded-xl text-xs font-medium border transition-all ${
                          isSaved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                            : 'bg-[#FAF7F2] hover:bg-stone-100 text-[#64748B] hover:text-[#2B2D42] border-[#EFEBE4]'
                        }`}
                        title={isSaved ? 'Saved to history' : 'Save this candidate'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-emerald-600' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Why this works - Friendly Plain Explanation */}
                  <div className="bg-[#FAF7F2] border border-[#EFEBE4] rounded-2xl p-3.5 text-xs text-[#64748B] flex items-start space-x-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2B2D42] font-semibold">Why this works: </strong>
                      <span>{cand.why_it_works}</span>
                    </div>
                  </div>

                  {/* System Prompt Accordion (if present) */}
                  {cand.system_prompt && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSystemPrompt(cand.id)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <span>{isSystemOpen ? 'Hide system instructions' : 'View system instructions'}</span>
                        {isSystemOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {isSystemOpen && (
                        <div className="mt-2 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs font-mono text-indigo-900 leading-relaxed">
                          {cand.system_prompt}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prompt Text Display Box */}
                  <div className="relative group/box">
                    <pre className="p-4 rounded-2xl bg-[#F8F5EE] border border-[#EFEBE4] text-[#2B2D42] text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                      {cand.prompt_text}
                    </pre>
                  </div>

                  {/* Action Bar: Send to Optimizer or A/B Testing */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EFEBE4]">
                    <span className="text-xs text-[#8E90A6]">
                      Ready to test or refine this prompt?
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => onSendToOptimizer(cand.prompt_text, `Polish prompt for ${category}`)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] hover:border-indigo-300 transition-all flex items-center space-x-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Send to Optimizer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSendToABTesting(cand.prompt_text, cand.title)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] hover:border-indigo-300 transition-all flex items-center space-x-1.5"
                      >
                        <SplitSquareVertical className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Compare in A/B Test</span>
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
export default PromptGenerator;
