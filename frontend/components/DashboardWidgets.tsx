import React, { useState, useEffect } from 'react';
import { api, TimelineItem, InsightsData, ChatSession } from '../utils/api';

// Helper to safely extract emotion labels (API may return strings or objects)
const getEmotionLabel = (item: any): string => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && 'emotion' in item) return (item as any).emotion;
  return String(item);
};

// Shared widget container for consistent styling
const WidgetContainer: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}> = ({ children, className = '', hover = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      bg-midnight-surface 
      rounded-xl 
      p-5 
      border border-midnight-border 
      shadow-card
      transition-all duration-200
      ${hover ? 'hover:shadow-card-hover hover:border-midnight-borderSubtle hover:-translate-y-0.5 cursor-pointer' : ''}
      ${className}
    `}
  >
    {/* Subtle top highlight for depth */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-t-xl" />
    {children}
  </div>
);

// Widget header for consistency
const WidgetHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex justify-between items-center mb-4">
    <div>
      <h3 className="font-heading font-semibold text-sm text-midnight-text tracking-tight">{title}</h3>
      {subtitle && <span className="text-xs text-midnight-muted">{subtitle}</span>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// Skeleton loader for widgets
const WidgetSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-midnight-surface rounded-xl p-5 border border-midnight-border animate-pulse ${className}`}>
    <div className="h-4 w-24 bg-midnight-border rounded-lg mb-4" />
    <div className="space-y-3">
      <div className="h-10 bg-midnight-border rounded-lg" />
      <div className="h-10 bg-midnight-border rounded-lg" />
    </div>
  </div>
);

// ============================================================
// MOOD PULSE WIDGET - Simple 7-day visual
// ============================================================
interface MoodPulseProps {
  timeline: TimelineItem[];
  loading: boolean;
}

