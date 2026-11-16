import React from 'react';
import {
  Sparkles,
  Sliders,
  SplitSquareVertical,
  BookOpen,
  Key,
  CheckCircle2,
  HelpCircle,
  HeartHandshake
} from 'lucide-react';
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
  const isKeyActive = Boolean(hasCustomKey || config?.has_anthropic_key);

  const navItems: Array<{
    id: 'generator' | 'optimizer' | 'ab-testing' | 'dashboard';
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'generator', label: 'Generator', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'optimizer', label: 'Optimizer', icon: <Sliders className="w-4 h-4" /> },
    { id: 'ab-testing', label: 'A/B Testing', icon: <SplitSquareVertical className="w-4 h-4" /> },
    { id: 'dashboard', label: 'History & Analytics', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EFEBE4] shadow-[0_1px_3px_rgba(43,45,66,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Friendly Tagline */}
          <div
            className="flex items-center space-x-3.5 cursor-pointer group"
            onClick={() => setActiveTab('generator')}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 border border-indigo-200/60 flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
              <span className="text-xl" role="img" aria-label="sparkles">✨</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-xl text-[#2B2D42] tracking-tight">
                  PromptCraft AI
                </span>
                <span className="hidden sm:inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                  Friendly prompt helper
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-normal">
                Write better prompts, without the guesswork.
              </p>
            </div>
          </div>

          {/* Navigation Pill Menu */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-[#FAF7F2] p-1.5 rounded-2xl border border-[#EFEBE4]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-soft font-semibold'
                      : 'text-[#64748B] hover:text-[#2B2D42] hover:bg-white/60'
                  }`}
                >
                  <span className={isActive ? 'text-indigo-600' : 'text-[#8E90A6]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mode Badge & Settings Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Friendly Mode Chip */}
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all hover:shadow-soft ${
                isKeyActive
                  ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200/70 hover:bg-emerald-100/60'
                  : 'bg-amber-50/90 text-amber-800 border-amber-200/70 hover:bg-amber-100/60'
              }`}
              title={
                isKeyActive
                  ? 'Live AI mode: Connected to Claude API'
                  : 'Offline helper mode: Smart local heuristics — click to add your Claude key'
              }
            >
              <span className={`w-2 h-2 rounded-full ${isKeyActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-semibold">
                {isKeyActive ? 'Live AI mode' : 'Offline helper mode'}
              </span>
              <Key className="w-3 h-3 text-[#8E90A6]" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between py-2.5 border-t border-[#EFEBE4] overflow-x-auto space-x-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-soft'
                    : 'text-[#64748B] hover:text-[#2B2D42] bg-[#FAF7F2]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
