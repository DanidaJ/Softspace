import React, { useState } from 'react';
import { Button } from './Button';
import { BreathingExercise } from './BreathingExercise';
import { GroundingExercise } from './GroundingExercise';
import { BlackHole } from './BlackHole';

interface CopingToolsProps {
  onClose?: () => void;
  onSendMessage: (text: string) => void;
}

type ToolType = 'menu' | 'breathing' | 'grounding' | 'affirmation' | 'blackhole';

export const CopingTools: React.FC<CopingToolsProps> = ({ onClose, onSendMessage }) => {
  const [view, setView] = useState<ToolType>('menu');
  const [affirmation, setAffirmation] = useState('');

  const affirmations = ["I am safe.", "This will pass.", "I am enough.", "My breath is my anchor."];

  const handleAffirmation = () => {
    const random = affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmation(random);
    setView('affirmation');
  };

  const renderMenu = () => (
    <div className="h-full flex flex-col bg-midnight-bg lg:bg-transparent">
      <div className="p-6 border-b border-midnight-border bg-midnight-surface/50 lg:bg-transparent lg:px-0">
        <h2 className="text-2xl font-bold text-white">Coping Tools</h2>
        <p className="text-sm text-midnight-muted">Quick relief for tough moments</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
            <button onClick={() => setView('breathing')} className="w-full p-6 rounded-xl bg-midnight-surface border border-midnight-border hover:border-blue-400/50 transition-all text-left h-48 flex flex-col justify-center group">
               <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-500/20">🌬️</div>
               <h3 className="text-lg font-bold text-white group-hover:text-blue-300">Breathing Coach</h3>
               <p className="text-sm text-midnight-muted">Calm your nervous system</p>
            </button>

            <button onClick={() => setView('grounding')} className="w-full p-6 rounded-xl bg-midnight-surface border border-midnight-border hover:border-green-400/50 transition-all text-left h-48 flex flex-col justify-center group">
               <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-2xl mb-4 group-hover:bg-green-500/20">🌳</div>
               <h3 className="text-lg font-bold text-white group-hover:text-green-300">Grounding</h3>
               <p className="text-sm text-midnight-muted">Connect to reality (5-4-3-2-1)</p>
            </button>

            <button onClick={handleAffirmation} className="w-full p-6 rounded-xl bg-midnight-surface border border-midnight-border hover:border-yellow-400/50 transition-all text-left h-48 flex flex-col justify-center group">
               <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-2xl mb-4 group-hover:bg-yellow-500/20">✨</div>
               <h3 className="text-lg font-bold text-white group-hover:text-yellow-300">Affirmation</h3>
               <p className="text-sm text-midnight-muted">Positive thought shifter</p>
            </button>

            <button onClick={() => setView('blackhole')} className="w-full p-6 rounded-xl bg-midnight-surface border border-midnight-border hover:border-purple-400/50 transition-all text-left h-48 flex flex-col justify-center group">
               <div className="w-12 h-12 rounded-full bg-purple-900/20 flex items-center justify-center text-2xl mb-4 group-hover:bg-purple-900/40">⚫</div>
               <h3 className="text-lg font-bold text-white group-hover:text-purple-300">The Black Hole</h3>
               <p className="text-sm text-midnight-muted">Release negative thoughts</p>
            </button>
        </div>
      </div>
    </div>
  );

  const renderAffirmation = () => (
    <div className="h-full flex flex-col p-6 text-center justify-center bg-midnight-bg lg:bg-midnight-surface lg:rounded-2xl relative">
      <button onClick={() => setView('menu')} className="absolute top-6 left-6 text-midnight-muted hover:text-white">← Back</button>
      <div className="mb-12">
        <h3 className="text-3xl font-bold text-white leading-tight">"{affirmation}"</h3>
      </div>
      <div className="space-y-4 max-w-xs mx-auto w-full">
        <Button onClick={handleAffirmation} variant="secondary" fullWidth>New One</Button>
      </div>
    </div>
  );

  if (view === 'breathing') return <div className="h-full bg-midnight-bg lg:bg-midnight-surface lg:rounded-2xl relative"><button onClick={() => setView('menu')} className="absolute top-6 left-6 z-10 text-midnight-muted hover:text-white">← Back</button><BreathingExercise onComplete={() => setView('menu')} /></div>;
  if (view === 'grounding') return <div className="h-full bg-midnight-bg lg:bg-midnight-surface lg:rounded-2xl relative"><button onClick={() => setView('menu')} className="absolute top-6 left-6 z-10 text-midnight-muted hover:text-white">← Back</button><GroundingExercise onComplete={() => setView('menu')} /></div>;
  if (view === 'blackhole') return <BlackHole onClose={() => setView('menu')} />;
  
  return view === 'affirmation' ? renderAffirmation() : renderMenu();
};