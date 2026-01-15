import React, { useState } from 'react';
import { ChatSession } from '../types';

interface ChatSessionsPanelProps {
  sessions: ChatSession[];
  currentSessionId: number | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectSession: (sessionId: number) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: number) => void;
  isCreatingSession?: boolean;
}

export const ChatSessionsPanel: React.FC<ChatSessionsPanelProps> = ({
  sessions,
  currentSessionId,
  isOpen,
  onToggle,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isCreatingSession = false,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getEmotionEmoji = (emotion?: string) => {
    const emotionMap: Record<string, string> = {
      happy: '😊',
      content: '😌',
      neutral: '😐',
      anxious: '😰',
      stressed: '😫',
      sad: '😢',
      angry: '😠',
      confused: '😕',
      hopeful: '🌟',
      overwhelmed: '😵',
      lonely: '💔',
      calm: '🧘',
    };
    return emotionMap[emotion?.toLowerCase() || ''] || '💭';
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      {/* Desktop Toggle Button (when closed) - Only visible on desktop */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="hidden lg:block absolute top-4 right-4 z-20 p-2 bg-midnight-surface border border-midnight-border rounded-lg text-midnight-muted hover:text-white hover:bg-midnight-surface/80 transition-colors shadow-lg"
          title="Show chat history"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
      )}

      {/* Sessions Panel - Mobile: Full-height slide-in drawer | Desktop: Side panel */}
      <div
        className={`
          flex flex-col h-full bg-midnight-bg border-l border-midnight-border transition-all duration-300
          lg:relative fixed top-0 right-0 z-50 lg:z-auto
          ${isOpen ? 'w-[280px] translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 overflow-hidden'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-midnight-border flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Chat History</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewSession}
              disabled={isCreatingSession}
              className="p-1.5 bg-midnight-accent text-white rounded-lg hover:bg-midnight-accentHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isCreatingSession ? "Creating session..." : "New chat"}
            >
              {isCreatingSession ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
            <button
              onClick={onToggle}
              className="p-1.5 text-midnight-muted hover:text-white transition-colors"
              title="Hide panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-midnight-muted text-sm">No conversations yet</p>
              <p className="text-midnight-muted text-xs mt-1">Start a new session to begin</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`
                  group relative p-3 rounded-lg cursor-pointer transition-all duration-200
                  ${currentSessionId === session.id
                    ? 'bg-midnight-accent/10 border border-midnight-accent/30'
                    : 'hover:bg-midnight-surface border border-transparent'
                  }
                `}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{getEmotionEmoji(session.primaryEmotion)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-midnight-muted mt-0.5">
                      {formatDate(session.updatedAt)}
                      {session.messageCount ? ` · ${session.messageCount} messages` : ''}
                    </p>
                    {session.topics && session.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {session.topics.slice(0, 2).map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 text-[10px] bg-midnight-surface rounded text-midnight-muted"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-midnight-muted hover:text-red-400 transition-all"
                    title="Delete session"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t border-midnight-border">
          <p className="text-xs text-midnight-muted text-center">
            {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <div 
              className="bg-midnight-surface border border-midnight-border rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-white text-center mb-2">
                Delete Conversation?
              </h3>

              {/* Message */}
              <p className="text-midnight-muted text-center text-sm mb-6">
                This will permanently delete this conversation and all its messages. This action cannot be undone.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-midnight-bg border border-midnight-border text-white hover:bg-midnight-surface transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteSession(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
