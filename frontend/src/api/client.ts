import {
  GeneratePromptResponse,
  OptimizePromptResponse,
  ABTestResponse,
  PromptHistoryItem,
  OptimizationHistoryItem,
  ABTestHistoryItem,
  AnalyticsSummary,
  ConfigStatus
} from '../types';

const API_BASE = '/api';

export function getCustomApiKey(): string | null {
  return localStorage.getItem('anthropic_api_key') || null;
}

export function setCustomApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem('anthropic_api_key', key.trim());
  } else {
    localStorage.removeItem('anthropic_api_key');
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const customKey = getCustomApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: API request failed`;
    try {
      const err = await response.json();
      console.error(`[API Error] ${options.method || 'GET'} ${API_BASE}${url}`, {
        status: response.status,
        statusText: response.statusText,
        body: err,
      });
      errorDetail = err.detail || err.error || err.message || JSON.stringify(err);
    } catch {
      const text = await response.text().catch(() => '');
      console.error(`[API Error] ${options.method || 'GET'} ${API_BASE}${url}`, {
        status: response.status,
        statusText: response.statusText,
        body: text,
      });
      errorDetail = text || response.statusText || `HTTP ${response.status} Error`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Config
  getConfig: () => request<ConfigStatus>('/config'),
  testApiKey: (api_key: string) =>
    request<{ valid: boolean; model?: string; message?: string; error?: string }>('/config/test-key', {
      method: 'POST',
      body: JSON.stringify({ api_key }),
    }),

  // Generator
  generatePrompts: (data: { task_description: string; category?: string; tone?: string; target_model?: string }) =>
    request<GeneratePromptResponse>('/generate', {
      method: 'POST',
      body: JSON.stringify({ ...data, api_key: getCustomApiKey() }),
    }),
  saveCustomPrompt: (data: {
    task_description: string;
    category?: string;
    technique: string;
    prompt_title: string;
    prompt_text: string;
    system_prompt?: string;
    explanation?: string;
  }) =>
    request<{ status: string; id: number; message: string }>('/generate/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Optimizer
  optimizePrompt: (data: { prompt_text: string; goal?: string; target_model?: string }) =>
    request<OptimizePromptResponse>('/optimize', {
      method: 'POST',
      body: JSON.stringify({ ...data, api_key: getCustomApiKey() }),
    }),

  // A/B Testing
  runABTest: (data: {
    title?: string;
    label_a?: string;
    label_b?: string;
    prompt_a: string;
    prompt_b: string;
    test_input: string;
    target_keywords?: string[];
    expected_structure?: string;
  }) =>
    request<ABTestResponse>('/ab-test/run', {
      method: 'POST',
      body: JSON.stringify({ ...data, api_key: getCustomApiKey() }),
    }),

  // History
  getPromptHistory: (params?: { category?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.search) q.append('search', params.search);
    return request<PromptHistoryItem[]>(`/history/prompts?${q.toString()}`);
  },
  getOptimizationHistory: () => request<OptimizationHistoryItem[]>('/history/optimizations'),
  getSingleOptimization: (id: number) => request<OptimizePromptResponse>(`/history/optimizations/${id}`),
  getABTestHistory: () => request<ABTestHistoryItem[]>('/history/ab-tests'),
  getSingleABTest: (id: number) => request<ABTestResponse>(`/history/ab-tests/${id}`),
  deleteHistoryItem: (type: 'prompt' | 'optimization' | 'ab-test', id: number) =>
    request<{ status: string; message: string }>(`/history/${type}/${id}`, { method: 'DELETE' }),
  toggleFavoritePrompt: (id: number) =>
    request<{ status: string; id: number; is_favorite: boolean }>(`/history/prompts/${id}/favorite`, { method: 'PATCH' }),

  // Analytics
  getAnalyticsDashboard: () => request<AnalyticsSummary>('/analytics/dashboard'),

  // Export handlers
  downloadOptimizationPDF: async (data: OptimizePromptResponse) => {
    const res = await fetch(`${API_BASE}/export/optimization/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt_optimization_report_${data.id || 'export'}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  downloadABTestPDF: async (data: ABTestResponse) => {
    const res = await fetch(`${API_BASE}/export/ab-test/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab_test_report_${data.id || 'export'}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  downloadJSON: (filename: string, data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};
