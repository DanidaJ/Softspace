import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { api, JournalEntryData } from '../utils/api';

interface JournalingProps {
  onClose?: () => void;
  onSave?: (entry: { type: string; text: string }) => void;
  initialContent?: string;  // For pre-filled content (e.g., from chat reflection)
  initialReflection?: string;  // AI-generated reflection to show
}

type Mode = 'writing' | 'reflection' | 'history';

export const Journaling: React.FC<JournalingProps> = ({ 
  onClose, 
  onSave, 
  initialContent = '', 
  initialReflection = '' 
}) => {
  const [mode, setMode] = useState<Mode>(initialReflection ? 'reflection' : 'writing');
  const [text, setText] = useState(initialContent);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [aiReflection, setAiReflection] = useState(initialReflection);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pastEntries, setPastEntries] = useState<JournalEntryData[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryData | null>(null);
  const [generatingForEntry, setGeneratingForEntry] = useState(false);

  useEffect(() => {
    loadPastEntries();
  }, []);

  // If we have initial content from chat, show it
  useEffect(() => {
    if (initialContent) {
      setText(initialContent);
    }
    if (initialReflection) {
      setAiReflection(initialReflection);
      setMode('reflection');
    }
  }, [initialContent, initialReflection]);

  const loadPastEntries = async () => {
    try {
      setLoadingEntries(true);
      const entries = await api.journal.getEntries(20);
      setPastEntries(entries);
    } catch (err) {
      console.error('Failed to load journal entries:', err);
    } finally {
      setLoadingEntries(false);
    }
  };

  const generateReflection = async () => {
    if (!text.trim()) return;
    
    setIsGeneratingReflection(true);
    setMode('reflection');
    
    try {
      // Create entry with AI analysis
      const entry = await api.journal.createEntry(
        "What's on your mind?",  // Generic prompt
        text,
        'freeform'  // New type for freeform entries
      );
      
      if (entry.ai_analysis) {
        setAiReflection(entry.ai_analysis);
      } else {
        setAiReflection("You've taken a meaningful step by putting your thoughts into words. Writing helps process emotions and gain clarity. Notice what came up for you as you wrote.");
      }
      
      setSaved(true);
      loadPastEntries();
      
      if (onSave) onSave({ type: 'freeform', text });
    } catch (err) {
      console.error('Failed to generate reflection:', err);
      setAiReflection("Your entry was saved. Reflecting on your thoughts is a powerful practice.");
      setSaved(true);
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  const saveWithoutReflection = async () => {
    if (!text.trim()) return;
    
    setIsSaving(true);
    
    try {
      await api.journal.createEntry(
        "What's on your mind?",
        text,
        'freeform'
      );
      
      setSaved(true);
      loadPastEntries();
      
      if (onSave) onSave({ type: 'freeform', text });
    } catch (err) {
      console.error('Failed to save entry:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const startNewEntry = () => {
    setText('');
    setAiReflection('');
    setSaved(false);
    setMode('writing');
    setSelectedEntry(null);
  };

  // ============================================================
  // WRITING VIEW - Simple freeform journal
  // ============================================================
  const renderWriting = () => (
    <div className="h-full flex flex-col bg-midnight-bg lg:bg-transparent">
      {/* Header */}
      <div className="p-6 border-b border-midnight-border bg-midnight-surface/50 lg:bg-transparent lg:px-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Journal</h2>
            <p className="text-sm text-midnight-muted">Write freely. No prompts, no rules.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode('history')}
              disabled={loadingEntries}
              className="px-4 py-2 text-sm text-midnight-highlight hover:text-white transition-colors border border-midnight-border rounded-lg hover:border-midnight-accent/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingEntries ? 'Loading history…' : `History (${pastEntries.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* Writing Area */}
      <div className="flex-1 flex flex-col p-6 lg:px-0">
        <div className="flex-1 max-w-3xl w-full mx-auto flex flex-col">
          {/* Simple text area */}
          <div className="flex-1 relative">
            <textarea 
              className="w-full h-full min-h-[300px] bg-midnight-surface border border-midnight-border rounded-2xl p-6 text-white placeholder-midnight-muted/50 resize-none focus:outline-none focus:border-midnight-accent/50 focus:ring-1 focus:ring-midnight-accent leading-relaxed text-lg"
              placeholder="What's on your mind today?&#10;&#10;Write freely. This is your space to process thoughts, feelings, or anything you want to express..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
            
            {/* Character count */}
            {text.length > 0 && (
              <div className="absolute bottom-4 right-4 text-xs text-midnight-muted">
                {text.length} characters
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={generateReflection}
              disabled={!text.trim() || isGeneratingReflection || saved}
              variant="primary"
              className="flex-1 py-4"
            >
              {isGeneratingReflection ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Generating Reflection...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Save & Get AI Reflection
                </span>
              )}
            </Button>
            
            <Button
              onClick={saveWithoutReflection}
              disabled={!text.trim() || isSaving || saved}
              variant="secondary"
              className="sm:w-40 py-4"
            >
              {isSaving ? 'Saving...' : saved ? 'Saved ✓' : 'Just Save'}
            </Button>
          </div>
          
          {/* Tip */}
          <p className="text-center text-xs text-midnight-muted mt-4">
            💡 Tip: Writing without editing helps you access deeper thoughts
          </p>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // REFLECTION VIEW - Show AI reflection
  // ============================================================
  const renderReflection = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-midnight-bg lg:bg-transparent">
      {isGeneratingReflection ? (
        <div className="space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-midnight-accent/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full bg-midnight-accent/40 animate-pulse"></div>
            <div className="absolute inset-4 rounded-full bg-midnight-accent flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <p className="text-xl text-midnight-accent">Reading between the lines...</p>
        </div>
      ) : (
        <div className="space-y-8 max-w-2xl w-full">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto border border-green-500/20">
            <span className="text-4xl">✨</span>
          </div>
          
          <h3 className="text-2xl font-bold text-white">A Reflection For You</h3>
          
          {/* Your Entry Summary */}
          <div className="bg-midnight-surface p-4 rounded-xl border border-midnight-border text-left">
            <p className="text-sm text-midnight-muted mb-2">What you wrote:</p>
            <p className="text-gray-300 line-clamp-3">{text}</p>
          </div>
          
          {/* AI Reflection */}
          <div className="bg-gradient-to-br from-midnight-accent/10 to-purple-500/10 p-8 rounded-2xl border border-midnight-accent/20">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💭</span>
              <span className="text-sm font-medium text-midnight-highlight">AI Reflection</span>
            </div>
            <p className="text-lg text-gray-200 leading-relaxed italic">"{aiReflection}"</p>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={startNewEntry} variant="primary" className="px-8">
              Write Another Entry
            </Button>
            <Button onClick={() => setMode('history')} variant="secondary" className="px-8">
              View History
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================================
  // HISTORY VIEW - Past entries
  // ============================================================
  const renderHistory = () => (
    <div className="h-full flex flex-col bg-midnight-bg lg:bg-transparent">
      <div className="p-6 border-b border-midnight-border bg-midnight-surface/50 lg:bg-transparent lg:px-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setSelectedEntry(null);
              setMode('writing');
            }} 
            className="p-2 hover:bg-midnight-surface rounded-full text-midnight-muted hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Journal History</h2>
            <p className="text-sm text-midnight-muted">Your past reflections</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:px-0">
        {loadingEntries ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-midnight-accent"></div>
          </div>
        ) : pastEntries.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📝</span>
            <p className="text-midnight-muted mb-4">No journal entries yet.</p>
            <Button onClick={() => setMode('writing')} variant="primary">
              Write Your First Entry
            </Button>
          </div>
        ) : selectedEntry ? (
          // Single entry view
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={() => setSelectedEntry(null)}
              className="mb-4 text-sm text-midnight-muted hover:text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to list
            </button>
            
            <div className="p-6 bg-midnight-surface rounded-2xl border border-midnight-border">
              {/* Date & Time Header */}
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-midnight-muted">
                  {new Date(selectedEntry.created_at).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
                {selectedEntry.detected_emotions && selectedEntry.detected_emotions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedEntry.detected_emotions.slice(0, 3).map((emotion, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {emotion}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Journal Content */}
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wider text-midnight-muted mb-2">Your Entry</h4>
                <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
              </div>
              
              {/* AI Reflection Section */}
              {selectedEntry.ai_analysis ? (
                <div className="p-5 bg-gradient-to-br from-midnight-accent/10 to-purple-500/10 rounded-xl border border-midnight-accent/30">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💭</span>
                    <span className="text-sm font-medium text-midnight-highlight">AI Reflection</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed italic text-base">"{selectedEntry.ai_analysis}"</p>
                </div>
              ) : (
                <div className="p-5 bg-midnight-bg rounded-xl border border-midnight-border border-dashed">
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">💭</span>
                    <p className="text-midnight-muted text-sm mb-4">No AI reflection for this entry yet</p>
                    <Button
                      onClick={async () => {
                        setGeneratingForEntry(true);
                        try {
                          // Call API to generate reflection for this entry
                          const updated = await api.journal.createEntry(
                            selectedEntry.prompt || "What's on your mind?",
                            selectedEntry.content,
                            'reflection-request'
                          );
                          // Update the entry in our list with the new reflection
                          if (updated.ai_analysis) {
                            const updatedEntry = { ...selectedEntry, ai_analysis: updated.ai_analysis };
                            setSelectedEntry(updatedEntry);
                            setPastEntries(prev => prev.map(e => 
                              e.id === selectedEntry.id ? updatedEntry : e
                            ));
                          }
                        } catch (err) {
                          console.error('Failed to generate reflection:', err);
                        } finally {
                          setGeneratingForEntry(false);
                        }
                      }}
                      disabled={generatingForEntry}
                      variant="secondary"
                      className="px-6"
                    >
                      {generatingForEntry ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                          Generating...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Generate AI Reflection
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // List view
          <div className="space-y-3 max-w-3xl mx-auto">
            {pastEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="w-full p-5 bg-midnight-surface rounded-xl border border-midnight-border hover:border-midnight-accent/40 transition-all text-left group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-midnight-muted">
                    {new Date(entry.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                  {entry.ai_analysis && (
                    <span className="text-xs text-midnight-highlight flex items-center gap-1">
                      <span>💭</span> Has reflection
                    </span>
                  )}
                </div>
                <p className="text-gray-300 line-clamp-2 group-hover:text-white transition-colors">
                  {entry.content}
                </p>
                {entry.detected_emotions && entry.detected_emotions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.detected_emotions.slice(0, 3).map((emotion, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-midnight-bg text-midnight-muted">
                        {emotion}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (mode === 'history') return renderHistory();
  if (mode === 'reflection') return renderReflection();
  return renderWriting();
};