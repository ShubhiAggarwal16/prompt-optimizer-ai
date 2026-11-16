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
  FileText,
  Eye,
  RefreshCw,
  Layers,
  BarChart3,
  X,
  Heart,
  ArrowRight,
  FolderOpen,
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
      onShowToast(err.message || 'Could not load your activity data right now.', 'error');
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
      onShowToast(res.is_favorite ? 'Saved to your favorites!' : 'Removed from favorites', 'info');
    } catch (err: any) {
      onShowToast('Could not update favorites right now.', 'error');
    }
  };

  const handleDeleteItem = async (type: 'prompt' | 'optimization' | 'ab-test', id: number) => {
    if (!confirm('Are you sure you want to remove this item from your library?')) return;
    try {
      await api.deleteHistoryItem(type, id);
      if (type === 'prompt') setPrompts((prev) => prev.filter((p) => p.id !== id));
      if (type === 'optimization') setOptimizations((prev) => prev.filter((o) => o.id !== id));
      if (type === 'ab-test') setABTests((prev) => prev.filter((a) => a.id !== id));
      onShowToast('Item removed.', 'info');
    } catch (err: any) {
      onShowToast('Could not delete this item.', 'error');
    }
  };

  const handleExportSingleOptPDF = async (id: number) => {
    try {
      const data = await api.getSingleOptimization(id);
      await api.downloadOptimizationPDF(data);
      onShowToast('Downloaded your optimization PDF report!', 'success');
    } catch (err: any) {
      onShowToast('Could not export PDF report.', 'error');
    }
  };

  const handleExportSingleABPDF = async (id: number) => {
    try {
      const data = await api.getSingleABTest(id);
      await api.downloadABTestPDF(data);
      onShowToast('Downloaded your A/B test PDF report!', 'success');
    } catch (err: any) {
      onShowToast('Could not export PDF report.', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-xs font-semibold mb-3">
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
              <span>Prompt Library & History</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2B2D42] tracking-tight">
              Your prompt library & activity
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Browse your saved prompts, revisit past optimizations, and review your benchmark test results all in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-[#FAF7F2] hover:bg-white text-[#2B2D42] border border-[#EFEBE4] shadow-sm transition-all shrink-0 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-[#64748B]'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#EFEBE4] rounded-3xl p-5 shadow-soft flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">Prompts written</div>
              <div className="text-2xl font-extrabold text-[#2B2D42] mt-0.5">{analytics.total_prompts_generated}</div>
            </div>
          </div>

          <div className="bg-white border border-[#EFEBE4] rounded-3xl p-5 shadow-soft flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">Average score boost</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">+{analytics.avg_improvement_pct}%</div>
            </div>
          </div>

          <div className="bg-white border border-[#EFEBE4] rounded-3xl p-5 shadow-soft flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">Optimizations done</div>
              <div className="text-2xl font-extrabold text-[#2B2D42] mt-0.5">{analytics.total_optimizations}</div>
            </div>
          </div>

          <div className="bg-white border border-[#EFEBE4] rounded-3xl p-5 shadow-soft flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600">
              <SplitSquareVertical className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">A/B tests run</div>
              <div className="text-2xl font-extrabold text-[#2B2D42] mt-0.5">{analytics.total_ab_tests}</div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Techniques & Distribution Breakdown */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Technique Distribution */}
          <div className="bg-white border border-[#EFEBE4] rounded-3xl p-6 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-[#2B2D42] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Prompt techniques you've used</span>
            </h3>
            <div className="space-y-3 pt-1">
              {Object.entries(analytics.technique_distribution).length === 0 ? (
                <p className="text-xs text-[#94A3B8]">No technique data yet.</p>
              ) : (
                Object.entries(analytics.technique_distribution).map(([tech, count]) => {
                  const total = Math.max(analytics.total_prompts_generated, 1);
                  const pct = Math.min(100, Math.round((count / total) * 100));
                  return (
                    <div key={tech} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#2B2D42] font-semibold">{tech}</span>
                        <span className="text-[#64748B] font-mono text-[11px]">{count} times ({pct}%)</span>
                      </div>
                      <div className="w-full bg-[#FAF7F2] h-2 rounded-full overflow-hidden border border-[#EFEBE4]">
                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white border border-[#EFEBE4] rounded-3xl p-6 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-[#2B2D42] flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <span>Topics and areas</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(analytics.category_distribution).length === 0 ? (
                <p className="text-xs text-[#94A3B8]">No categories yet.</p>
              ) : (
                Object.entries(analytics.category_distribution).map(([cat, count]) => (
                  <div key={cat} className="flex items-center space-x-2 px-3 py-2 rounded-2xl bg-[#FAF7F2] border border-[#EFEBE4]">
                    <span className="text-xs font-semibold text-[#2B2D42]">{cat}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Data Table Card */}
      <div className="bg-white border border-[#EFEBE4] rounded-3xl shadow-card overflow-hidden">
        {/* Table Navigation & Search Header */}
        <div className="p-5 sm:p-6 border-b border-[#EFEBE4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* History Sub-tabs */}
          <div className="flex items-center space-x-1 bg-[#FAF7F2] p-1 rounded-2xl border border-[#EFEBE4]">
            <button
              type="button"
              onClick={() => setActiveHistoryTab('prompts')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeHistoryTab === 'prompts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#64748B] hover:text-[#2B2D42]'
              }`}
            >
              Saved Prompts ({prompts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveHistoryTab('optimizations')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeHistoryTab === 'optimizations' ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#64748B] hover:text-[#2B2D42]'
              }`}
            >
              Optimizations ({optimizations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveHistoryTab('ab-tests')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeHistoryTab === 'ab-tests' ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#64748B] hover:text-[#2B2D42]'
              }`}
            >
              A/B Tests ({abTests.length})
            </button>
          </div>

          {/* Search & Category Filter */}
          {activeHistoryTab === 'prompts' && (
            <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts by keyword..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFEBE4] text-[#2B2D42] text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-white text-xs font-semibold text-[#2B2D42] border border-[#EFEBE4] hover:bg-[#FAF7F2] transition-colors shadow-sm"
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
              <div className="p-12 text-center space-y-2">
                <FolderOpen className="w-8 h-8 text-[#94A3B8] mx-auto stroke-1" />
                <p className="text-sm font-semibold text-[#2B2D42]">Nothing here yet.</p>
                <p className="text-xs text-[#64748B]">Your saved prompts will show up here once you write some.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#64748B] font-semibold border-b border-[#EFEBE4]">
                  <tr>
                    <th className="p-4 w-12 text-center">Fav</th>
                    <th className="p-4">Prompt Title & Technique</th>
                    <th className="p-4">Task Goal</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEBE4]">
                  {prompts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(p.id)}
                          className={`p-1 rounded-md transition-colors ${
                            p.is_favorite ? 'text-rose-500' : 'text-[#CBD5E1] hover:text-[#94A3B8]'
                          }`}
                          title={p.is_favorite ? 'Favorite prompt' : 'Add to favorites'}
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#2B2D42]">{p.prompt_title}</div>
                        <div className="text-[11px] text-indigo-600 mt-0.5">{p.technique}</div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-[#64748B]">
                        {p.task_description}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] text-[11px] font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4 text-[#94A3B8] whitespace-nowrap">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedPrompt(p)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] text-[11px] font-medium shadow-sm"
                          title="View Full Prompt"
                        >
                          <Eye className="w-3 h-3 inline mr-1 text-[#64748B]" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => onLoadPromptToOptimizer(p.prompt_text, `Refine ${p.prompt_title}`)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-medium"
                          title="Optimize in Optimizer"
                        >
                          Optimize
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('prompt', p.id)}
                          className="p-1 text-[#94A3B8] hover:text-rose-600 transition-colors"
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
              <div className="p-12 text-center space-y-2">
                <FolderOpen className="w-8 h-8 text-[#94A3B8] mx-auto stroke-1" />
                <p className="text-sm font-semibold text-[#2B2D42]">No past optimizations yet.</p>
                <p className="text-xs text-[#64748B]">Optimize any draft in the Optimizer tab to see your history here.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#64748B] font-semibold border-b border-[#EFEBE4]">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Original Prompt Snippet</th>
                    <th className="p-4">Score Change</th>
                    <th className="p-4">Net Improvement</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEBE4]">
                  {optimizations.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="p-4 font-mono text-[#94A3B8]">#{o.id}</td>
                      <td className="p-4 max-w-sm truncate text-[#2B2D42] font-mono">
                        {o.original_prompt}
                      </td>
                      <td className="p-4">
                        <span className="text-[#64748B]">{o.original_overall_score}</span>
                        <span className="text-[#94A3B8] mx-1.5">→</span>
                        <span className="font-bold text-emerald-600">{o.overall_score}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          +{o.improvement_pct}%
                        </span>
                      </td>
                      <td className="p-4 text-[#94A3B8] whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleExportSingleOptPDF(o.id)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] text-[11px] font-medium shadow-sm"
                        >
                          <FileText className="w-3 h-3 inline mr-1 text-rose-500" />
                          PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => onLoadPromptToAB(o.original_prompt, o.improved_prompt, 'Original Draft', 'Polished Version')}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-medium"
                        >
                          A/B Test
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('optimization', o.id)}
                          className="p-1 text-[#94A3B8] hover:text-rose-600 transition-colors"
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
              <div className="p-12 text-center space-y-2">
                <FolderOpen className="w-8 h-8 text-[#94A3B8] mx-auto stroke-1" />
                <p className="text-sm font-semibold text-[#2B2D42]">No A/B tests run yet.</p>
                <p className="text-xs text-[#64748B]">Benchmark two prompts side by side in the A/B Testing tab to record your results.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#64748B] font-semibold border-b border-[#EFEBE4]">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Test Title</th>
                    <th className="p-4">Winning Prompt</th>
                    <th className="p-4">Response Time (A / B)</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEBE4]">
                  {abTests.map((a) => (
                    <tr key={a.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="p-4 font-mono text-[#94A3B8]">#{a.id}</td>
                      <td className="p-4 font-bold text-[#2B2D42]">{a.title}</td>
                      <td className="p-4">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {a.winner}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[#64748B]">
                        {a.latency_a_ms}ms / {a.latency_b_ms}ms
                      </td>
                      <td className="p-4 text-[#94A3B8] whitespace-nowrap">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleExportSingleABPDF(a.id)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] text-[11px] font-medium shadow-sm"
                        >
                          <FileText className="w-3 h-3 inline mr-1 text-rose-500" />
                          PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('ab-test', a.id)}
                          className="p-1 text-[#94A3B8] hover:text-rose-600 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-[#EFEBE4] rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-card relative space-y-4">
            <button
              type="button"
              onClick={() => setSelectedPrompt(null)}
              className="absolute top-5 right-5 text-[#94A3B8] hover:text-[#2B2D42] p-1 rounded-xl hover:bg-[#FAF7F2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {selectedPrompt.technique}
              </span>
              <h3 className="text-lg font-bold font-serif text-[#2B2D42] mt-2">{selectedPrompt.prompt_title}</h3>
              <p className="text-xs text-[#64748B] mt-0.5">{selectedPrompt.task_description}</p>
            </div>

            {selectedPrompt.system_prompt && (
              <div>
                <label className="text-xs font-bold text-[#2B2D42] mb-1.5 block">System Guidance</label>
                <pre className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFEBE4] text-xs text-[#64748B] font-mono whitespace-pre-wrap leading-relaxed">
                  {selectedPrompt.system_prompt}
                </pre>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[#2B2D42] mb-1.5 block">Full Prompt Text</label>
              <pre className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFEBE4] text-xs text-[#2B2D42] font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                {selectedPrompt.prompt_text}
              </pre>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#EFEBE4]">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedPrompt.prompt_text);
                  onShowToast('Prompt copied to clipboard!', 'success');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF7F2] text-[#2B2D42] border border-[#EFEBE4] shadow-sm transition-colors"
              >
                Copy prompt
              </button>
              <button
                type="button"
                onClick={() => {
                  onLoadPromptToOptimizer(selectedPrompt.prompt_text);
                  setSelectedPrompt(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-soft transition-colors"
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
