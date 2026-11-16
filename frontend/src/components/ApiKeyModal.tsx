import React, { useState } from 'react';
import { Key, X, CheckCircle2, AlertTriangle, ShieldCheck, Loader2, Sparkles, Trash2 } from 'lucide-react';
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
      setStatus({ type: 'error', message: 'Please paste your Anthropic API key first.' });
      return;
    }
    setTesting(true);
    setStatus(null);
    try {
      const res = await api.testApiKey(keyInput.trim());
      if (res.valid) {
        setStatus({ type: 'success', message: 'All set! Your Claude API key is working perfectly.' });
      } else {
        setStatus({ type: 'error', message: res.error || 'Hmm, that key looks invalid. Please double-check it.' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Could not verify the key right now. Please try again.' });
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
    setStatus({ type: 'info', message: 'Key cleared. PromptCraft will now use the friendly offline helper mode.' });
    onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/30 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white border border-[#EFEBE4] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-card-hover relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8E90A6] hover:text-[#2B2D42] p-1.5 rounded-xl hover:bg-[#FAF7F2] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-[#2B2D42] tracking-tight">
              Connect your Claude API Key
            </h3>
            <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
              Add your personal key to use live Claude 3.5 Sonnet. If you prefer to stay offline, our built-in helper works completely free.
            </p>
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2">
              Your API Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EFEBE4] text-[#2B2D42] text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 font-mono transition-all placeholder:text-[#8E90A6]"
            />
            <p className="text-xs text-[#8E90A6] mt-1.5">
              Stored only inside your browser's private local storage. Never sent to any 3rd party.
            </p>
          </div>

          {/* Status Message */}
          {status && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 border ${
                status.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : status.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-800'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span className="font-medium leading-relaxed">{status.message}</span>
            </div>
          )}

          {/* Friendly Offline Mode Reassurance Box */}
          <div className="bg-[#FAF7F2] border border-[#EFEBE4] rounded-2xl p-4 text-xs text-[#64748B] space-y-1.5">
            <div className="flex items-center text-[#2B2D42] font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
              Free Offline Helper Mode
            </div>
            <p className="leading-relaxed">
              Without an API key, PromptCraft automatically runs in offline mode using our rule-based heuristic engine. You can generate, optimize, and test prompts anytime!
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testing || !keyInput.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F0EBE1] text-[#2B2D42] border border-[#EFEBE4] disabled:opacity-50 transition-all flex items-center space-x-1.5"
              >
                {testing && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />}
                <span>{testing ? 'Checking key...' : 'Test connection'}</span>
              </button>
              {keyInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all"
            >
              Save &amp; Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ApiKeyModal;
