import React, { useState } from 'react';
import { Button } from './Button';
import { MoodLogEntry } from '../types';

interface MoodTrackerProps {
  onLog: (entry: Omit<MoodLogEntry, 'id' | 'date'>) => void;
  onClose?: () => void;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onLog, onClose }) => {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [sleep, setSleep] = useState(7.5);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLog({ mood, energy, stress, sleepHours: sleep, notes });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setNotes('');
      if (onClose) onClose();
    }, 2000);
  };

  const renderSlider = (label: string, value: number, setValue: (val: number) => void, min=1, max=10, step=1, suffix="") => (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <label className="text-midnight-text font-medium">{label}</label>
        <span className="text-midnight-highlight font-bold">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-midnight-surface rounded-lg appearance-none cursor-pointer accent-midnight-accent hover:accent-midnight-highlight transition-colors"
      />
    </div>
  );

  if (submitted) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in bg-midnight-bg">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mb-2 border border-green-500/20">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">Check-in Complete</h3>
        <p className="text-midnight-muted text-sm">Logging your data helps uncover patterns.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-midnight-bg">
      <div className="p-6 border-b border-midnight-border flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Daily Check-in</h2>
        {onClose && (
          <button onClick={onClose} className="text-midnight-muted hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-6">
          {renderSlider("Overall Mood", mood, setMood)}
          {renderSlider("Energy Level", energy, setEnergy)}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-midnight-text block">Stress Level</label>
          <div className="grid grid-cols-3 gap-3">
            {(['Low', 'Medium', 'High'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setStress(level)}
                className={`
                  py-2.5 px-3 rounded-lg text-xs font-medium border transition-all duration-200
                  ${stress === level 
                    ? 'bg-midnight-surface border-midnight-accent text-midnight-highlight shadow-sm' 
                    : 'bg-transparent border-midnight-border text-midnight-muted hover:bg-midnight-surface'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {renderSlider("Hours Slept", sleep, setSleep, 0, 12, 0.5, " hrs")}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-midnight-text">Brief Journal (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What influenced your day?"
            className="w-full bg-midnight-surface border border-midnight-border rounded-xl p-3 text-sm text-white placeholder-midnight-muted/50 focus:outline-none focus:border-midnight-accent min-h-[100px] resize-none"
          />
        </div>
      </div>

      <div className="p-6 border-t border-midnight-border bg-midnight-surface/50">
        <Button onClick={handleSubmit} fullWidth variant="primary">
          Save Entry
        </Button>
      </div>
    </div>
  );
};