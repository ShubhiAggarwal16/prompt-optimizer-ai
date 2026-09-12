import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Sliders,
  SplitSquareVertical,
  TrendingUp,
  Search,
  Trash2,
  Star,
  Download,
  FileText,
  FileJson,
  Eye,
  RefreshCw,
  Award,
  Layers,
  BarChart3,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  PromptHistoryItem,
  OptimizationHistoryItem,
  ABTestHistoryItem,
  AnalyticsSummary,
} from '../types';
import { api } from '../api/client';

interface DashboardProps {
  onLoadPromptToOptimizer: (prompt: string, goal?: string) => void;
  onLoadPromptToAB: (promptA: string, promptB: string, labelA?: string, labelB?: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onLoadPromptToOptimizer,
  onLoadPromptToAB,
  onShowToast,
}) => {
  const [activeHistoryTab, setActiveHistoryTab] = useState<'prompts' | 'optimizations' | 'ab-tests'>('prompts');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [prompts, setPrompts] = useState<PromptHistoryItem[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationHistoryItem[]>([]);
  const [abTests, setABTests] = useState<ABTestHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptHistoryItem | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsData, promptsData, optsData, abData] = await Promise.all([
        api.getAnalyticsDashboard(),
        api.getPromptHistory({ category: categoryFilter !== 'All' ? categoryFilter : undefined, search: searchQuery || undefined }),
        api.getOptimizationHistory(),
        api.getABTestHistory(),
      ]);
      setAnalytics(analyticsData);
      setPrompts(promptsData);
      setOptimizations(optsData);
      setABTests(abData);
    } catch (err: any) {
      onShowToast(err.message || 'Could not load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      const res = await api.toggleFavoritePrompt(id);
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_favorite: res.is_favorite } : p))
      );
      onShowToast(res.is_favorite ? 'Added to favorites!' : 'Removed from favorites', 'info');
    } catch (err: any) {
      onShowToast('Could not update favorite', 'error');
    }
  };

  const handleDeleteItem = async (type: 'prompt' | 'optimization' | 'ab-test', id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.deleteHistoryItem(type, id);
      if (type === 'prompt') setPrompts((prev) => prev.filter((p) => p.id !== id));
      if (type === 'optimization') setOptimizations((prev) => prev.filter((o) => o.id !== id));
      if (type === 'ab-test') setABTests((prev) => prev.filter((a) => a.id !== id));
      onShowToast('Record deleted.', 'info');
    } catch (err: any) {
      onShowToast('Could not delete record', 'error');
    }
  };

  const handleExportSingleOptPDF = async (id: number) => {
    try {
      const data = await api.getSingleOptimization(id);
      await api.downloadOptimizationPDF(data);
      onShowToast('Optimization PDF downloaded!', 'success');
    } catch (err: any) {
      onShowToast('Export failed', 'error');
    }
  };

  const handleExportSingleABPDF = async (id: number) => {
    try {
      const data = await api.getSingleABTest(id);
      await api.downloadABTestPDF(data);
      onShowToast('A/B Test PDF downloaded!', 'success');
    } catch (err: any) {
      onShowToast('Export failed', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Module 4: Analytics & Prompt Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Prompt Intelligence Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Audit prompt iterations, historical rubric scores, technique frequencies, and past benchmark runs.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Prompts Generated</div>
              <div className="text-2xl font-extrabold text-white mt-0.5">{analytics.total_prompts_generated}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Avg Score Improvement</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">+{analytics.avg_improvement_pct}%</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Optimizations Conducted</div>
              <div className="text-2xl font-extrabold text-white mt-0.5">{analytics.total_optimizations}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <SplitSquareVertical className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">A/B Test Runs</div>
              <div className="text-2xl font-extrabold text-white mt-0.5">{analytics.total_ab_tests}</div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Techniques & Distribution Breakdown */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Technique Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Prompt Engineering Technique Usage</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.technique_distribution).map(([tech, count]) => {
                const total = Math.max(analytics.total_prompts_generated, 1);
                const pct = Math.min(100, Math.round((count / total) * 100));
                return (
                  <div key={tech} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{tech}</span>
                      <span className="text-slate-400 font-mono">{count} uses ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>Domain Category Breakdown</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {Object.entries(analytics.category_distribution).map(([cat, count]) => (
                <div key={cat} className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-200">{cat}</span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Data Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Navigation & Search Header */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* History Sub-tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveHistoryTab('prompts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeHistoryTab === 'prompts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Generated Prompts ({prompts.length})
            </button>
            <button
              onClick={() => setActiveHistoryTab('optimizations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeHistoryTab === 'optimizations' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Optimizations ({optimizations.length})
            </button>
            <button
              onClick={() => setActiveHistoryTab('ab-tests')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeHistoryTab === 'ab-tests' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              A/B Test Runs ({abTests.length})
            </button>
          </div>

          {/* Search & Category Filter */}
          {activeHistoryTab === 'prompts' && (
            <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts or tasks..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Search
              </button>
            </form>
          )}
        </div>

        {/* Tab 1: Generated Prompts Table */}
        {activeHistoryTab === 'prompts' && (
          <div className="overflow-x-auto">
            {prompts.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No saved prompts found. Generate some prompts to see them listed here.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Fav</th>
                    <th className="p-4">Title & Technique</th>
                    <th className="p-4">Task Requirement</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {prompts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleFavorite(p.id)}
                          className={`p-1 rounded-md transition-colors ${
                            p.is_favorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">{p.prompt_title}</div>
                        <div className="text-[11px] text-indigo-400 mt-0.5">{p.technique}</div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-300">
                        {p.task_description}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPrompt(p)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px]"
                          title="View Full Prompt"
                        >
                          <Eye className="w-3 h-3 inline mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => onLoadPromptToOptimizer(p.prompt_text, `Refine ${p.prompt_title}`)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 text-[11px]"
                          title="Optimize in Module 2"
                        >
                          Optimize
                        </button>
                        <button
                          onClick={() => handleDeleteItem('prompt', p.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Optimization History Table */}
        {activeHistoryTab === 'optimizations' && (
          <div className="overflow-x-auto">
            {optimizations.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No optimization history records yet. Optimize a prompt to see its track record.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Baseline Prompt</th>
                    <th className="p-4">Score Delta</th>
                    <th className="p-4">Improvement</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {optimizations.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono text-slate-500">#{o.id}</td>
                      <td className="p-4 max-w-sm truncate text-slate-200 font-mono">
                        {o.original_prompt}
                      </td>
                      <td className="p-4">
                        <span className="text-slate-400">{o.original_overall_score}</span>
                        <span className="text-slate-500 mx-1.5">?</span>
                        <span className="font-bold text-emerald-400">{o.overall_score}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          +{o.improvement_pct}%
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleExportSingleOptPDF(o.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px]"
                        >
                          <FileText className="w-3 h-3 inline mr-1 text-rose-400" />
                          PDF
                        </button>
                        <button
                          onClick={() => onLoadPromptToAB(o.original_prompt, o.improved_prompt, 'Original', 'Optimized')}
                          className="px-2.5 py-1 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/30 text-[11px]"
                        >
                          A/B Test
                        </button>
                        <button
                          onClick={() => handleDeleteItem('optimization', o.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: A/B Tests Table */}
        {activeHistoryTab === 'ab-tests' && (
          <div className="overflow-x-auto">
            {abTests.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No A/B test runs yet. Run a comparison between two prompt variants to view test records.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Comparison Title</th>
                    <th className="p-4">Winner Variant</th>
                    <th className="p-4">Latency (A / B)</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {abTests.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono text-slate-500">#{a.id}</td>
                      <td className="p-4 font-semibold text-slate-200">{a.title}</td>
                      <td className="p-4">
                        <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
                          {a.winner}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {a.latency_a_ms}ms / {a.latency_b_ms}ms
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleExportSingleABPDF(a.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px]"
                        >
                          <FileText className="w-3 h-3 inline mr-1 text-rose-400" />
                          PDF
                        </button>
                        <button
                          onClick={() => handleDeleteItem('ab-test', a.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Single Prompt View Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedPrompt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {selectedPrompt.technique}
              </span>
              <h3 className="text-lg font-bold text-white mt-1.5">{selectedPrompt.prompt_title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedPrompt.task_description}</p>
            </div>

            {selectedPrompt.system_prompt && (
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">System Prompt</label>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap">
                  {selectedPrompt.system_prompt}
                </pre>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Prompt Template</label>
              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                {selectedPrompt.prompt_text}
              </pre>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedPrompt.prompt_text);
                  onShowToast('Prompt copied!', 'success');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                Copy Prompt
              </button>
              <button
                onClick={() => {
                  onLoadPromptToOptimizer(selectedPrompt.prompt_text);
                  setSelectedPrompt(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Open in Optimizer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
