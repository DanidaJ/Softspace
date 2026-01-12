export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  emotionalTone?: string;
  moodScore?: number;
}

export interface ChatSession {
  id: number;
  title: string;
  primaryEmotion?: string;
  topics?: string[];
  createdAt: Date;
  updatedAt: Date;
  messageCount?: number;
  preview?: string;
  moodScore?: number;
  tags?: string[];
}

// Legacy Session type for compatibility
export interface Session {
  id: string;
  title: string;
  date: string;
  preview: string;
  moodScore?: number;
  tags?: string[];
}

export interface Settings {
  darkMode: boolean;
  animations: boolean;
  safeMode: boolean;
}

export interface MoodLogEntry {
  id: string;
  date: Date;
  mood: number;
  energy?: number;
  stress?: 'Low' | 'Medium' | 'High';
  sleepHours?: number;
  notes?: string;
  triggers?: string;
}

export interface DailyTask {
  day: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  type: 'breathing' | 'journal' | 'exercise' | 'education' | 'checkin';
}

export interface WeeklyPlan {
  id: string | number;
  title: string;
  goal: string;
  focusArea?: string;
  progress: number;
  tasks: DailyTask[];
  isActive?: boolean;
}

export interface InsightMetrics {
  topTriggers: { label: string; count: number; color: string }[];
  topicFrequency: { topic: string; count: number }[];
  weeklyMoodAverage: number;
  totalSessions: number;
  totalMessages?: number;
  tasksCompleted?: number;
  keyInsight: string;
  topEmotions?: { emotion: string; count: number }[];
}

export interface MoodTrend {
  date: string;
  day: string;
  mood: number;
  stress: string;
  sentiment: string;
  emotion?: string;
}

export interface JournalEntry {
  id: number;
  content: string;
  promptType?: string;
  moodScore?: number;
  detectedEmotions?: string[];
  detectedTopics?: string[];
  aiFeedback?: string;
  sentiment?: string;
  createdAt: Date;
}

export interface EmotionData {
  primaryEmotion: string;
  secondaryEmotions?: string[];
  moodScore: number;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  intensity: number;
  topics?: string[];
  triggers?: string[];
  needsSupport?: boolean;
}