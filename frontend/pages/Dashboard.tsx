import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChatBubble } from '../components/ChatBubble';
import { SettingsDrawer } from '../components/SettingsDrawer';
import { CopingTools } from '../components/CopingTools';
import { Journaling } from '../components/Journaling';
import { GrowthPlan } from '../components/GrowthPlan';
import { HistoryInsights } from '../components/HistoryInsights';
import { Modal } from '../components/Modal';
import { GroundControl } from '../components/GroundControl';
import { ChatSessionsPanel } from '../components/ChatSessionsPanel';
import { DisclaimerModal } from '../components/DisclaimerModal';
import { WellbeingGoals } from '../components/WellbeingGoals';
import {
  MoodPulseWidget,
  RecentSessionCard,
  ActiveGoalsWidget,
  WeeklyDigestWidget,
  ConversationStatsWidget,
  QuickActionsRow
} from '../components/DashboardWidgets';
import { INITIAL_MESSAGES } from '../constants';
import { Message, Settings, ChatSession } from '../types';
import { api, ChatResponse, InsightsData, TimelineItem } from '../utils/api';

type View = 'home' | 'chat' | 'tools' | 'journal' | 'plan' | 'insights';

export const Dashboard: React.FC = () => {
  const { user, logout, isNewUser, clearNewUserFlag } = useAuth();
  const navigate = useNavigate();

  const debugLog = (...args: any[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  };
  
  // States
  const [currentView, setCurrentView] = useState<View>('home');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dashboard data state
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardInsights, setDashboardInsights] = useState<InsightsData | null>(null);
  const [dashboardTimeline, setDashboardTimeline] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(() => {
    // Restore session ID from localStorage on mount
    const savedId = localStorage.getItem('softspace_current_session_id');
    return savedId ? parseInt(savedId, 10) : null;
  });
  const [showSessionsPanel, setShowSessionsPanel] = useState(true);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [messagesLoadedForSession, setMessagesLoadedForSession] = useState<number | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  // Current emotional state from chat (enhanced with dimensional model)
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [emotionScores, setEmotionScores] = useState<Record<string, number> | null>(null);
  const [valenceArousal, setValenceArousal] = useState<{valence: number, arousal: number} | null>(null);
  const [insightsRefreshToken, setInsightsRefreshToken] = useState<number>(0);
  const [crisisDetected, setCrisisDetected] = useState<{level: string, show: boolean} | null>(null);
  
  // Therapeutic Goals State
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [suggestedGoal, setSuggestedGoal] = useState<{
    detected_goal: string;
    category: string;
    confidence: string;
  } | null>(null);

  // Chat Reflection State
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionData, setReflectionData] = useState<{
    summary: string;
    reflection: string;
    emotions: string[];
    themes: string[];
  } | null>(null);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);

  const [settings, setSettings] = useState<Settings>({
    darkMode: true,
    animations: true,
    safeMode: true
  });

  // Sync theme class on document root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-light', !settings.darkMode);
    root.classList.toggle('theme-dark', settings.darkMode);
  }, [settings.darkMode]);

  const handleToggleSetting = (key: keyof Settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    } finally {
      setIsSettingsOpen(false);
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.account.deleteAccount();
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account', error);
      alert('Unable to delete account right now. Please try again.');
    } finally {
      setIsSettingsOpen(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentView === 'chat') {
      scrollToBottom();
    }
  }, [messages, currentView]);

  // Load chat sessions on mount
  useEffect(() => {
    loadSessions();
    loadDashboardData(); // Load immediately for faster perceived performance
  }, []);

  // Load dashboard data (insights + timeline)
  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true);
      const [insightsData, timelineData] = await Promise.all([
        api.insights.getInsights(7),
        api.insights.getTimeline(7)
      ]);
      setDashboardInsights(insightsData);
      setDashboardTimeline(timelineData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Persist current session ID to localStorage
  useEffect(() => {
    if (currentSessionId !== null) {
      localStorage.setItem('softspace_current_session_id', currentSessionId.toString());
    }
  }, [currentSessionId]);

  // Auto-load messages when switching to chat view with a session
  useEffect(() => {
    // Only load if we're in chat view, have a session, sessions are loaded,
    // and we haven't already loaded messages for this session
    if (currentView === 'chat' && currentSessionId && sessionsLoaded && messagesLoadedForSession !== currentSessionId) {
      loadSessionMessages(currentSessionId);
    }
  }, [currentView, currentSessionId, sessionsLoaded, messagesLoadedForSession]);

  const loadSessions = async () => {
    try {
      const sessionsData = await api.chat.getSessions(100);
      debugLog('Loaded sessions from API:', sessionsData);
      const formattedSessions: ChatSession[] = sessionsData.map(s => ({
        id: s.id,
        title: s.title,
        primaryEmotion: s.primary_emotion,
        topics: s.topics,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
        messageCount: s.message_count || 0,
        preview: '',
        moodScore: undefined,
        tags: s.topics?.slice(0, 2)
      }));
      debugLog('Formatted sessions:', formattedSessions);
      setSessions(formattedSessions);
      setSessionsLoaded(true);

      // If we have a saved session ID, verify it still exists
      const savedId = localStorage.getItem('softspace_current_session_id');
      if (savedId) {
        const parsedId = parseInt(savedId, 10);
        const sessionExists = formattedSessions.some(s => s.id === parsedId);
        if (!sessionExists) {
          // Session no longer exists, clear it
          localStorage.removeItem('softspace_current_session_id');
          setCurrentSessionId(null);
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setSessionsLoaded(true);
    }
  };

  const loadSessionMessages = async (sessionId: number) => {
    try {
      setIsLoading(true);
      debugLog('Loading session:', sessionId);
      
      // Set the current session ID first
      setCurrentSessionId(sessionId);
      
      const messagesData = await api.chat.getSessionMessages(sessionId);
      debugLog('Received messages from API:', messagesData);
      
      if (!messagesData || messagesData.length === 0) {
        debugLog('No messages found for session, showing initial messages');
        setMessages(INITIAL_MESSAGES);
        setMessagesLoadedForSession(sessionId);
        setCurrentView('chat');
        return;
      }
      
      // Convert to Message format - messages from API are in chronological order
      const formattedMessages: Message[] = [];
      for (const msg of messagesData) {
        // Add user message
        formattedMessages.push({
          id: `user-${msg.id}`,
          text: msg.message,
          sender: 'user',
          timestamp: new Date(msg.created_at),
        });
        // Add bot response
        formattedMessages.push({
          id: `bot-${msg.id}`,
          text: msg.response,
          sender: 'bot',
          timestamp: new Date(msg.created_at),
          emotionalTone: msg.emotional_tone,
          moodScore: msg.mood_score,
        });
      }
      
      debugLog('Formatted messages for display:', formattedMessages);
      setMessages(formattedMessages);
      setMessagesLoadedForSession(sessionId);
      setCurrentView('chat');
    } catch (error) {
      console.error('Failed to load session messages:', error);
      setMessages(INITIAL_MESSAGES);
      setMessagesLoadedForSession(sessionId);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = async () => {
    // Prevent multiple rapid clicks
    if (isCreatingSession) return;
    
    setIsCreatingSession(true);
    try {
      // Find any existing empty sessions (no messages or only the initial AI greeting)
      const emptySessions = sessions.filter(session => 
        !session.messageCount || session.messageCount === 0
      );
      
      // Delete existing empty sessions before creating a new one
      // This ensures only one blank chat exists at a time (like ChatGPT/Claude)
      if (emptySessions.length > 0) {
        await Promise.all(
          emptySessions.map(session => api.chat.deleteSession(session.id))
        );
        
        // Update sessions state immediately to prevent race conditions
        const emptySessionIds = new Set(emptySessions.map(s => s.id));
        setSessions(prevSessions => prevSessions.filter(s => !emptySessionIds.has(s.id)));
      }
      
      const result = await api.chat.createSession();
      const newSessionId = result.session_id;
      
      // Create new session object and add to sessions list immediately
      const newSession: ChatSession = {
        id: newSessionId,
        title: 'New Chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0,
      };
      setSessions(prevSessions => [newSession, ...prevSessions]);
      
      setCurrentSessionId(newSessionId);
      setMessages(INITIAL_MESSAGES);
      setMessagesLoadedForSession(newSessionId);
      // Reset emotion state for new session - don't carry over from previous chats
      setCurrentEmotion(null);
      setEmotionScores(null);
      setValenceArousal(null);
      setCrisisDetected(null);
      // Switch to chat view when starting a new session
      setCurrentView('chat');
    } catch (error) {
      console.error('Failed to create session:', error);
      // Fallback: reload sessions if something went wrong
      loadSessions();
    } finally {
      setIsCreatingSession(false);
    }
  };

  const deleteSession = async (sessionId: number) => {
    try {
      await api.chat.deleteSession(sessionId);
      
      // Update sessions state immediately to prevent race conditions
      setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages(INITIAL_MESSAGES);
        setMessagesLoadedForSession(null);
        localStorage.removeItem('softspace_current_session_id');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      // Reload sessions only if deletion failed
      loadSessions();
    }
  };

  const generateChatReflection = async () => {
    if (!currentSessionId || messages.length < 2) return;
    
    try {
      setIsGeneratingReflection(true);
      const result = await api.chat.getSessionReflection(currentSessionId);
      
      if (result.success) {
        setReflectionData({
          summary: result.summary,
          reflection: result.reflection,
          emotions: result.emotions,
          themes: result.themes
        });
        setShowReflectionModal(true);
      }
    } catch (error) {
      console.error('Failed to generate reflection:', error);
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  const saveReflectionToJournal = () => {
    if (!reflectionData) return;
    
    // Switch to journal view with pre-filled content
    setCurrentView('journal');
    setShowReflectionModal(false);
    
    // The journal component will receive this via props
  };

  const handleSendMessage = async (text?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const msgText = text || inputValue;
    if (!msgText.trim() || isLoading) return;

    if (currentView !== 'chat') {
      setCurrentView('chat');
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: msgText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    if (!text) setInputValue('');
    setIsLoading(true);

    // Call real AI backend
    try {
      const response: ChatResponse = await api.chat.sendMessage(
        msgText, 
        'gemini', 
        currentSessionId || undefined
      );
      
      // Update session ID if we got a new one
      if (response.session_id && response.session_id !== currentSessionId) {
        setCurrentSessionId(response.session_id);
        loadSessions();
      }
      
      // Update current emotional state (enhanced)
      if (response.emotional_tone) {
        setCurrentEmotion(response.emotional_tone);
      }
      if (response.emotion_scores) {
        setEmotionScores(response.emotion_scores);
      }
      if (response.valence !== undefined && response.arousal !== undefined) {
        setValenceArousal({ valence: response.valence, arousal: response.arousal });
      }

      // Refresh insights after each successful chat message
      setInsightsRefreshToken((prev) => prev + 1);
      
      // Check for crisis detection
      debugLog('📊 Response from backend:', {
        crisis_level: response.crisis_level,
        crisis_keywords: response.crisis_keywords,
        needs_support: response.needs_support,
        emotion_scores: response.emotion_scores,
        valence: response.valence,
        arousal: response.arousal
      });
      
      if (response.crisis_level && ['moderate', 'high', 'immediate'].includes(response.crisis_level)) {
        debugLog('🚨 CRISIS DETECTED - Showing banner:', response.crisis_level);
        setCrisisDetected({ level: response.crisis_level, show: true });
      }
      
      // Check for AI-suggested goal
      if (response.suggested_goal && response.suggested_goal.detected_goal) {
        debugLog('🎯 Goal detected:', response.suggested_goal);
        setSuggestedGoal(response.suggested_goal);
      }
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
        emotionalTone: response.emotional_tone,
        moodScore: response.mood_score,
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please check if the backend is running.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified: Go directly to chat
  const startChatSession = () => {
    setCurrentView('chat');
    startNewSession();
    
    // Clear new user flag after first meaningful interaction
    if (isNewUser) {
      clearNewUserFlag();
    }
    
    const botStarter: Message = {
        id: Date.now().toString(),
        text: "Hey, what's on your mind today? I'm here to listen.",
        sender: 'bot',
        timestamp: new Date()
    };
    setMessages(prev => [...prev, botStarter]);
  };

  // Continue an existing session from dashboard
  const continueSession = (sessionId: number) => {
    setCurrentView('chat');
    loadSessionMessages(sessionId);
  };

  const NavButton = ({ view, icon, label }: { view: View, icon: React.ReactNode, label: string }) => (
    <button 
      onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }}
      className={`
        w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all duration-200
        ${currentView === view 
          ? 'bg-midnight-surface text-midnight-highlight border-l-4 border-midnight-accent' 
          : 'text-midnight-muted hover:bg-midnight-surface/50 hover:text-white'
        }
      `}
    >
      <span className={currentView === view ? 'text-midnight-accent' : 'text-midnight-muted'}>{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-midnight-bg text-midnight-text overflow-hidden relative font-sans">
      
      {/* Ground Control (SOS) - Always available */}
      <GroundControl />

      {/* Wellbeing Goals Modal */}
      <WellbeingGoals 
        isOpen={goalsOpen} 
        onClose={() => {
          setGoalsOpen(false);
          // Clear suggestion when closing
          setSuggestedGoal(null);
        }} 
        initialSuggestion={suggestedGoal}
      />

      {/* Mobile Header */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-midnight-bg/90 backdrop-blur-md border-b border-midnight-border z-40 flex items-center justify-between px-4">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-midnight-muted">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <img
              src={`${import.meta.env.BASE_URL}icons/icon.png`}
              alt="Softspace"
              className="w-7 h-7 object-contain scale-125"
              draggable={false}
            />
          </div>
          <span className="font-bold text-white tracking-wide">Softspace</span>
        </Link>
        <div className="flex items-center gap-1">
          {currentView === 'chat' && (
            <button 
              onClick={() => setShowSessionsPanel(!showSessionsPanel)} 
              className="p-2 text-midnight-muted hover:text-white transition-colors"
              title="Chat History"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
          )}
          {currentView !== 'chat' && (
            <button onClick={startChatSession} className="p-2 text-midnight-accent">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* LEFT SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-[260px] bg-midnight-bg border-r border-midnight-border flex flex-col transition-transform duration-300 transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <Link to="/" className="block hover:opacity-80 transition-opacity">
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2 tracking-wide">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <img
                  src={`${import.meta.env.BASE_URL}icons/icon.png`}
                  alt="Softspace"
                  className="w-7 h-7 object-contain scale-125"
                  draggable={false}
                />
              </div>
              Softspace
            </h2>
            <p className="text-xs text-midnight-muted pl-12">Your Gentle Companion</p>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          <NavButton 
            view="home" 
            label="Home Dashboard" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} 
          />
          <NavButton 
            view="chat" 
            label="Therapy Chat" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>} 
          />
          <NavButton 
            view="plan" 
            label="Growth Plan" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} 
          />
          <NavButton 
            view="insights" 
            label="Insights" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} 
          />
          <NavButton 
            view="journal" 
            label="Journal" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} 
          />
          <NavButton 
            view="tools" 
            label="Coping Tools" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} 
          />
        </div>

        <div className="p-4 border-t border-midnight-border space-y-2">
          <button 
            onClick={() => setGoalsOpen(true)}
            className="flex items-center gap-3 w-full p-2 rounded-lg text-sm text-midnight-muted hover:text-white hover:bg-midnight-surface transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            My Goals
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 w-full p-2 rounded-lg text-sm text-midnight-muted hover:text-white hover:bg-midnight-surface transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </button>
        </div>
      </aside>
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-midnight-bg">
        
        {/* HOME VIEW (Redesigned with Widgets) */}
        {currentView === 'home' && (
          <div className="flex-1 h-full overflow-hidden p-4 md:p-6 pt-20 lg:pt-6 animate-fade-in">
             <div className="max-w-6xl mx-auto h-full flex flex-col space-y-3">
                
                {/* Header */}
                <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h1 className="font-heading text-xl md:text-2xl font-semibold text-midnight-text tracking-tight">
                      {isNewUser 
                        ? `Welcome${user?.name ? `, ${user.name.split(' ')[0]}` : ''} `
                        : `Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`
                      }
                    </h1>
                    <p className="text-midnight-textSecondary mt-1 text-xs">
                      {isNewUser 
                        ? "We're glad you're here. Take your time to explore."
                        : "Here's how you've been doing"
                      }
                    </p>
                  </div>
                </div>

                {/* Quick Actions Row */}
                <div className="flex-shrink-0">
                  <QuickActionsRow 
                    onChat={startChatSession}
                    onBreathe={() => setCurrentView('tools')}
                    onJournal={() => setCurrentView('journal')}
                  />
                </div>

                {/* Main Grid - 2 columns on desktop */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden">
                   
                   {/* Left Column */}
                   <div className="flex flex-col space-y-3 h-full overflow-y-auto">
                      {/* Mood Pulse */}
                      <MoodPulseWidget 
                        timeline={dashboardTimeline} 
                        loading={dashboardLoading} 
                      />
                      
                      {/* Recent Session */}
                      <RecentSessionCard 
                        sessions={sessions.map(s => ({
                          id: s.id,
                          title: s.title,
                          primary_emotion: s.primaryEmotion,
                          topics: s.topics,
                          created_at: s.createdAt.toISOString(),
                          updated_at: s.updatedAt.toISOString(),
                          message_count: s.messageCount
                        }))}
                        loading={!sessionsLoaded}
                        onContinue={continueSession}
                      />
                      
                      {/* Active Goals */}
                      <ActiveGoalsWidget onViewAll={() => setGoalsOpen(true)} />
                   </div>

                   {/* Right Column */}
                   <div className="flex flex-col space-y-3 h-full overflow-y-auto">
                      {/* Weekly Digest (replaces check-in) */}
                      <WeeklyDigestWidget 
                        insights={dashboardInsights} 
                        loading={dashboardLoading} 
                      />
                      
                      {/* Conversation Stats (replaces Cosmic Constellations) */}
                      <ConversationStatsWidget 
                        sessions={sessions.map(s => ({
                          id: s.id,
                          title: s.title,
                          primary_emotion: s.primaryEmotion,
                          topics: s.topics,
                          created_at: s.createdAt.toISOString(),
                          updated_at: s.updatedAt.toISOString(),
                          message_count: s.messageCount
                        }))}
                        insights={dashboardInsights}
                        loading={dashboardLoading}
                      />
                   </div>

                </div>
             </div>
          </div>
        )}

        {/* CHAT VIEW */}
        {currentView === 'chat' && (
          <div className="flex-1 flex h-full relative pt-16 lg:pt-0">
             {/* Main Chat Area */}
             <div className="flex-1 flex flex-col h-full">
               {/* Crisis Alert Banner */}
               {crisisDetected?.show && (
                 <div className="bg-red-600/30 border-b-4 border-red-500 p-5 flex items-center justify-between animate-pulse shadow-lg">
                   <div className="flex items-center gap-4 flex-1">
                     <span className="text-4xl">🚨</span>
                     <div className="flex-1">
                       <p className="text-white font-bold text-lg mb-1">You're Not Alone - Immediate Help Available</p>
                       <div className="flex flex-wrap gap-3 items-center">
                         <a 
                           href="tel:988" 
                           className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-2"
                         >
                           📞 Call/Text 988 Now
                         </a>
                         <button
                           onClick={() => {
                             setCrisisDetected(null);
                             window.dispatchEvent(new CustomEvent('openGroundControl'));
                           }}
                           className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors"
                         >
                           View All Crisis Resources →
                         </button>
                         <span className="text-red-100 text-sm">Professional counselors ready to help 24/7</span>
                       </div>
                     </div>
                   </div>
                   <button 
                     onClick={() => setCrisisDetected(null)}
                     className="p-2 hover:bg-red-500/30 rounded-lg text-red-200 hover:text-white transition-colors ml-4"
                   >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
               )}
               
               {/* Goal Suggestion Notification (subtle, non-intrusive) */}
               {suggestedGoal && (
                 <div className="bg-indigo-900/40 border-b border-indigo-500/30 px-4 py-3 flex items-center justify-between">
                   <div className="flex items-center gap-3 flex-1">
                     <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                       <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm text-white/90 truncate">
                         Sounds like a goal: "<span className="font-medium">{suggestedGoal.detected_goal}</span>"
                       </p>
                       <p className="text-xs text-indigo-300/70">
                         Category: {suggestedGoal.category}
                       </p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 ml-3">
                     <button
                       onClick={() => {
                         // Open goals modal with pre-filled data
                         setGoalsOpen(true);
                         setSuggestedGoal(null);
                       }}
                       className="px-3 py-1.5 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 text-sm font-medium rounded-lg transition-colors"
                     >
                       Add Goal
                     </button>
                     <button
                       onClick={() => setSuggestedGoal(null)}
                       className="p-1.5 hover:bg-indigo-500/20 rounded-lg text-indigo-300/70 hover:text-indigo-200 transition-colors"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </button>
                   </div>
                 </div>
               )}
               
               <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                  <div className="max-w-3xl mx-auto w-full flex flex-col space-y-2 pb-24"> 
                    <div className="text-center py-8 flex flex-col items-center gap-2">
                       <span className="px-3 py-1 rounded-full bg-midnight-surface text-xs text-midnight-muted border border-midnight-border">
                         Encrypted & Private Session
                       </span>
                       {currentEmotion && (
                         <div className="flex flex-wrap justify-center gap-2">
                           <span className="px-3 py-1 rounded-full bg-midnight-accent/20 text-xs text-midnight-highlight border border-midnight-accent/30">
                             You may be feeling: {currentEmotion}
                             {emotionScores && emotionScores[currentEmotion] && (
                               <span className="ml-1 opacity-60">~{emotionScores[currentEmotion]}% confidence</span>
                             )}
                           </span>
                           {/* Show up to 2 secondary emotions if confidence > 30% */}
                           {emotionScores && Object.entries(emotionScores)
                             .filter(([emotion, score]) => emotion !== currentEmotion && Number(score) > 30)
                             .sort(([, a], [, b]) => Number(b) - Number(a))
                             .slice(0, 2)
                             .map(([emotion, score]) => (
                               <span key={emotion} className="px-2 py-1 rounded-full bg-midnight-surface/50 text-xs text-midnight-muted border border-midnight-border/50">
                                 also {emotion} (~{score}%)
                               </span>
                             ))
                           }
                         </div>
                       )}
                    </div>

                    {messages.map((msg) => (
                      <ChatBubble key={msg.id} message={msg} />
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-midnight-surface border border-midnight-border rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-midnight-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-midnight-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-midnight-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-midnight-bg/95 backdrop-blur-md border-t border-midnight-border">
                  <div className="max-w-3xl mx-auto">
                    <form onSubmit={(e) => handleSendMessage(undefined, e)} className="relative flex items-center gap-3">
                      {/* Save to Journal button */}
                      <button
                        type="button"
                        onClick={generateChatReflection}
                        disabled={isGeneratingReflection || messages.length < 3}
                        className="p-2.5 rounded-xl bg-midnight-surface border border-midnight-border text-midnight-muted hover:text-midnight-highlight hover:border-midnight-accent/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Save this conversation to your journal"
                      >
                        {isGeneratingReflection ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        )}
                      </button>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="flex-1 h-12 pl-4 pr-14 rounded-xl bg-midnight-surface border border-midnight-border text-white placeholder-midnight-muted focus:outline-none focus:border-midnight-accent/50 focus:ring-1 focus:ring-midnight-accent transition-colors disabled:opacity-50"
                      />
                      <button 
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className="absolute right-2 p-2 rounded-lg bg-midnight-accent text-white hover:bg-midnight-accentHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
             </div>
             
             {/* Sessions Panel - Right Side */}
             <ChatSessionsPanel
               sessions={sessions}
               currentSessionId={currentSessionId}
               isOpen={showSessionsPanel}
               onToggle={() => setShowSessionsPanel(!showSessionsPanel)}
               onSelectSession={(id) => loadSessionMessages(id)}
               onNewSession={startNewSession}
               onDeleteSession={deleteSession}
               isCreatingSession={isCreatingSession}
             />
          </div>
        )}

        {/* FULL SCREEN VIEWS */}
        {currentView !== 'chat' && currentView !== 'home' && (
           <div className="flex-1 overflow-hidden pt-16 lg:pt-0 bg-midnight-bg">
               <div className="h-full w-full max-w-7xl mx-auto">
                     {currentView === 'plan' && <GrowthPlan onStartTask={() => {}} />}
                     {currentView === 'insights' && <HistoryInsights sessions={[]} refreshToken={insightsRefreshToken} />}
                   {currentView === 'journal' && (
                     <Journaling 
                       onSave={() => {
                         setReflectionData(null);
                       }} 
                       initialContent={reflectionData?.reflection}
                       initialReflection={reflectionData?.summary}
                     />
                   )}
                   {currentView === 'tools' && <CopingTools onSendMessage={handleSendMessage} />}
               </div>
           </div>
        )}

      </main>

      {/* Chat Reflection Modal */}
      <Modal 
        isOpen={showReflectionModal} 
        onClose={() => setShowReflectionModal(false)}
        title="Save to Journal"
      >
        <div className="space-y-4">
          <p className="text-midnight-muted text-sm">
            Here's a reflection from your conversation. You can save this to your journal or edit it first.
          </p>
          
          {reflectionData && (
            <>
              {/* Summary */}
              <div className="p-4 bg-midnight-bg rounded-xl border border-midnight-border">
                <p className="text-sm text-midnight-muted mb-1">Session Summary</p>
                <p className="text-white">{reflectionData.summary}</p>
              </div>
              
              {/* Reflection */}
              <div className="p-4 bg-midnight-surface rounded-xl border border-midnight-accent/30">
                <p className="text-sm text-midnight-highlight mb-2 flex items-center gap-2">
                  <span>✨</span> AI Reflection
                </p>
                <p className="text-gray-300 leading-relaxed">{reflectionData.reflection}</p>
              </div>
              
              {/* Emotions & Themes */}
              {(reflectionData.emotions.length > 0 || reflectionData.themes.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {reflectionData.emotions.map((emotion, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {emotion}
                    </span>
                  ))}
                  {reflectionData.themes.map((theme, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowReflectionModal(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-midnight-border text-midnight-muted hover:text-white hover:border-midnight-accent/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveReflectionToJournal}
              className="flex-1 px-4 py-2.5 rounded-xl bg-midnight-accent text-white hover:bg-midnight-accentHover transition-colors font-medium"
            >
              Open in Journal
            </button>
          </div>
        </div>
      </Modal>

      {/* Settings Drawer */}
      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onToggle={handleToggleSetting}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Disclaimer Modal - Shows on first visit */}
      <DisclaimerModal onAccept={() => {}} />

    </div>
  );
};