import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { DailyTask } from '../types';
import { api, GrowthPlanData, InsightsData } from '../utils/api';

interface GrowthPlanProps {
  onClose?: () => void;
  onStartTask: (task: DailyTask) => void;
}

// Focus area categories with colors - includes both improvement AND positive enhancement areas
const FOCUS_AREAS = [
  { id: 'sleep', label: 'Sleep', description: 'Improve sleep quality and habits', color: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300', type: 'improvement' },
  { id: 'anxiety', label: 'Anxiety', description: 'Manage anxious thoughts and feelings', color: 'bg-amber-500/20 border-amber-500/40 text-amber-300', type: 'improvement' },
  { id: 'stress', label: 'Stress', description: 'Build stress resilience', color: 'bg-rose-500/20 border-rose-500/40 text-rose-300', type: 'improvement' },
  { id: 'mood', label: 'Mood', description: 'Stabilize and improve mood', color: 'bg-purple-500/20 border-purple-500/40 text-purple-300', type: 'improvement' },
  { id: 'self-care', label: 'Self-Care', description: 'Develop consistent self-care routines', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', type: 'both' },
  { id: 'relationships', label: 'Relationships', description: 'Strengthen connections with others', color: 'bg-pink-500/20 border-pink-500/40 text-pink-300', type: 'both' },
  { id: 'mindfulness', label: 'Mindfulness', description: 'Stay present and grounded', color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300', type: 'both' },
  { id: 'confidence', label: 'Confidence', description: 'Build self-esteem and confidence', color: 'bg-orange-500/20 border-orange-500/40 text-orange-300', type: 'both' },
  // Positive enhancement areas
  { id: 'gratitude', label: 'Gratitude', description: 'Deepen appreciation and positive outlook', color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300', type: 'enhancement' },
  { id: 'growth', label: 'Personal Growth', description: 'Continue expanding your potential', color: 'bg-teal-500/20 border-teal-500/40 text-teal-300', type: 'enhancement' },
  { id: 'creativity', label: 'Creativity', description: 'Nurture creative expression', color: 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300', type: 'enhancement' },
  { id: 'purpose', label: 'Purpose', description: 'Explore meaning and direction', color: 'bg-sky-500/20 border-sky-500/40 text-sky-300', type: 'enhancement' },
];

// Duration options
const DURATION_OPTIONS = [
  { days: 3, label: '3 days', description: 'Quick focus sprint' },
  { days: 5, label: '5 days', description: 'Weekday commitment' },
  { days: 7, label: '7 days', description: 'Full week journey' },
  { days: 14, label: '14 days', description: 'Deep habit building' },
];

type ViewMode = 'loading' | 'choice' | 'manual' | 'ai-analysis' | 'ai-confirm' | 'plan';
type UserState = 'struggling' | 'neutral' | 'thriving';

interface PatternAnalysis {
  suggested_focus: string;
  confidence: string;
  userState: UserState;
  patterns: {
    topic: string;
    count: number;
    insight: string;
  }[];
  summary: string;
  averageMood: number | null;
}

export const GrowthPlan: React.FC<GrowthPlanProps> = ({ onClose, onStartTask }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('loading');
  const [plan, setPlan] = useState<GrowthPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Manual creation state
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState('');
  const [planDuration, setPlanDuration] = useState(7); // Default 7 days
  
  // AI analysis state
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const plans = await api.insights.getPlans();
      if (plans.length > 0) {
        setPlan(plans[0]);
        setViewMode('plan');
      } else {
        setViewMode('choice');
      }
    } catch (err) {
      console.error('Failed to load plan:', err);
      setViewMode('choice');
    } finally {
      setLoading(false);
    }
  };

  const analyzePatterns = async () => {
    try {
      setViewMode('ai-analysis');
      setGenerating(true);
      
      // Get insights data
      const insightsData = await api.insights.getInsights(14); // 2 weeks of data
      setInsights(insightsData);
      
      // Determine user's emotional state
      const avgMood = insightsData.average_mood;
      let userState: UserState = 'neutral';
      
      if (avgMood !== null && avgMood !== undefined) {
        if (avgMood >= 7) {
          userState = 'thriving';
        } else if (avgMood <= 4) {
          userState = 'struggling';
        }
      }
      
      // Also check mood trend
      if (insightsData.mood_trend === 'improving') {
        // If improving, lean toward neutral/thriving
        if (userState === 'struggling') userState = 'neutral';
      } else if (insightsData.mood_trend === 'declining') {
        // If declining, lean toward struggling/neutral
        if (userState === 'thriving') userState = 'neutral';
      }
      
      // Analyze patterns from the data
      const patterns: PatternAnalysis['patterns'] = [];
      
      // Extract topic patterns with actual counts
      if (insightsData.top_topics && insightsData.top_topics.length > 0) {
        insightsData.top_topics.slice(0, 3).forEach((topic) => {
          const topicName = typeof topic === 'string' ? topic : (topic as any).topic || 'unknown';
          const topicCount = typeof topic === 'object' ? (topic as any).count || 1 : 1;
          patterns.push({
            topic: topicName,
            count: topicCount,
            insight: topicCount > 3 
              ? `You've mentioned "${topicName}" ${topicCount} times - this seems important to you`
              : `You've been thinking about ${topicName}`
          });
        });
      }
      
      // Add trigger patterns if available
      if (insightsData.top_triggers && insightsData.top_triggers.length > 0) {
        insightsData.top_triggers.slice(0, 2).forEach((trigger) => {
          const triggerLabel = typeof trigger === 'string' ? trigger : (trigger as any).label || 'unknown';
          const triggerCount = typeof trigger === 'object' ? (trigger as any).count || 1 : 1;
          if (triggerCount >= 2) {
            patterns.push({
              topic: triggerLabel,
              count: triggerCount,
              insight: `"${triggerLabel}" has come up ${triggerCount} times as something affecting you`
            });
          }
        });
      }
      
      // Extract emotion patterns and determine focus
      let suggestedFocus = 'mindfulness';
      
      if (insightsData.top_emotions && insightsData.top_emotions.length > 0) {
        const topEmotion = insightsData.top_emotions[0];
        const emotionLabel = typeof topEmotion === 'string' ? topEmotion : (topEmotion as any).emotion || 'neutral';
        
        // Different mapping based on user state
        if (userState === 'thriving') {
          // For thriving users, suggest enhancement areas
          const positiveEmotionToFocus: Record<string, string> = {
            'happy': 'gratitude',
            'content': 'mindfulness',
            'peaceful': 'mindfulness',
            'excited': 'growth',
            'hopeful': 'purpose',
            'grateful': 'gratitude',
            'motivated': 'growth',
            'calm': 'self-care',
            'joyful': 'creativity',
          };
          suggestedFocus = positiveEmotionToFocus[emotionLabel.toLowerCase()] || 'growth';
        } else {
          // For struggling/neutral users, suggest improvement areas
          const emotionToFocus: Record<string, string> = {
            'anxious': 'anxiety',
            'anxiety': 'anxiety',
            'stressed': 'stress',
            'stress': 'stress',
            'tired': 'sleep',
            'exhausted': 'sleep',
            'sad': 'mood',
            'lonely': 'relationships',
            'overwhelmed': 'stress',
            'worried': 'anxiety',
            'frustrated': 'stress',
            'angry': 'mindfulness',
            'hopeless': 'mood',
            'neutral': 'mindfulness',
          };
          suggestedFocus = emotionToFocus[emotionLabel.toLowerCase()] || 'mindfulness';
        }
        
        setPatternAnalysis({
          suggested_focus: suggestedFocus,
          confidence: patterns.length >= 2 ? 'high' : 'medium',
          userState,
          patterns,
          summary: generateSummary(insightsData, suggestedFocus, userState),
          averageMood: avgMood
        });
        
        setViewMode('ai-confirm');
      } else {
        // Not enough data
        setPatternAnalysis({
          suggested_focus: 'mindfulness',
          confidence: 'low',
          userState: 'neutral',
          patterns: [],
          summary: "I don't have enough conversation history yet to identify specific patterns. Starting with mindfulness is a great foundation for emotional wellbeing.",
          averageMood: null
        });
        setViewMode('ai-confirm');
      }
    } catch (err) {
      console.error('Failed to analyze patterns:', err);
      setError('Failed to analyze your patterns. Try creating a plan manually.');
      setViewMode('choice');
    } finally {
      setGenerating(false);
    }
  };

  const generateSummary = (data: InsightsData, focus: string, userState: UserState): string => {
    const focusArea = FOCUS_AREAS.find(f => f.id === focus);
    
    // Different messaging based on user state
    if (userState === 'thriving') {
      const parts: string[] = [];
      if (data.total_messages && data.total_messages > 0) {
        parts.push(`Over the past two weeks, you've been doing really well`);
      }
      if (data.average_mood) {
        parts.push(`with an average mood of ${data.average_mood.toFixed(1)}/10`);
      }
      if (data.mood_trend === 'improving') {
        parts.push(`and things are getting even better`);
      }
      
      if (parts.length === 0) {
        return `You're in a great place! Let's channel this positive energy into ${focusArea?.label.toLowerCase() || focus} to keep your momentum going.`;
      }
      return parts.join(' ') + `. Since you're thriving, I suggest focusing on ${focusArea?.label.toLowerCase() || focus} to enhance your journey.`;
    }
    
    // For struggling/neutral users
    const parts: string[] = [];
    
    if (data.total_messages && data.total_messages > 0) {
      parts.push(`Based on ${data.total_messages} conversations over the past two weeks`);
    }
    
    if (data.top_emotions && data.top_emotions.length > 0) {
      const emotion = typeof data.top_emotions[0] === 'string' 
        ? data.top_emotions[0] 
        : (data.top_emotions[0] as any).emotion;
      parts.push(`you've been feeling ${emotion} most often`);
    }
    
    if (data.top_topics && data.top_topics.length > 0) {
      const topic = typeof data.top_topics[0] === 'string'
        ? data.top_topics[0]
        : (data.top_topics[0] as any).topic;
      parts.push(`while exploring themes around ${topic}`);
    }
    
    if (parts.length === 0) {
      return `Based on your activity, focusing on ${focusArea?.label.toLowerCase() || focus} could be beneficial for your wellbeing journey.`;
    }
    
    return parts.join(', ') + `. I recommend focusing on ${focusArea?.label.toLowerCase() || focus} to support your growth.`;
  };

  const generatePlan = async (focusArea: string, goal?: string, userState?: UserState) => {
    try {
      setGenerating(true);
      const focusAreaData = FOCUS_AREAS.find(f => f.id === focusArea);
      const focusDescription = goal || focusAreaData?.description || focusArea;
      
      // Build rich context for personalized plan
      const planRequest = {
        focus_area: focusDescription,
        duration_days: planDuration,
        user_state: userState || patternAnalysis?.userState || 'neutral',
        context: insights ? {
          average_mood: insights.average_mood,
          mood_trend: insights.mood_trend,
          top_emotions: insights.top_emotions?.slice(0, 3).map(e => 
            typeof e === 'string' ? e : (e as any).emotion
          ),
          top_topics: insights.top_topics?.slice(0, 3).map(t =>
            typeof t === 'string' ? t : (t as any).topic
          ),
          top_triggers: insights.top_triggers?.slice(0, 3).map(tr =>
            typeof tr === 'string' ? tr : (tr as any).label
          ),
          total_sessions: insights.total_messages,
          patterns: patternAnalysis?.patterns.map(p => p.insight) || []
        } : null
      };
      
      const newPlan = await api.insights.generatePlan(planRequest);
      setPlan(newPlan);
      setViewMode('plan');
    } catch (err) {
      console.error('Failed to generate plan:', err);
      setError('Failed to generate plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!plan) return;
    try {
      await api.insights.completeTask(plan.id, taskId);
      loadPlan();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const deletePlan = async () => {
    if (!plan) return;
    try {
      // Mark plan as inactive instead of deleting
      const token = localStorage.getItem('supabase_token');
      await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'}/insights/plans/${plan.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setPlan(null);
      setViewMode('choice');
    } catch (err) {
      console.error('Failed to delete plan:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500/30 bg-green-500/5';
      case 'current': return 'border-midnight-accent bg-midnight-accent/5 ring-1 ring-midnight-accent/20';
      case 'locked': return 'border-midnight-border bg-midnight-surface opacity-60';
      default: return 'border-midnight-border';
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (viewMode === 'loading') {
    return (
      <div className="h-full flex items-center justify-center bg-midnight-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-midnight-accent mx-auto mb-4"></div>
          <p className="text-midnight-muted">Loading your growth plan...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // CHOICE VIEW - Create manually or use AI
  // ============================================================
  if (viewMode === 'choice') {
    return (
      <div className="h-full flex flex-col bg-midnight-bg">
        <div className="p-6 border-b border-midnight-border">
          <h2 className="text-2xl font-bold text-white">Growth Plan</h2>
          <p className="text-midnight-muted mt-1">Build a personalized weekly plan for your wellbeing</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-midnight-accent/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-midnight-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">How would you like to create your plan?</h3>
              <p className="text-midnight-muted text-sm">Choose the approach that feels right for you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI-Generated Option */}
              <button
                onClick={analyzePatterns}
                className="p-6 rounded-xl bg-gradient-to-br from-midnight-accent/20 to-purple-500/10 border border-midnight-accent/30 hover:border-midnight-accent/60 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-full bg-midnight-accent/30 flex items-center justify-center mb-4 group-hover:bg-midnight-accent/40 transition-colors">
                  <svg className="w-6 h-6 text-midnight-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">AI-Personalized</h4>
                <p className="text-sm text-midnight-muted">
                  Analyze your conversation patterns and emotions to suggest a focus area tailored to you.
                </p>
                <span className="inline-block mt-3 text-xs text-midnight-highlight">Recommended</span>
              </button>

              {/* Manual Option */}
              <button
                onClick={() => setViewMode('manual')}
                className="p-6 rounded-xl bg-midnight-surface border border-midnight-border hover:border-midnight-accent/40 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-full bg-midnight-bg flex items-center justify-center mb-4 group-hover:bg-midnight-accent/10 transition-colors">
                  <svg className="w-6 h-6 text-midnight-muted group-hover:text-midnight-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Create Manually</h4>
                <p className="text-sm text-midnight-muted">
                  Choose your own focus area and set a personal goal for your growth journey.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MANUAL CREATION VIEW
  // ============================================================
  if (viewMode === 'manual') {
    // Filter focus areas - show all for manual selection
    const availableFocusAreas = FOCUS_AREAS.filter(a => a.type === 'improvement' || a.type === 'both');
    
    return (
      <div className="h-full flex flex-col bg-midnight-bg">
        <div className="p-6 border-b border-midnight-border">
          <button 
            onClick={() => setViewMode('choice')}
            className="text-midnight-muted hover:text-white mb-4 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="text-2xl font-bold text-white">Choose Your Focus</h2>
          <p className="text-midnight-muted mt-1">Select an area you'd like to work on</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Focus Area Selection */}
            <div>
              <label className="block text-sm font-medium text-midnight-muted mb-3">Focus Area</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableFocusAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => setSelectedFocus(area.id)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      selectedFocus === area.id
                        ? area.color + ' ring-2 ring-offset-2 ring-offset-midnight-bg'
                        : 'bg-midnight-surface border-midnight-border hover:border-midnight-accent/40'
                    }`}
                  >
                    <h4 className={`font-semibold ${selectedFocus === area.id ? '' : 'text-white'}`}>
                      {area.label}
                    </h4>
                    <p className="text-xs text-midnight-muted mt-1 line-clamp-2">{area.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            {selectedFocus && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-midnight-muted mb-3">Plan Duration</label>
                <div className="grid grid-cols-4 gap-3">
                  {DURATION_OPTIONS.map((option) => (
                    <button
                      key={option.days}
                      onClick={() => setPlanDuration(option.days)}
                      className={`p-3 rounded-xl border transition-all text-center ${
                        planDuration === option.days
                          ? 'bg-midnight-accent/20 border-midnight-accent text-midnight-highlight'
                          : 'bg-midnight-surface border-midnight-border hover:border-midnight-accent/40 text-white'
                      }`}
                    >
                      <div className="font-bold">{option.label}</div>
                      <div className="text-xs text-midnight-muted mt-1">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Goal (Optional) */}
            {selectedFocus && (
              <div className="space-y-3 animate-fade-in">
                <label className="block text-sm font-medium text-midnight-muted">
                  Personal goal (optional)
                </label>
                <textarea
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder={`What specifically do you want to achieve with ${FOCUS_AREAS.find(f => f.id === selectedFocus)?.label.toLowerCase()}?`}
                  className="w-full h-24 bg-midnight-surface border border-midnight-border rounded-xl p-4 text-white placeholder-midnight-muted focus:outline-none focus:border-midnight-accent resize-none"
                />
              </div>
            )}

            {/* Generate Button */}
            {selectedFocus && (
              <Button
                variant="primary"
                onClick={() => generatePlan(selectedFocus, customGoal || undefined)}
                disabled={generating}
                className="w-full py-4"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Creating Your Plan...
                  </span>
                ) : (
                  `Generate ${planDuration}-Day Plan`
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // AI ANALYSIS VIEW (Loading)
  // ============================================================
  if (viewMode === 'ai-analysis') {
    return (
      <div className="h-full flex items-center justify-center bg-midnight-bg">
        <div className="text-center max-w-md">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-midnight-accent/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full bg-midnight-accent/40 animate-pulse"></div>
            <div className="absolute inset-4 rounded-full bg-midnight-accent flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Patterns</h3>
          <p className="text-midnight-muted text-sm">
            Looking at your conversations to find what matters most to you...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // AI CONFIRM VIEW - Show analysis results
  // ============================================================
  if (viewMode === 'ai-confirm' && patternAnalysis) {
    const suggestedArea = FOCUS_AREAS.find(f => f.id === patternAnalysis.suggested_focus);
    const isThriving = patternAnalysis.userState === 'thriving';
    
    return (
      <div className="h-full flex flex-col bg-midnight-bg">
        <div className="p-6 border-b border-midnight-border">
          <button 
            onClick={() => setViewMode('choice')}
            className="text-midnight-muted hover:text-white mb-4 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="text-2xl font-bold text-white">
            {isThriving ? "You're Doing Great! 🌟" : "Based on Your Patterns"}
          </h2>
          <p className="text-midnight-muted mt-1">
            {isThriving 
              ? "Let's channel this positive energy into continued growth" 
              : "Here's what I noticed from your conversations"}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* User State Badge for thriving users */}
            {isThriving && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <p className="text-green-300 font-medium">Your mood has been positive lately</p>
                  <p className="text-sm text-green-300/70">
                    Average: {patternAnalysis.averageMood?.toFixed(1)}/10
                    {insights?.mood_trend === 'improving' && ' • Trending up'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Summary */}
            <div className={`rounded-xl p-6 border ${
              isThriving 
                ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20' 
                : 'bg-gradient-to-br from-midnight-accent/10 to-purple-500/10 border-midnight-accent/20'
            }`}>
              <p className="text-white leading-relaxed">{patternAnalysis.summary}</p>
            </div>

            {/* Patterns Found */}
            {patternAnalysis.patterns.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-midnight-muted">
                  {isThriving ? "What you've been focused on:" : "Patterns I noticed:"}
                </h4>
                {patternAnalysis.patterns.map((pattern, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-midnight-surface border border-midnight-border">
                    <div className="w-6 h-6 rounded-full bg-midnight-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-midnight-highlight">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white">{pattern.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Focus */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-midnight-muted">
                {isThriving ? "Suggested enhancement area:" : "Suggested focus area:"}
              </h4>
              <div className={`p-4 rounded-xl border-2 ${suggestedArea?.color || 'bg-midnight-surface border-midnight-border'}`}>
                <h3 className="font-bold text-lg">{suggestedArea?.label || patternAnalysis.suggested_focus}</h3>
                <p className="text-sm opacity-80 mt-1">{suggestedArea?.description}</p>
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-midnight-muted mb-3">Plan Duration</label>
              <div className="grid grid-cols-4 gap-3">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.days}
                    onClick={() => setPlanDuration(option.days)}
                    className={`p-3 rounded-xl border transition-all text-center ${
                      planDuration === option.days
                        ? 'bg-midnight-accent/20 border-midnight-accent text-midnight-highlight'
                        : 'bg-midnight-surface border-midnight-border hover:border-midnight-accent/40 text-white'
                    }`}
                  >
                    <div className="font-bold">{option.label}</div>
                    <div className="text-xs text-midnight-muted mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                variant="primary"
                onClick={() => generatePlan(patternAnalysis.suggested_focus, undefined, patternAnalysis.userState)}
                disabled={generating}
                className="w-full py-4"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Creating Your Plan...
                  </span>
                ) : (
                  `Create ${planDuration}-Day ${suggestedArea?.label || ''} Plan`
                )}
              </Button>
              
              <button
                onClick={() => setViewMode('manual')}
                className="w-full py-3 text-sm text-midnight-muted hover:text-white transition-colors"
              >
                Choose a different focus area
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PLAN VIEW - Show active plan
  // ============================================================
  if (viewMode === 'plan' && plan) {
    return (
      <div className="h-full flex flex-col bg-midnight-bg lg:bg-transparent">
        {/* Header */}
        <div className="p-6 border-b border-midnight-border bg-midnight-surface/50 lg:bg-transparent lg:px-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                Growth Plan
              </h2>
              <p className="text-midnight-muted mt-1">{plan.title}</p>
              {plan.goal && <p className="text-sm text-midnight-highlight mt-1">{plan.goal}</p>}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={deletePlan}
                className="text-sm text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Progress Section */}
          <div className="max-w-3xl">
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-sm font-bold text-midnight-muted uppercase tracking-wider">Progress</h3>
              <span className="text-midnight-highlight font-bold">{plan.progress}%</span>
            </div>
            <div className="w-full bg-midnight-surface rounded-full h-2">
              <div 
                className="bg-midnight-accent h-2 rounded-full transition-all duration-1000 shadow-glow-cyan" 
                style={{ width: `${plan.progress}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Days Grid */}
        <div className="flex-1 overflow-y-auto p-6 lg:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl">
            {plan.tasks.map((task) => (
              <div 
                key={task.id} 
                className={`relative p-6 rounded-xl border transition-all duration-300 flex flex-col ${getStatusColor(task.status)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-midnight-muted">Day {task.day}</span>
                  {task.status === 'completed' && <span className="text-green-400">✓</span>}
                  {task.status === 'locked' && (
                    <svg className="w-4 h-4 text-midnight-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{task.title}</h4>
                <p className="text-sm text-midnight-muted mb-6 flex-1">{task.description}</p>
                <div className="mt-auto">
                  {task.status === 'current' && (
                    <Button 
                      variant="primary" 
                      fullWidth 
                      onClick={() => {
                        onStartTask(task as unknown as DailyTask);
                        handleCompleteTask(task.id);
                      }} 
                      className="py-2 text-sm"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="h-full flex items-center justify-center bg-midnight-bg">
      <div className="text-center">
        <p className="text-midnight-muted">Something went wrong</p>
        <Button variant="outline" onClick={() => setViewMode('choice')} className="mt-4">
          Start Over
        </Button>
      </div>
    </div>
  );
};