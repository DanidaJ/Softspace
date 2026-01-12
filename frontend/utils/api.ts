// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error('Missing required environment variable: VITE_API_URL must be set');
}

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('supabase_token');
};

// Get user's timezone
const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Timezone': getUserTimezone(),
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============ TYPES ============
export interface ChatSession {
  id: number;
  title: string;
  primary_emotion?: string;
  topics?: string[];
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ChatMessage {
  id: number;
  message: string;
  response: string;
  emotional_tone?: string;
  mood_score?: number;
  sentiment?: string;
  detected_topics?: string[];
  created_at: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  session_id: number;
  emotional_tone?: string;
  emotion_scores?: Record<string, number>;  // Multi-emotion confidence scores
  valence?: number;  // -1.0 to +1.0 (unpleasant to pleasant)
  arousal?: number;  // -1.0 to +1.0 (calm to activated)
  mood_score?: number;
  sentiment?: string;
  detected_topics?: string[];
  needs_support?: boolean;
  crisis_level?: 'none' | 'low' | 'moderate' | 'high' | 'immediate';
  crisis_keywords?: string[];
  model_used: string;
  suggested_goal?: {
    detected_goal: string;
    category: string;
    confidence: string;
    source_message?: string;
  };
}

export interface InsightsData {
  period_days: number;
  average_mood: number | null;
  mood_change?: number;  // Difference from previous week
  average_stress?: 'Low' | 'Medium' | 'High' | null;
  average_energy?: 'Low' | 'Balanced' | 'High' | null;
  total_sessions: number;
  total_sessions_all_time?: number;
  total_messages: number;
  tasks_completed: number;
  top_emotions: { emotion: string; emoji: string; count: number }[];
  top_triggers: { label: string; count: number }[];
  top_topics: { topic: string; count: number }[];
  mood_trend: 'improving' | 'stable' | 'declining' | null;
  notable_day?: string;  // The day that stood out
  daily_insight?: string;
  weekly_pattern?: string;  // Brief pattern description
  is_new_user?: boolean;
  account_age_days?: number;
  has_data?: boolean;
}

export interface TimelineItem {
  date: string;
  day: string;
  mood: number;
  mood_trend?: '↑' | '↓' | '→';
  stress: string;
  stress_trend?: '↑' | '↓' | '→';
  energy?: 'Low' | 'Balanced' | 'High';
  sentiment: string;
  sentiment_trend?: '↑' | '↓' | '→';
  emotion?: string;
  is_notable?: boolean;
}

export interface MoodTrend {
  date: string;
  day: string;
  mood: number;
  stress: string;
  sentiment: string;
  emotion?: string;
}

export interface GrowthPlanData {
  id: string;
  title: string;
  goal?: string;
  focus_area: string;
  week_number: number;
  progress: number;
  is_active: boolean;
  tasks: PlanTaskData[];
}

export interface PlanTaskData {
  id: string;
  plan_id: string;
  day: number;
  title: string;
  description?: string;
  type: string;
  status: 'completed' | 'current' | 'locked';
}

export interface GrowthPlan {
  id: number;
  title: string;
  goal?: string;
  focus_area: string;
  week_number: number;
  progress: number;
  is_active: boolean;
  tasks?: PlanTask[];
}

export interface PlanTask {
  id: number;
  plan_id: number;
  day_number: number;
  title: string;
  description?: string;
  task_type: string;
  status: 'completed' | 'current' | 'locked';
}

export interface JournalEntry {
  id: number;
  content: string;
  prompt_type?: string;
  mood_score?: number;
  detected_emotions?: string[];
  detected_topics?: string[];
  ai_feedback?: string;
  sentiment?: string;
  created_at: string;
}

export interface JournalEntryData {
  id: string;
  prompt: string;
  content: string;
  prompt_type?: string;
  mood_score?: number;
  detected_emotions?: string[];
  ai_analysis?: string;
  sentiment?: string;
  created_at: string;
}

// ============ MOOD API ============
export const moodApi = {
  logMood: async (score: number, energy?: number, stress?: 'Low' | 'Medium' | 'High', triggers?: string, notes?: string) => {
    return apiRequest('/mood/log', {
      method: 'POST',
      body: JSON.stringify({ score, energy, stress, triggers, notes }),
    });
  },

  getHistory: async (limit = 30) => {
    return apiRequest<any[]>(`/mood/history?limit=${limit}`, { method: 'GET' });
  },

  getTrends: async (days = 7) => {
    return apiRequest<{ average: number; trend: string; count: number }>(`/mood/trends?days=${days}`, { method: 'GET' });
  },
};

// ============ JOURNAL API ============
export const journalApi = {
  createEntry: async (prompt: string, content: string, prompt_type?: string, mood_score?: number) => {
    return apiRequest<JournalEntryData>('/journal/', {
      method: 'POST',
      body: JSON.stringify({ prompt, content, prompt_type, mood_score }),
    });
  },

  getEntries: async (limit = 20) => {
    return apiRequest<JournalEntryData[]>(`/journal/?limit=${limit}`, { method: 'GET' });
  },

  getEntry: async (id: number) => {
    return apiRequest<JournalEntryData>(`/journal/${id}`, { method: 'GET' });
  },

  getPromptSuggestions: async (mood?: string) => {
    const params = mood ? `?mood=${mood}` : '';
    return apiRequest<{ prompts: any[]; suggested: string }>(`/journal/prompts/suggestions${params}`, { method: 'GET' });
  },
};

// ============ TASKS API ============
export const tasksApi = {
  create: async (title: string, description?: string, task_type?: string, due_date?: Date, priority?: 'low' | 'medium' | 'high') => {
    return apiRequest('/tasks/', {
      method: 'POST',
      body: JSON.stringify({ 
        title, 
        description,
        task_type,
        due_date: due_date?.toISOString(),
        priority 
      }),
    });
  },

  getAll: async (completed = false) => {
    return apiRequest<any[]>(`/tasks/?completed=${completed}`, { method: 'GET' });
  },

  complete: async (taskId: number) => {
    return apiRequest(`/tasks/${taskId}/complete`, { method: 'PATCH' });
  },

  delete: async (taskId: number) => {
    return apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
  },
};

// ============ CHAT API ============
export const chatApi = {
  // Sessions
  getSessions: async (limit = 20) => {
    return apiRequest<ChatSession[]>(`/chat/sessions?limit=${limit}`, { method: 'GET' });
  },

  createSession: async () => {
    return apiRequest<{ success: boolean; session_id: number }>('/chat/sessions', { method: 'POST' });
  },

  getSessionMessages: async (sessionId: number, limit = 50) => {
    return apiRequest<ChatMessage[]>(`/chat/sessions/${sessionId}/messages?limit=${limit}`, { method: 'GET' });
  },

  deleteSession: async (sessionId: number) => {
    return apiRequest(`/chat/sessions/${sessionId}`, { method: 'DELETE' });
  },

  getSessionReflection: async (sessionId: number) => {
    return apiRequest<{
      success: boolean;
      session_id: number;
      summary: string;
      reflection: string;
      emotions: string[];
      themes: string[];
    }>(`/chat/sessions/${sessionId}/reflection`, { method: 'GET' });
  },

  // Chat
  sendMessage: async (message: string, model_used: 'gemini' | 'groq' = 'gemini', session_id?: number) => {
    return apiRequest<ChatResponse>('/chat/', {
      method: 'POST',
      body: JSON.stringify({ message, model_used, session_id }),
    });
  },

  generateTasks: async (goal: string, emotion_context?: string) => {
    return apiRequest<{ success: boolean; tasks: any[]; message: string }>('/chat/generate-tasks', {
      method: 'POST',
      body: JSON.stringify({ goal, emotion_context }),
    });
  },

  getHistory: async (limit = 50, sessionId?: number) => {
    const params = sessionId ? `?limit=${limit}&session_id=${sessionId}` : `?limit=${limit}`;
    return apiRequest<ChatMessage[]>(`/chat/history${params}`, { method: 'GET' });
  },

  getContext: async () => {
    return apiRequest<any>('/chat/context', { method: 'GET' });
  },
};

// ============ INSIGHTS API ============
export const insightsApi = {
  getInsights: async (days = 7) => {
    return apiRequest<InsightsData>(`/insights/?days=${days}`, { method: 'GET' });
  },

  getTimeline: async (days = 7) => {
    return apiRequest<TimelineItem[]>(`/insights/timeline?days=${days}`, { method: 'GET' });
  },

  getEmotionSummary: async (days = 7) => {
    return apiRequest<any>(`/insights/emotions/summary?days=${days}`, { method: 'GET' });
  },

  getDailyInsight: async () => {
    return apiRequest<any>('/insights/daily', { method: 'GET' });
  },

  // Growth Plans
  generatePlan: async (request: {
    focus_area: string;
    duration_days?: number;
    user_state?: 'struggling' | 'neutral' | 'thriving';
    context?: {
      average_mood?: number | null;
      mood_trend?: string | null;
      top_emotions?: string[];
      top_topics?: string[];
      top_triggers?: string[];
      total_sessions?: number;
      patterns?: string[];
    } | null;
  }) => {
    return apiRequest<GrowthPlanData>('/insights/plans', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  getPlans: async (activeOnly = true) => {
    return apiRequest<GrowthPlanData[]>(`/insights/plans?active_only=${activeOnly}`, { method: 'GET' });
  },

  getPlanDetails: async (planId: string) => {
    return apiRequest<GrowthPlanData>(`/insights/plans/${planId}`, { method: 'GET' });
  },

  completeTask: async (planId: string, taskId: string) => {
    return apiRequest(`/insights/plans/${planId}/tasks/${taskId}`, { method: 'PATCH' });
  },
};

// ============ ACCOUNT API ============
export interface ExportData {
  export_date: string;
  user_id: string;
  data: {
    chat_sessions: any[];
    journal_entries: any[];
    mood_logs: any[];
    tasks: any[];
    growth_plans: any[];
    therapeutic_goals: any[];
    emotion_logs: any[];
  };
}

export const accountApi = {
  deleteAccount: async () => {
    return apiRequest<{ message: string }>('/api/account', { method: 'DELETE' });
  },

  exportData: async () => {
    return apiRequest<ExportData>('/api/account/export', { method: 'GET' });
  },
};

// Export all
export const api = {
  mood: moodApi,
  journal: journalApi,
  tasks: tasksApi,
  chat: chatApi,
  insights: insightsApi,
  account: accountApi,
};

export default api;
