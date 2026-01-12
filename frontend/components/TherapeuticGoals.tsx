import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// API Configuration - matches api.ts
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

const GOAL_CATEGORIES = [
  { id: 'emotional', label: 'Emotional Wellbeing', icon: '💜', description: 'Managing feelings & building resilience' },
  { id: 'relationships', label: 'Relationships', icon: '🤝', description: 'Connection & communication' },
  { id: 'self-care', label: 'Self-Care', icon: '🌱', description: 'Taking care of yourself' },
  { id: 'boundaries', label: 'Boundaries', icon: '🛡️', description: 'Protecting your energy' },
  { id: 'growth', label: 'Personal Growth', icon: '✨', description: 'Learning & evolving' },
  { id: 'other', label: 'Other', icon: '🌙', description: 'Anything else on your mind' },
];

interface TherapeuticGoalsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TherapeuticGoals: React.FC<TherapeuticGoalsProps> = ({ isOpen, onClose }) => {
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

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`${API_BASE_URL}/api/therapeutic/goals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      console.error('Failed to add goal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoalActive = async (goalId: number, currentlyActive: boolean) => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`${API_BASE_URL}/api/therapeutic/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_active: !currentlyActive,
        }),
      });
      
      if (response.ok) {
        setGoals(goals.map(g => 
          g.id === goalId ? { ...g, is_active: !currentlyActive } : g
        ));
      }
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  const deleteGoal = async (goalId: number) => {
    if (!confirm('Are you sure you want to remove this goal?')) return;
    
    try {
      const token = localStorage.getItem('supabase_token');
      await fetch(`${API_BASE_URL}/api/therapeutic/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  if (!isOpen) return null;

  const activeGoals = goals.filter(g => g.is_active);
  const completedGoals = goals.filter(g => !g.is_active);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-midnight-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-midnight-600 shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-midnight-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span>🌟</span> Your Journey Goals
              </h2>
              <p className="text-sm text-midnight-300 mt-1">
                These are for <em>you</em> — at your own pace, in your own way
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-midnight-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Gentle reminder */}
          <div className="bg-purple-900/20 border border-purple-800/30 rounded-xl p-4">
            <p className="text-sm text-purple-200">
              💡 <strong>Remember:</strong> These goals are yours alone. There's no scoring, no judgment, 
              no "should." Softspace will gently reference them when it feels right, but you lead the way.
            </p>
          </div>

          {/* New Goal Form */}
          {showNewGoalForm ? (
            <div className="bg-midnight-700/50 rounded-xl p-4 space-y-4 border border-midnight-500">
              <div>
                <label className="text-sm text-midnight-300 block mb-2">
                  What would you like to work toward?
                </label>
                <textarea
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g., Practice self-compassion when I make mistakes..."
                  className="w-full bg-[#0a0e1a] border border-midnight-500 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  rows={3}
                  maxLength={300}
                  style={{ color: '#ffffff' }}
                />
                <p className="text-xs text-midnight-400 mt-1">{newGoal.length}/300</p>
              </div>

              <div>
                <label className="text-sm text-midnight-300 block mb-2">
                  Category (optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={`p-2 rounded-lg text-left transition-all text-sm ${
                        selectedCategory === cat.id
                          ? 'bg-purple-600/30 border-purple-500 border'
                          : 'bg-midnight-700 border border-midnight-500 hover:border-midnight-400'
                      }`}
                    >
                      <span className="mr-1">{cat.icon}</span>
                      <span className="text-white">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={addGoal}
                  disabled={!newGoal.trim() || isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-midnight-600 disabled:text-midnight-400 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  {isLoading ? 'Saving...' : 'Add Goal'}
                </button>
                <button
                  onClick={() => {
                    setShowNewGoalForm(false);
                    setNewGoal('');
                    setSelectedCategory(null);
                    setError(null);
                  }}
                  className="px-4 py-2 text-midnight-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewGoalForm(true)}
              className="w-full bg-midnight-700/50 hover:bg-midnight-700 border border-dashed border-midnight-500 hover:border-purple-500 rounded-xl p-4 text-midnight-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add a new goal
            </button>
          )}

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-midnight-300 mb-3">Active Goals</h3>
              <div className="space-y-2">
                {activeGoals.map(goal => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onToggle={() => toggleGoalActive(goal.id, goal.is_active)}
                    onDelete={() => deleteGoal(goal.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed/Paused Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-midnight-400 mb-3">Paused Goals</h3>
              <div className="space-y-2 opacity-60">
                {completedGoals.map(goal => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onToggle={() => toggleGoalActive(goal.id, goal.is_active)}
                    onDelete={() => deleteGoal(goal.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {goals.length === 0 && !showNewGoalForm && !isLoading && (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">🌱</span>
              <p className="text-midnight-300 mb-2">No goals yet</p>
              <p className="text-sm text-midnight-400">
                When you're ready, you can set intentions here.<br/>
                There's no rush — take your time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Individual Goal Card Component
const GoalCard: React.FC<{
  goal: Goal;
  onToggle: () => void;
  onDelete: () => void;
}> = ({ goal, onToggle, onDelete }) => {
  const category = GOAL_CATEGORIES.find(c => c.id === goal.category);
  const createdDate = new Date(goal.created_at).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className={`bg-midnight-700/50 rounded-xl p-4 border transition-all ${
      goal.is_active ? 'border-midnight-500' : 'border-midnight-600'
    }`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            goal.is_active
              ? 'border-purple-500 hover:bg-purple-500/20'
              : 'border-midnight-400 bg-purple-500/30'
          }`}
          title={goal.is_active ? 'Pause goal' : 'Reactivate goal'}
        >
          {!goal.is_active && (
            <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-white ${!goal.is_active ? 'line-through opacity-60' : ''}`}>
            {goal.goal_text}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-midnight-400">
            {category && (
              <span className="flex items-center gap-1">
                <span>{category.icon}</span>
                {category.label}
              </span>
            )}
            <span>Added {createdDate}</span>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="text-midnight-500 hover:text-red-400 transition-colors p-1"
          title="Remove goal"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TherapeuticGoals;
