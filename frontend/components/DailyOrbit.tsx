import React, { useState } from 'react';
import { MoodTracker } from './MoodTracker';

interface DailyOrbitProps {
  type: 'morning' | 'evening';
  onComplete: (data: any) => void;
  onClose: () => void;
}

export const DailyOrbit: React.FC<DailyOrbitProps> = ({ type, onComplete, onClose }) => {
  const [step, setStep] = useState(1);
  const [intention, setIntention] = useState('');
  const [gratitude, setGratitude] = useState('');

  const handleMorningComplete = () => {
    onComplete({ intention });
  };

  const handleEveningComplete = (moodData: any) => {
    // If step 1 (mood) is done, move to step 2 (gratitude)
    // But MoodTracker handles its own submission. 
    // We might need to wrap it or just use it as step 1.
    // For simplicity, let's say MoodTracker's onLog triggers next step
    setStep(2);
  };

  const finishEvening = () => {
    onComplete({ gratitude });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#0B1026] border border-midnight-border rounded-3xl overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Morning Flow */}
        {type === 'morning' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center text-3xl mx-auto mb-6 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              ☀️
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Good Morning</h2>
            <p className="text-gray-400 mb-8">Set your intention for this orbit.</p>
            
            <input
              type="text"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="Today, I will focus on..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 mb-6 text-center"
              autoFocus
            />
            
            <button
              onClick={handleMorningComplete}
              disabled={!intention.trim()}
              className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Begin Orbit
            </button>
          </div>
        )}

        {/* Evening Flow */}
        {type === 'evening' && (
          <div className="h-[600px] flex flex-col">
            {step === 1 ? (
              <div className="flex-1">
                <MoodTracker onLog={handleEveningComplete} />
              </div>
            ) : (
              <div className="p-8 text-center flex-1 flex flex-col justify-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-3xl mx-auto mb-6 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  🌙
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Evening Reflection</h2>
                <p className="text-gray-400 mb-8">What is one thing you are grateful for?</p>
                
                <textarea
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="I am grateful for..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 mb-6 resize-none"
                  autoFocus
                />
                
                <button
                  onClick={finishEvening}
                  disabled={!gratitude.trim()}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rest Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
