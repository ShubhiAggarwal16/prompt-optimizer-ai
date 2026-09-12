import React from 'react';
import { Sparkles, Sliders, SplitSquareVertical, LayoutDashboard, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { ConfigStatus } from '../types';

interface NavbarProps {
  activeTab: 'generator' | 'optimizer' | 'ab-testing' | 'dashboard';
  setActiveTab: (tab: 'generator' | 'optimizer' | 'ab-testing' | 'dashboard') => void;
  config: ConfigStatus | null;
  onOpenApiKeyModal: () => void;
  hasCustomKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  onOpenApiKeyModal,
  hasCustomKey,
}) => {
  const isKeyActive = hasCustomKey || config?.has_anthropic_key;

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  PromptCraft AI
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Claude Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Prompt Generation, Optimization & A/B Testing</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'generator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('optimizer')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'optimizer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Optimizer</span>
            </button>

            <button
              onClick={() => setActiveTab('ab-testing')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ab-testing'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>A/B Testing</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>History & Analytics</span>
            </button>
          </nav>

          {/* Settings / API Key Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition-colors"
              title="Configure Anthropic Claude API Key"
            >
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Claude API</span>
              {isKeyActive ? (
                <span className="flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                  Live API
                </span>
              ) : (
                <span className="flex items-center text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                  <AlertCircle className="w-2.5 h-2.5 mr-1" />
                  Smart Engine
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
