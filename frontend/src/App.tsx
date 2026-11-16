import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PromptGenerator } from './components/PromptGenerator';
import { PromptOptimizer } from './components/PromptOptimizer';
import { ABTesting } from './components/ABTesting';
import { Dashboard } from './components/Dashboard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ConfigStatus } from './types';
import { api, getCustomApiKey } from './api/client';
import { CheckCircle2, AlertCircle, Info, X, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'optimizer' | 'ab-testing' | 'dashboard'>('generator');
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(Boolean(getCustomApiKey()));

  // Cross-module transition states
  const [optimizerInitialPrompt, setOptimizerInitialPrompt] = useState('');
  const [optimizerInitialGoal, setOptimizerInitialGoal] = useState('');
  const [abInitialPromptA, setAbInitialPromptA] = useState('');
  const [abInitialPromptB, setAbInitialPromptB] = useState('');
  const [abInitialLabelA, setAbInitialLabelA] = useState('Variant A');
  const [abInitialLabelB, setAbInitialLabelB] = useState('Variant B');

  // Global Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchConfig = async () => {
    try {
      const data = await api.getConfig();
      setConfig(data);
    } catch {
      // Backend might still be starting or in offline mode
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSendToOptimizer = (promptText: string, goal?: string) => {
    setOptimizerInitialPrompt(promptText);
    if (goal) setOptimizerInitialGoal(goal);
    setActiveTab('optimizer');
    showToast('Loaded your prompt into the Optimizer!', 'info');
  };

  const handleSendToABTesting = (promptA: string, labelA: string = 'Candidate A') => {
    setAbInitialPromptA(promptA);
    setAbInitialLabelA(labelA);
    setActiveTab('ab-testing');
    showToast('Sent prompt into A/B Test as Variant A!', 'info');
  };

  const handleSendBothToABTesting = (
    promptA: string,
    promptB: string,
    labelA: string = 'Original draft',
    labelB: string = 'Improved version'
  ) => {
    setAbInitialPromptA(promptA);
    setAbInitialPromptB(promptB);
    setAbInitialLabelA(labelA);
    setAbInitialLabelB(labelB);
    setActiveTab('ab-testing');
    showToast('Sent both versions into A/B Testing!', 'info');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2D42] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
        hasCustomKey={hasCustomKey}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {activeTab === 'generator' && (
          <PromptGenerator
            onSendToOptimizer={handleSendToOptimizer}
            onSendToABTesting={handleSendToABTesting}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'optimizer' && (
          <PromptOptimizer
            initialPrompt={optimizerInitialPrompt}
            initialGoal={optimizerInitialGoal}
            onSendToABTesting={handleSendBothToABTesting}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'ab-testing' && (
          <ABTesting
            initialPromptA={abInitialPromptA}
            initialPromptB={abInitialPromptB}
            initialLabelA={abInitialLabelA}
            initialLabelB={abInitialLabelB}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            onLoadPromptToOptimizer={handleSendToOptimizer}
            onLoadPromptToAB={handleSendBothToABTesting}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Warm, Friendly Footer */}
      <footer className="mt-auto border-t border-[#EFEBE4] bg-white/70 py-6 text-center text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5">
            <span>Made with care by</span>
            <span className="font-semibold text-[#2B2D42]">Shubhi Aggarwal</span>
            <span className="text-rose-500">❤️</span>
          </div>
          <span className="text-[#8E90A6]">
            PromptCraft AI &bull; A calm, helpful writing tool for better prompts
          </span>
        </div>
      </footer>

      {/* Settings / API Key Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onKeySaved={() => {
          setHasCustomKey(Boolean(getCustomApiKey()));
          fetchConfig();
          showToast('Key settings updated successfully!', 'success');
        }}
      />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-card border backdrop-blur-md text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-[#8E90A6] hover:text-[#2B2D42] p-0.5 rounded-lg hover:bg-black/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
