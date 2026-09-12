import React, { useState } from 'react';
import { Key, X, CheckCircle2, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { api, getCustomApiKey, setCustomApiKey } from '../api/client';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [keyInput, setKeyInput] = useState(getCustomApiKey() || '');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!keyInput.trim()) {
      setStatus({ type: 'error', message: 'Please enter an Anthropic API Key.' });
      return;
    }
    setTesting(true);
    setStatus(null);
    try {
      const res = await api.testApiKey(keyInput.trim());
      if (res.valid) {
        setStatus({ type: 'success', message: res.message || 'Key verified successfully with Claude API!' });
      } else {
        setStatus({ type: 'error', message: res.error || 'Invalid API Key.' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Verification failed.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setCustomApiKey(keyInput);
    onKeySaved();
    onClose();
  };

  const handleClear = () => {
    setKeyInput('');
    setCustomApiKey('');
    setStatus({ type: 'info', message: 'Key removed. System will use backend env or smart heuristic engine.' });
    onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Anthropic Claude API Key</h3>
            <p className="text-xs text-slate-400">Connect your Claude API key for live generation calls</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              API Key <span className="text-slate-500 font-normal">(sk-ant-api03-...)</span>
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-mono transition-colors"
            />
          </div>

          {status && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
                status.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                  : status.type === 'error'
                  ? 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
                  : 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-300'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
              Built-in Intelligent Fallback
            </div>
            <p>
              If no API key is provided, the application runs on a high-fidelity prompt engineering heuristic engine with realistic rubric scores and completions.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testing || !keyInput.trim()}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5"
              >
                {testing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Test Key</span>
              </button>
              {keyInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-colors"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