export const MoodPulseWidget: React.FC<MoodPulseProps> = ({ timeline, loading }) => {
  if (loading) {
    return (
      <WidgetContainer>
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-midnight-border rounded-lg mb-4" />
          <div className="flex gap-2 justify-between">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-full max-w-[32px] h-12 bg-midnight-border rounded-lg" />
                <div className="w-6 h-3 bg-midnight-border rounded" />
              </div>
            ))}
          </div>
        </div>
      </WidgetContainer>
    );
  }

  // Fill in missing days with null values
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
  });

  const getMoodHeight = (mood: number | null) => {
    if (mood === null) return 'h-3';
    const heights = ['h-3', 'h-4', 'h-5', 'h-6', 'h-7', 'h-8', 'h-10', 'h-12', 'h-14', 'h-16'];
    return heights[Math.min(Math.floor(mood) - 1, 9)] || 'h-3';
  };

  const getMoodColor = (mood: number | null) => {
    if (mood === null) return 'bg-midnight-border';
    if (mood >= 7) return 'bg-gradient-to-t from-emerald-600 to-emerald-400';
    if (mood >= 5) return 'bg-gradient-to-t from-sky-600 to-sky-400';
    if (mood >= 3) return 'bg-gradient-to-t from-amber-600 to-amber-400';
    return 'bg-gradient-to-t from-violet-600 to-violet-400';
  };

  return (
    <WidgetContainer className="relative">
      <WidgetHeader title="Mood Pulse" subtitle="Last 7 days" />
      <div className="flex gap-2 justify-between items-end h-20">
        {last7Days.map((day, i) => {
          const dayData = timeline.find(t => t.day?.slice(0, 3) === day);
          const mood = dayData?.mood || null;
          const isToday = i === 6;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1 group">
              <div 
                className={`
                  w-full max-w-[32px] rounded-lg 
                  ${getMoodHeight(mood)} 
                  ${getMoodColor(mood)} 
                  transition-all duration-300
                  ${isToday ? 'ring-2 ring-midnight-accent/30 ring-offset-2 ring-offset-midnight-surface' : ''}
                  group-hover:opacity-80
                `}
                title={mood ? `${day}: ${mood}/10` : `${day}: No data`}
              />
              <span className={`text-[10px] ${isToday ? 'text-midnight-accent font-medium' : 'text-midnight-muted'}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
      {timeline.length === 0 && (
        <p className="text-xs text-midnight-muted text-center mt-3">
          Start chatting to see your mood trends
        </p>
      )}
    </WidgetContainer>
  );
};

// ============================================================
// RECENT SESSION CARD
// ============================================================
interface RecentSessionProps {
  sessions: ChatSession[];
  loading: boolean;
  onContinue: (sessionId: number) => void;
}

export const RecentSessionCard: React.FC<RecentSessionProps> = ({ sessions, loading, onContinue }) => {
  if (loading) {
    return <WidgetSkeleton />;
  }

  const lastSession = sessions[0];
  
  if (!lastSession) {
    return (
      <WidgetContainer>
        <WidgetHeader title="Recent Session" />
        <div className="text-center py-4">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-midnight-bg border border-midnight-border flex items-center justify-center">
            <svg className="w-6 h-6 text-midnight-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-midnight-text font-medium">No sessions yet</p>
          <p className="text-xs text-midnight-muted mt-1">Start your first conversation</p>
        </div>
      </WidgetContainer>
    );
  }

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const topics = lastSession.topics?.slice(0, 2).join(', ') || 'General chat';

  return (
    <WidgetContainer hover onClick={() => onContinue(lastSession.id)}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-heading font-semibold text-sm text-midnight-text">Recent Session</h3>
        <span className="text-xs text-midnight-accent bg-midnight-accent/10 px-2 py-0.5 rounded-full">
          {getTimeAgo(lastSession.updated_at)}
        </span>
      </div>
      <p className="text-midnight-text font-medium truncate">{lastSession.title || 'Untitled session'}</p>
      <p className="text-xs text-midnight-muted mt-1 truncate">Topics: {topics}</p>
      {lastSession.primary_emotion && (
        <span className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-xs bg-midnight-bg text-midnight-textSecondary border border-midnight-border">
          <span className="w-1.5 h-1.5 rounded-full bg-midnight-accent" />
          {lastSession.primary_emotion}
        </span>
      )}
      <div className="mt-4 flex items-center justify-between text-xs text-midnight-muted group-hover:text-midnight-accent transition-colors">
        <span>Continue this session</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </WidgetContainer>
  );
};

// ============================================================
// ACTIVE GOALS WIDGET
// ============================================================
interface Goal {
  id: number;
  goal_text: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

interface ActiveGoalsProps {
  onViewAll: () => void;
}

export const ActiveGoalsWidget: React.FC<ActiveGoalsProps> = ({ onViewAll }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const token = localStorage.getItem('supabase_token');
        const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/therapeutic/goals`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setGoals((data.goals || []).slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to fetch goals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      'sleep': 'bg-indigo-500/20 text-indigo-300',
      'anxiety': 'bg-amber-500/20 text-amber-300',
      'stress': 'bg-rose-500/20 text-rose-300',
      'mood': 'bg-purple-500/20 text-purple-300',
      'self-care': 'bg-emerald-500/20 text-emerald-300',
    };
    return colors[category || ''] || 'bg-slate-500/20 text-slate-300';
  };

  if (loading) {
    return <WidgetSkeleton />;
  }

  return (
    <WidgetContainer className="relative">
      <WidgetHeader 
        title="Active Goals" 
        action={
          <button 
            onClick={onViewAll} 
            className="text-xs text-midnight-accent hover:text-midnight-highlight transition-colors"
          >
            View all →
          </button>
        }
      />
      {goals.length === 0 ? (
        <div className="text-center py-4">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-midnight-bg border border-midnight-border flex items-center justify-center">
            <svg className="w-5 h-5 text-midnight-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-xs text-midnight-muted">No goals set yet.</p>
          <p className="text-xs text-midnight-muted">Goals help track your journey.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {goals.map((goal) => (
            <div 
              key={goal.id} 
              className="flex items-start gap-3 p-3 rounded-lg bg-midnight-bg/50 border border-midnight-border/50 hover:border-midnight-border transition-colors"
            >
              <div className="w-5 h-5 rounded-full border-2 border-midnight-accent/40 flex-shrink-0 mt-0.5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-midnight-accent/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-midnight-text">{goal.goal_text}</p>
                {goal.category && (
                  <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${getCategoryColor(goal.category)}`}>
                    {goal.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetContainer>
  );
};

// ============================================================
// AI INSIGHT OF THE DAY
// ============================================================
interface AIInsightProps {
  insights: InsightsData | null;
  loading: boolean;
}

export const AIInsightWidget: React.FC<AIInsightProps> = ({ insights, loading }) => {
  const [insight, setInsight] = useState<string>('');

  useEffect(() => {
    if (!insights) {
      setInsight('Start chatting to receive personalized insights about your emotional patterns.');
      return;
    }

    // Generate a simple insight from the data
    const messages: string[] = [];
    
    if (insights.total_messages > 0) {
      messages.push(`You've had ${insights.total_messages} conversation${insights.total_messages > 1 ? 's' : ''} this week.`);
    }
    
    if (insights.top_emotions && insights.top_emotions.length > 0) {
      const topEmotion = getEmotionLabel(insights.top_emotions[0]);
      if (topEmotion) {
        messages.push(`Your most common feeling has been "${topEmotion}".`);
      }
    }
    
    if (insights.mood_change !== undefined && insights.mood_change !== 0) {
      if (insights.mood_change > 0) {
        messages.push(`Your mood has improved compared to last week.`);
      } else if (insights.mood_change < -1) {
        messages.push(`Things have felt heavier this week. That's okay - we're here.`);
      }
    }

    if (insights.top_topics && insights.top_topics.length > 0) {
      const topic = insights.top_topics[0];
      if (topic) {
        messages.push(`You've been processing thoughts about "${topic}".`);
      }
    }

    if (messages.length === 0) {
      setInsight('Start a conversation anytime. I\'m here to listen without judgment.');
    } else {
      // Pick a random insight from available messages
      setInsight(messages[Math.floor(Math.random() * messages.length)]);
    }
  }, [insights]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-midnight-accent/10 to-purple-500/10 rounded-xl p-4 border border-midnight-accent/20 animate-pulse">
        <div className="h-4 w-20 bg-midnight-border rounded mb-2"></div>
        <div className="h-5 w-full bg-midnight-border rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-midnight-accent/10 to-purple-500/10 rounded-xl p-4 border border-midnight-accent/20">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-full bg-midnight-accent/30 flex items-center justify-center">
          <svg className="w-3 h-3 text-midnight-highlight" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-sm font-heading font-semibold text-midnight-accent">Insight</h3>
      </div>
      <p className="text-sm text-midnight-text leading-relaxed">{insight}</p>
    </div>
  );
};

// ============================================================
// WEEKLY DIGEST (Replaces Daily Check-in)
// ============================================================
interface WeeklyDigestProps {
  insights: InsightsData | null;
  loading: boolean;
}

export const WeeklyDigestWidget: React.FC<WeeklyDigestProps> = ({ insights, loading }) => {
  if (loading) {
    return <WidgetSkeleton />;
  }

  // Use has_data flag if available, otherwise check total_sessions
  const hasData = insights && (insights.has_data === true || insights.total_sessions > 0);
  
  if (!insights || !hasData) {
    return (
      <WidgetContainer>
        <WidgetHeader title="Weekly Summary" />
        <div className="text-center py-4">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-midnight-bg border border-midnight-border flex items-center justify-center">
            <svg className="w-5 h-5 text-midnight-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-xs text-midnight-muted">Your weekly summary will appear here</p>
          <p className="text-xs text-midnight-muted">after a few conversations.</p>
        </div>
      </WidgetContainer>
    );
  }

  const getDigestMessage = () => {
    const parts: string[] = [];
    
    if (insights.top_emotions && insights.top_emotions.length > 0) {
      const labels = insights.top_emotions
        .slice(0, 2)
        .map(getEmotionLabel)
        .filter(Boolean);
      if (labels.length > 0) {
        parts.push(`This week you've been feeling mostly ${labels.join(' and ')}`);
      }
    }
    
    if (insights.top_topics && insights.top_topics.length > 0) {
      const topicEntry = insights.top_topics[0];
      const topic = typeof topicEntry === 'string' ? topicEntry : (topicEntry as any).topic;
      if (topic) parts.push(`while processing ${topic}`);
    }

    if (parts.length === 0) {
      return "Keep chatting to build your emotional profile.";
    }

    return parts.join(', ') + '.';
  };

  const getMoodDescription = () => {
    const avg = insights.average_mood;
    if (avg >= 7) return { text: 'Positive', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (avg >= 5) return { text: 'Balanced', color: 'text-sky-400', bg: 'bg-sky-500/10' };
    if (avg >= 3) return { text: 'Challenging', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { text: 'Difficult', color: 'text-violet-400', bg: 'bg-violet-500/10' };
  };

  const mood = getMoodDescription();
  const topFeeling = insights.top_emotions && insights.top_emotions[0] ? getEmotionLabel(insights.top_emotions[0]) : '';

  return (
    <WidgetContainer className="relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading font-semibold text-sm text-midnight-text">Weekly Summary</h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${mood.color} ${mood.bg}`}>
          {mood.text} week
        </span>
      </div>
      <p className="text-sm text-midnight-textSecondary leading-relaxed">{getDigestMessage()}</p>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-midnight-border/50">
        <div className="text-center">
          <p className="text-xl font-heading font-bold text-midnight-text">{insights.total_messages}</p>
          <p className="text-[10px] text-midnight-muted uppercase tracking-wider">Conversations</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-heading font-bold text-midnight-text">{insights.average_mood?.toFixed(1) || '-'}</p>
          <p className="text-[10px] text-midnight-muted uppercase tracking-wider">Avg Mood</p>
        </div>
        {topFeeling && (
          <div className="text-center flex-1">
            <p className="text-sm font-medium text-midnight-text truncate">{topFeeling}</p>
            <p className="text-[10px] text-midnight-muted uppercase tracking-wider">Top feeling</p>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
};

// ============================================================
// CONVERSATION STATS (Replaces Cosmic Constellations)
// ============================================================
interface ConversationStatsProps {
  sessions: ChatSession[];
  insights: InsightsData | null;
  loading: boolean;
}

export const ConversationStatsWidget: React.FC<ConversationStatsProps> = ({ sessions, insights, loading }) => {
  if (loading) {
    return (
      <div className="bg-midnight-surface rounded-xl p-5 border border-midnight-border animate-pulse">
        <div className="h-5 w-32 bg-midnight-border rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-midnight-border rounded"></div>
          <div className="h-20 bg-midnight-border rounded"></div>
        </div>
      </div>
    );
  }

  // Count sessions this month
  const now = new Date();
  const thisMonth = sessions.filter(s => {
    const sessionDate = new Date(s.created_at);
    return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
  }).length;

  // Get topic breakdown from all sessions
  const topicCounts: Record<string, number> = {};
  sessions.forEach(s => {
    (s.topics || []).forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });
  const sortedTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  // Calculate consistency (days with sessions this week)
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  const daysWithSessions = new Set(
    sessions
      .filter(s => new Date(s.created_at) >= thisWeekStart)
      .map(s => new Date(s.created_at).toDateString())
  ).size;

  const getTopicColor = (index: number) => {
    const colors = [
      'bg-sky-500/20 text-sky-300 border-sky-500/30',
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    ];
    return colors[index % colors.length];
  };

  return (
    <WidgetContainer className="relative">
      <WidgetHeader title="Your Journey" />
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-midnight-bg/50 rounded-xl p-4 border border-midnight-border/50">
          <p className="text-2xl font-heading font-bold text-midnight-text">{thisMonth}</p>
          <p className="text-xs text-midnight-muted mt-1">Conversations this month</p>
        </div>
        <div className="bg-midnight-bg/50 rounded-xl p-4 border border-midnight-border/50">
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-heading font-bold text-midnight-text">{daysWithSessions}</p>
            <span className="text-midnight-muted">/7</span>
          </div>
          <p className="text-xs text-midnight-muted mt-1">Days active this week</p>
        </div>
      </div>

      {sortedTopics.length > 0 && (
        <div>
          <p className="text-xs text-midnight-muted mb-2 font-medium uppercase tracking-wider">Topics explored</p>
          <div className="flex flex-wrap gap-2">
            {sortedTopics.map(([topic, count], i) => (
              <span 
                key={topic} 
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getTopicColor(i)}`}
              >
                {topic} ({count}×)
              </span>
            ))}
          </div>
        </div>
      )}

      {sortedTopics.length === 0 && (
        <p className="text-xs text-midnight-muted">Topics you discuss will appear here.</p>
      )}
    </WidgetContainer>
  );
};

// ============================================================
// QUICK ACTIONS ROW
// ============================================================
interface QuickActionsProps {
  onChat: () => void;
  onBreathe: () => void;
  onJournal: () => void;
}

export const QuickActionsRow: React.FC<QuickActionsProps> = ({ onChat, onBreathe, onJournal }) => {
  const ActionButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    primary?: boolean;
    iconColor?: string;
  }> = ({ onClick, icon, label, primary = false, iconColor }) => (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-2.5 
        py-3.5 px-4 
        rounded-xl 
        font-medium
        transition-all duration-200 ease-out-expo
        transform active:scale-[0.98]
        ${primary 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5' 
          : 'bg-midnight-surface text-midnight-text border border-midnight-border hover:border-midnight-borderSubtle hover:bg-midnight-elevated hover:-translate-y-0.5 shadow-card hover:shadow-lg'
        }
      `}
    >
      <span className={primary ? '' : iconColor}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="flex gap-3">
      <ActionButton
        onClick={onChat}
        primary
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
        label="Start Chat"
      />
      <ActionButton
        onClick={onBreathe}
        iconColor="text-sky-400"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        }
        label="Breathe"
      />
      <ActionButton
        onClick={onJournal}
        iconColor="text-violet-400"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        }
        label="Journal"
      />
    </div>
  );
};
