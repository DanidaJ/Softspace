import React, { useState, useEffect } from 'react';
import { Session, InsightMetrics } from '../types';
import { api, InsightsData, TimelineItem } from '../utils/api';

interface HistoryInsightsProps {
  onClose?: () => void;
  sessions: Session[];
  refreshToken?: number; // bump to force reload
}

type PeriodOption = 7 | 14 | 30;

export const HistoryInsights: React.FC<HistoryInsightsProps> = ({ onClose, sessions, refreshToken }) => {
  const [metrics, setMetrics] = useState<InsightsData | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodOption>(7);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        const [insightsData, timelineData] = await Promise.all([
          api.insights.getInsights(period),
          api.insights.getTimeline(period)
        ]);
        setMetrics(insightsData);
        setTimeline(timelineData);
      } catch (err) {
        console.error('Failed to load insights:', err);
        setError('Failed to load insights data');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [refreshToken, period]);

  // Soft, non-alarming color palette (no red/green extremes)
  const getMoodColor = (val: number | null) => {
    if (val === null) return 'text-slate-400';
    if (val >= 7) return 'text-sky-400';      // Positive - calm blue
    if (val >= 5) return 'text-slate-300';     // Neutral - soft grey
    if (val >= 3) return 'text-amber-300';     // Strained - muted amber
    return 'text-violet-300';                   // Low - muted purple
  };

  const getStressColor = (val: string) => {
    if (val === 'Low') return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    if (val === 'Medium') return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
    return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
  };

  const getEnergyColor = (val: string) => {
    if (val === 'High') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (val === 'Balanced') return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
    return 'text-violet-300 bg-violet-500/10 border-violet-500/20';
  };

  const getSentimentColor = (val: string) => {
    if (val === 'Positive') return 'text-sky-300';
    if (val === 'Negative') return 'text-amber-300';
    return 'text-slate-400';
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === '↑') return <span className="text-emerald-400 ml-1">↑</span>;
    if (trend === '↓') return <span className="text-amber-400 ml-1">↓</span>;
    return <span className="text-slate-500 ml-1">→</span>;
  };

  const getNotableDay = () => {
    const notable = timeline.find(t => t.is_notable);
    return notable ? notable.day : null;
  };

  // Calculate weekly pattern summary
  const getWeeklyPattern = () => {
    if (timeline.length < 2) return null;
    
    const moods = timeline.map(t => t.mood);
    const midpoint = Math.floor(moods.length / 2);
    const firstHalf = moods.slice(0, midpoint);
    const secondHalf = moods.slice(midpoint);
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const moodChange = secondAvg - firstAvg;
    
    if (moodChange > 0.5) return { trend: 'improved', turnPoint: timeline[midpoint]?.day };
    if (moodChange < -0.5) return { trend: 'declined', turnPoint: timeline[midpoint]?.day };
    return { trend: 'stable', turnPoint: null };
  };

  const weeklyPattern = getWeeklyPattern();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-midnight-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-midnight-accent mx-auto mb-4"></div>
          <p className="text-midnight-muted">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="h-full flex items-center justify-center bg-midnight-bg">
        <div className="text-center">
          <p className="text-red-400 mb-2">⚠️ {error || 'No data available'}</p>
          <p className="text-midnight-muted text-sm">Start chatting to generate insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-midnight-bg lg:bg-transparent">
      {/* Header */}
      <div className="p-6 border-b border-midnight-border bg-midnight-surface/50 lg:bg-transparent flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">📊</span> Insights Dashboard
            </h2>
            <p className="text-sm text-midnight-muted mt-1">Deep dive into your emotional patterns</p>
         </div>
         {/* Period Selector */}
         <div className="flex items-center gap-1 bg-midnight-bg rounded-lg p-1 border border-midnight-border">
           {([7, 14, 30] as PeriodOption[]).map((p) => (
             <button
               key={p}
               onClick={() => setPeriod(p)}
               className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                 period === p
                   ? 'bg-midnight-accent text-white'
                   : 'text-midnight-muted hover:text-white hover:bg-midnight-surface'
               }`}
             >
               {p === 7 ? '7 Days' : p === 14 ? '2 Weeks' : 'Month'}
             </button>
           ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl">
            
            {/* AI Generated Insight Card */}
            <div className="col-span-1 lg:col-span-2 xl:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-midnight-surface to-[#162032] border border-midnight-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💡</span>
                <h3 className="text-lg font-bold text-white">AI Analysis</h3>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed italic">
                "{metrics.daily_insight || (metrics.has_data === false 
                  ? 'Start a conversation or log your mood to generate personalized insights. Your patterns will appear here as you use the app!' 
                  : 'Keep chatting to generate personalized insights about your emotional patterns.')}"
              </p>
              {metrics.is_new_user && metrics.account_age_days !== undefined && metrics.account_age_days > 0 && (
                <p className="text-sm text-midnight-muted mt-3">
                  📅 You've been here for {metrics.account_age_days} day{metrics.account_age_days !== 1 ? 's' : ''} — keep it up!
                </p>
              )}
            </div>

            {/* Period at a Glance - Enhanced Quick Stats */}
            <div className="p-6 rounded-2xl bg-midnight-surface border border-midnight-border">
              <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">
                {metrics.is_new_user 
                  ? `Your First ${metrics.account_age_days || 0} Days` 
                  : period === 7 
                    ? 'This Week at a Glance' 
                    : period === 14 
                      ? 'Last 2 Weeks' 
                      : 'This Month at a Glance'}
              </h3>
              <div className="space-y-4">
                {/* Mood with trend */}
                <div className="flex items-center justify-between">
                  <span className="text-midnight-muted">Mood</span>
                  <div className="flex items-center gap-1">
                    {metrics.average_mood !== null ? (
                      <>
                        <span className={`text-xl font-bold ${getMoodColor(metrics.average_mood)}`}>
                          {metrics.average_mood.toFixed(1)}/10
                        </span>
                        {metrics.mood_trend === 'improving' && <span className="text-emerald-400">↑</span>}
                        {metrics.mood_trend === 'declining' && <span className="text-amber-400">↓</span>}
                        {metrics.mood_trend === 'stable' && <span className="text-slate-500">→</span>}
                      </>
                    ) : (
                      <span className="text-midnight-muted text-sm italic">No data yet</span>
                    )}
                  </div>
                </div>
                
                {/* Stress */}
                <div className="flex items-center justify-between">
                  <span className="text-midnight-muted">Stress</span>
                  {metrics.average_stress ? (
                    <span className={`px-2 py-0.5 rounded text-sm font-medium border ${getStressColor(metrics.average_stress)}`}>
                      {metrics.average_stress} →
                    </span>
                  ) : (
                    <span className="text-midnight-muted text-sm italic">No data yet</span>
                  )}
                </div>

                {/* Energy */}
                <div className="flex items-center justify-between">
                  <span className="text-midnight-muted">Energy</span>
                  {metrics.average_energy ? (
                    <span className={`px-2 py-0.5 rounded text-sm font-medium border ${getEnergyColor(metrics.average_energy)}`}>
                      {metrics.average_energy} →
                    </span>
                  ) : (
                    <span className="text-midnight-muted text-sm italic">No data yet</span>
                  )}
                </div>

                {/* Sessions */}
                <div className="flex items-center justify-between pt-3 border-t border-midnight-border">
                  <span className="text-midnight-muted">Total Conversations</span>
                  <span className="text-midnight-highlight font-bold">{metrics.total_messages}</span>
                </div>
              </div>
            </div>

            {/* Emotion Timeline - Enhanced with energy column and trends */}
            <div className="col-span-1 lg:col-span-2 p-6 bg-midnight-surface rounded-2xl border border-midnight-border">
               <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Emotion Timeline</h3>
               {timeline.length > 0 ? (
                 <>
                 <div className="rounded-xl overflow-hidden border border-midnight-border">
                    <div className="grid grid-cols-5 p-4 border-b border-midnight-border text-xs font-bold text-midnight-muted uppercase tracking-wider bg-midnight-bg/50">
                       <div>Day</div>
                       <div className="text-center">Mood</div>
                       <div className="text-center">Stress</div>
                       <div className="text-center">Energy</div>
                       <div className="text-right">Sentiment</div>
                    </div>
                    {timeline.map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`grid grid-cols-5 p-4 border-b border-midnight-border last:border-0 transition-colors text-sm items-center ${
                            item.is_notable 
                              ? 'bg-violet-500/10 border-l-2 border-l-violet-400' 
                              : 'hover:bg-midnight-bg/30'
                          }`}
                        >
                            <div className="font-medium text-gray-300 flex items-center gap-1">
                              {item.day}
                              {item.is_notable && <span className="text-violet-400 text-xs" title="Notable day">✦</span>}
                            </div>
                            <div className={`text-center font-bold flex items-center justify-center ${getMoodColor(item.mood)}`}>
                                {item.mood}/10 {getTrendIcon(item.mood_trend)}
                            </div>
                            <div className="flex justify-center">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium border flex items-center ${getStressColor(item.stress)}`}>
                                    {item.stress} {getTrendIcon(item.stress_trend)}
                                </span>
                            </div>
                            <div className="flex justify-center">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getEnergyColor(item.energy || 'Balanced')}`}>
                                    {item.energy || 'Balanced'}
                                </span>
                            </div>
                            <div className={`text-right font-medium flex items-center justify-end ${getSentimentColor(item.sentiment)}`}>
                                {item.sentiment} {getTrendIcon(item.sentiment_trend)}
                            </div>
                        </div>
                    ))}
                 </div>
                 
                 {/* Weekly Pattern Summary */}
                 {weeklyPattern && timeline.length >= 3 && (
                   <div className="mt-4 p-4 rounded-xl bg-midnight-bg/50 border border-midnight-border">
                     <h4 className="text-xs font-bold text-midnight-muted uppercase mb-2">Pattern</h4>
                     <p className="text-sm text-gray-300">
                       {weeklyPattern.trend === 'improved' && `• Mood appeared to improve after ${weeklyPattern.turnPoint}`}
                       {weeklyPattern.trend === 'declined' && `• Mood seemed lower around ${weeklyPattern.turnPoint}`}
                       {weeklyPattern.trend === 'stable' && '• Mood remained relatively steady this week'}
                     </p>
                     {getNotableDay() && (
                       <p className="text-sm text-violet-300 mt-1">
                         • {getNotableDay()} stood out as a notable day
                       </p>
                     )}
                   </div>
                 )}
                 </>
               ) : (
                 <div className="text-center py-8 text-midnight-muted">
                   <p>No timeline data yet. Log your moods to see your progress!</p>
                 </div>
               )}
            </div>

            {/* Sidebar Column */}
            <div className="col-span-1 space-y-6">
                <div className="p-6 bg-midnight-surface rounded-2xl border border-midnight-border">
                  <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Top Triggers</h3>
                  {metrics.top_triggers.length > 0 ? (
                    <div className="space-y-4">
                      {metrics.top_triggers.slice(0, 5).map((trigger, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{trigger.label}</span>
                            <span className="text-midnight-muted">{trigger.count}%</span>
                          </div>
                          <div className="h-2 w-full bg-midnight-bg rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-slate-500 to-slate-400 rounded-full" 
                              style={{ width: `${Math.min(trigger.count, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-midnight-muted text-sm">Log moods with triggers to see patterns</p>
                  )}
                </div>

                <div className="p-6 bg-midnight-surface rounded-2xl border border-midnight-border">
                  <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Top Emotions</h3>
                  <p className="text-xs text-midnight-muted mb-3 italic">You may have been feeling...</p>
                  {metrics.top_emotions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {metrics.top_emotions.slice(0, 5).map((emotion, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1.5 rounded-full text-sm font-medium bg-midnight-bg border border-midnight-border text-gray-300 hover:text-white transition-colors"
                        >
                          {emotion.emoji} {emotion.emotion} ({emotion.count})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-midnight-muted text-sm">Chat more to identify emotional patterns</p>
                  )}
                </div>

                <div className="p-6 bg-midnight-surface rounded-2xl border border-midnight-border">
                  <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Mood Trend</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl ${
                      metrics.mood_trend === 'improving' ? 'text-sky-400' : 
                      metrics.mood_trend === 'declining' ? 'text-amber-400' : 
                      'text-slate-400'
                    }`}>
                      {metrics.mood_trend === 'improving' ? '📈' : metrics.mood_trend === 'declining' ? '📉' : '➡️'}
                    </span>
                    <span className="text-gray-300 capitalize">{metrics.mood_trend}</span>
                  </div>
                  <p className="text-xs text-midnight-muted mt-2 italic">
                    {metrics.mood_trend === 'improving' && 'Things seem to be looking up'}
                    {metrics.mood_trend === 'declining' && 'Consider reaching out for support'}
                    {metrics.mood_trend === 'stable' && 'Maintaining a steady baseline'}
                  </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};