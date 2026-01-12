import React, { useState } from 'react';
import { Button } from './Button';

export const GroundingExercise: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(5);
  const [items, setItems] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  
  const steps = [
    { count: 5, label: "Things you can see", icon: "👁️", placeholder: "Name something you see...", color: "sky" },
    { count: 4, label: "Things you can touch", icon: "✋", placeholder: "Name something you can feel...", color: "blue" },
    { count: 3, label: "Things you can hear", icon: "👂", placeholder: "Name something you hear...", color: "indigo" },
    { count: 2, label: "Things you can smell", icon: "👃", placeholder: "Name a scent you like...", color: "violet" },
    { count: 1, label: "Thing you can taste", icon: "👅", placeholder: "Name a favorite taste...", color: "purple" },
  ];

  const currentStep = steps.find(s => s.count === step) || steps[0];

  const addItem = () => {
    if (currentInput.trim()) {
      setItems([...items, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    // Add current input if exists
    const finalItems = currentInput.trim() 
      ? [...items, currentInput.trim()] 
      : items;
    
    if (finalItems.length >= currentStep.count) {
      if (step > 1) {
        setStep(step - 1);
        setItems([]);
        setCurrentInput('');
      } else {
        onComplete();
      }
    }
  };
  
  const totalItems = items.length + (currentInput.trim() ? 1 : 0);
  const canProceed = totalItems >= currentStep.count;

  return (
    <div className="flex flex-col h-full p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-1">5-4-3-2-1 Grounding</h3>
        <p className="text-sm text-midnight-muted">Use your senses to come back to the present.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[5, 4, 3, 2, 1].map((num) => (
          <div 
            key={num} 
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${num >= step ? 'bg-sky-400' : 'bg-midnight-border'}`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-4xl mb-4 shadow-glow-cyan">
          {currentStep.icon}
        </div>
        
        <div>
          <span className="text-6xl font-bold text-sky-400 block mb-2">{currentStep.count}</span>
          <h4 className="text-xl font-medium text-white">{currentStep.label}</h4>
        </div>

        <p className="text-sm text-midnight-muted max-w-[250px]">
          Look around you. Find {currentStep.count} {currentStep.label.toLowerCase()}.
        </p>

        <div className="w-full space-y-2 max-w-xs pt-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-midnight-surface p-3 rounded-xl border border-sky-500/30 group">
              <svg className="w-4 h-4 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-white flex-1">{item}</span>
              <button 
                onClick={() => removeItem(i)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-1"
                aria-label="Remove item"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {items.length < currentStep.count && (
            <div className="flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (currentInput.trim()) {
                      addItem();
                    }
                  }
                }}
                placeholder={currentStep.placeholder}
                className="flex-1 bg-midnight-bg p-3 rounded-xl border border-midnight-border text-white placeholder-midnight-muted focus:outline-none focus:border-sky-500/50 transition-colors"
                autoFocus
              />
              <button
                onClick={addItem}
                disabled={!currentInput.trim()}
                className="px-4 py-3 rounded-xl bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Button onClick={handleNext} fullWidth variant="primary" disabled={!canProceed}>
          {step === 1 && totalItems >= 1 ? "Complete Exercise ✓" : `Continue to Next Sense (${totalItems}/${currentStep.count})`}
        </Button>
        {!canProceed && items.length > 0 && (
          <p className="text-center text-xs text-midnight-muted mt-2">
            Add {currentStep.count - totalItems} more item{currentStep.count - totalItems > 1 ? 's' : ''} to continue
          </p>
        )}
      </div>
    </div>
  );
};