import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

interface Goal {
  id: number;
  goal_text: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
  last_referenced_at: string | null;
  progress_notes: string[] | null;
}

// Wellbeing-focused categories (no emojis, professional)
const GOAL_CATEGORIES = [
  { id: 'sleep', label: 'Sleep', color: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' },
  { id: 'anxiety', label: 'Anxiety', color: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  { id: 'stress', label: 'Stress', color: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
  { id: 'mood', label: 'Mood', color: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
  { id: 'self-care', label: 'Self-Care', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
  { id: 'boundaries', label: 'Boundaries', color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' },
  { id: 'relationships', label: 'Relationships', color: 'bg-pink-500/20 border-pink-500/40 text-pink-300' },
  { id: 'other', label: 'Other', color: 'bg-slate-500/20 border-slate-500/40 text-slate-300' },
];

// Example goals for guidance
const EXAMPLE_GOALS = [
  "Get to bed before midnight on weekdays",
  "Take 5 minutes to breathe when feeling overwhelmed",
  "Say no to one thing that drains my energy this week",
  "Reach out to a friend when I'm feeling lonely",
  "Notice and name my emotions without judgment",
];

interface WellbeingGoalsProps {
  isOpen: boolean;
  onClose: () => void;
  initialSuggestion?: {
    detected_goal: string;
    category: string;
  } | null;
}

export const WellbeingGoals: React.FC<WellbeingGoalsProps> = ({ 
  isOpen, 
  onClose,
  initialSuggestion 
}) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchGoals();
    }
  }, [isOpen, user]);

  // Pre-fill from suggestion
  useEffect(() => {
    if (isOpen && initialSuggestion) {
      setNewGoal(initialSuggestion.detected_goal);
      setSelectedCategory(initialSuggestion.category);
      setShowNewGoalForm(true);
    }
  }, [isOpen, initialSuggestion]);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`${API_BASE_URL}/api/therapeutic/goals`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`${API_BASE_URL}/api/therapeutic/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          goal_text: newGoal.trim(),
          category: selectedCategory,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoals([data.goal, ...goals]);
        setNewGoal('');
        setSelectedCategory(null);
        setShowNewGoalForm(false);
      } else {
        setError('Failed to add goal. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeGoal = async (goalId: number) => {
    try {
      const token = localStorage.getItem('supabase_token');
      await fetch(`${API_BASE_URL}/api/therapeutic/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: false }),
      });
      setGoals(goals.map(g => g.id === goalId ? { ...g, is_active: false } : g));
    } catch (err) {
      console.error('Failed to complete goal:', err);
    }
  };

  const reactivateGoal = async (goalId: number) => {
    try {
      const token = localStorage.getItem('supabase_token');
      await fetch(`${API_BASE_URL}/api/therapeutic/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: true }),
      });
      setGoals(goals.map(g => g.id === goalId ? { ...g, is_active: true } : g));
    } catch (err) {
      console.error('Failed to reactivate goal:', err);
    }
  };

  const deleteGoal = async (goalId: number) => {
    try {
      const token = localStorage.getItem('supabase_token');
      await fetch(`${API_BASE_URL}/api/therapeutic/goals/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  if (!isOpen) return null;

  const activeGoals = goals.filter(g => g.is_active);
  const completedGoals = goals.filter(g => !g.is_active);
  const getCategoryStyle = (cat: string | null) => 
    GOAL_CATEGORIES.find(c => c.id === cat)?.color || GOAL_CATEGORIES[7].color;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1117] rounded-xl w-full max-w-md max-h-[80vh] flex flex-col border border-[#1e2a3a] shadow-2xl">
        
        {/* Header - Clean, no emojis */}
        <div className="p-5 border-b border-[#1e2a3a] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">Wellbeing Goals</h2>
            <p className="text-xs text-gray-500 mt-0.5">Personal intentions, at your pace</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* New Goal Form */}
          {showNewGoalForm ? (
            <div className="bg-[#161b22] rounded-lg p-4 space-y-4 border border-[#1e2a3a]">
              <div>
                <label className="text-xs text-gray-400 block mb-2">
                  What would you like to work on?
                </label>
                <textarea
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g., Get to bed before midnight..."
                  className="w-full bg-[#0d1117] border border-[#1e2a3a] rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
                  rows={2}
                  maxLength={200}
                  autoFocus
                />
              </div>

              {/* Category pills - horizontal scroll */}
              <div>
                <label className="text-xs text-gray-400 block mb-2">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {GOAL_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        selectedCategory === cat.id
                          ? cat.color
                          : 'bg-transparent border-[#1e2a3a] text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={addGoal}
                  disabled={!newGoal.trim() || isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  {isLoading ? 'Adding...' : 'Add Goal'}
                </button>
                <button
                  onClick={() => { setShowNewGoalForm(false); setNewGoal(''); setSelectedCategory(null); }}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewGoalForm(true)}
              className="w-full bg-[#161b22] hover:bg-[#1c2128] border border-dashed border-[#2d3748] hover:border-purple-500/30 rounded-lg p-3 text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Add a goal
            </button>
          )}

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</h3>
              {activeGoals.map(goal => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  categoryStyle={getCategoryStyle(goal.category)}
                  onComplete={() => completeGoal(goal.id)}
                  onDelete={() => deleteGoal(goal.id)}
                  isActive={true}
                />
              ))}
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Completed</h3>
              {completedGoals.map(goal => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  categoryStyle={getCategoryStyle(goal.category)}
                  onComplete={() => reactivateGoal(goal.id)}
                  onDelete={() => deleteGoal(goal.id)}
                  isActive={false}
                />
              ))}
            </div>
          )}

          {/* Empty state - minimal */}
          {goals.length === 0 && !showNewGoalForm && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">No goals yet</p>
              <p className="text-xs text-gray-600 max-w-[200px] mx-auto">
                Goals help Softspace understand what matters to you.
              </p>
              <div className="mt-4 space-y-1">
                <p className="text-xs text-gray-600">Examples:</p>
                {EXAMPLE_GOALS.slice(0, 2).map((eg, i) => (
                  <p key={i} className="text-xs text-gray-500 italic">"{eg}"</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Clean goal item component
const GoalItem: React.FC<{
  goal: Goal;
  categoryStyle: string;
  onComplete: () => void;
  onDelete: () => void;
  isActive: boolean;
}> = ({ goal, categoryStyle, onComplete, onDelete, isActive }) => {
  const category = GOAL_CATEGORIES.find(c => c.id === goal.category);
  
  return (
    <div className={`group bg-[#161b22] rounded-lg p-3 border border-[#1e2a3a] transition-all ${
      !isActive ? 'opacity-50' : 'hover:border-[#2d3748]'
    }`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onComplete}
          className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
            isActive
              ? 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/10'
              : 'border-purple-500/50 bg-purple-500/20'
          }`}
          title={isActive ? 'Mark as complete' : 'Reactivate'}
        >
          {!isActive && (
            <svg className="w-2.5 h-2.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm text-white ${!isActive ? 'line-through text-gray-500' : ''}`}>
            {goal.goal_text}
          </p>
          {category && (
            <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryStyle}`}>
              {category.label}
            </span>
          )}
        </div>

        {/* Delete - only visible on hover */}
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1"
          title="Remove"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default WellbeingGoals;
