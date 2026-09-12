import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PromptGenerator } from './components/PromptGenerator';
import { PromptOptimizer } from './components/PromptOptimizer';
import { ABTesting } from './components/ABTesting';
import { Dashboard } from './components/Dashboard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ConfigStatus } from './types';
import { api, getCustomApiKey } from './api/client';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

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
    showToast('Loaded prompt into Optimizer!', 'info');
  };

  const handleSendToABTesting = (promptA: string, labelA: string = 'Candidate A') => {
    setAbInitialPromptA(promptA);
    setAbInitialLabelA(labelA);
    setActiveTab('ab-testing');
    showToast('Loaded prompt into A/B Test Variant A!', 'info');
  };

  const handleSendBothToABTesting = (
    promptA: string,
    promptB: string,
    labelA: string = 'Original',
    labelB: string = 'Optimized'
  ) => {
    setAbInitialPromptA(promptA);
    setAbInitialPromptB(promptB);
    setAbInitialLabelA(labelA);
    setAbInitialLabelB(labelB);
    setActiveTab('ab-testing');
    showToast('Loaded both variants into A/B Testing!', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
        hasCustomKey={hasCustomKey}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI-Powered Prompt Generation and Optimization System ? Built with React, Tailwind & FastAPI</span>
          <span className="text-slate-600">Anthropic Claude & Heuristic Engine Integrated</span>
        </div>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onKeySaved={() => {
          setHasCustomKey(Boolean(getCustomApiKey()));
          fetchConfig();
          showToast('API Key settings updated!', 'success');
        }}
      />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md text-xs font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white p-0.5"
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
