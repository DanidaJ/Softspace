import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './Button';

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale';

interface BreathingConfig {
  inhale: number;
  hold: number;
  exhale: number;
}

// 4-4-6 breathing pattern (calming)
const BREATHING_PATTERN: BreathingConfig = {
  inhale: 4,
  hold: 4,
  exhale: 6,
};

export const BreathingExercise: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Calculate animation duration based on phase
  const getAnimationDuration = useCallback(() => {
    switch (phase) {
      case 'inhale': return BREATHING_PATTERN.inhale;
      case 'hold': return BREATHING_PATTERN.hold;
      case 'exhale': return BREATHING_PATTERN.exhale;
      default: return 0;
    }
  }, [phase]);

  // Start breathing exercise
  const startExercise = () => {
    setIsActive(true);
    setPhase('inhale');
    setTimeLeft(BREATHING_PATTERN.inhale);
    setCyclesCompleted(0);
  };

  // Timer logic
  useEffect(() => {
    if (!isActive || phase === 'idle') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Transition to next phase
          if (phase === 'inhale') {
            setPhase('hold');
            return BREATHING_PATTERN.hold;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return BREATHING_PATTERN.exhale;
          } else {
            // Completed one cycle
            setCyclesCompleted(c => c + 1);
            setPhase('inhale');
            return BREATHING_PATTERN.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isActive]);

  const getInstruction = () => {
    switch (phase) {
      case 'inhale': return "Breathe In";
      case 'hold': return "Hold";
      case 'exhale': return "Breathe Out";
      default: return "Ready?";
    }
  };

  const getSubtext = () => {
    switch (phase) {
      case 'inhale': return "Fill your lungs slowly and deeply";
      case 'hold': return "Pause and relax";
      case 'exhale': return "Release slowly and completely";
      default: return "Find a comfortable position";
    }
  };

  // Calculate circle scale based on phase
  const getCircleStyle = () => {
    const duration = getAnimationDuration();
    const baseStyle = {
      transition: `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
    };

    switch (phase) {
      case 'inhale':
        return { ...baseStyle, transform: 'scale(1)', opacity: 1 };
      case 'hold':
        return { ...baseStyle, transform: 'scale(1)', opacity: 1 };
      case 'exhale':
        return { ...baseStyle, transform: 'scale(0.6)', opacity: 0.6 };
      default:
        return { transform: 'scale(0.7)', opacity: 0.5 };
    }
  };

  // Idle state - invitation to start
  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-2">Breathing Coach</h3>
          <p className="text-midnight-muted">4-4-6 calming breath pattern</p>
        </div>

        {/* Preview circles */}
        <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-sky-500/10 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-sky-500/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-8 rounded-full bg-sky-500/30 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-glow-cyan">
            <span className="text-3xl">🌬️</span>
          </div>
        </div>

        <div className="space-y-3 max-w-xs">
          <p className="text-sm text-midnight-muted mb-6">
            This exercise will guide you through slow, calming breaths to activate your relaxation response.
          </p>
          <Button onClick={startExercise} variant="primary" className="w-full py-4">
            Begin Breathing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center relative">
      {/* Cycle counter */}
      <div className="absolute top-6 right-6 text-sm text-midnight-muted">
        Cycle {cyclesCompleted + 1}
      </div>

      {/* Main breathing visualization */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-10 flex items-center justify-center">
        
        {/* Outer ripple rings */}
        <div 
          className="absolute inset-0 rounded-full border border-sky-400/20"
          style={getCircleStyle()}
        />
        <div 
          className="absolute inset-4 rounded-full border border-sky-400/30"
          style={{
            ...getCircleStyle(),
            transitionDelay: '0.1s',
          }}
        />
        <div 
          className="absolute inset-8 rounded-full border border-sky-400/40"
          style={{
            ...getCircleStyle(),
            transitionDelay: '0.2s',
          }}
        />
        
        {/* Main breathing circle */}
        <div 
          className="absolute inset-12 rounded-full bg-gradient-to-br from-sky-400/20 to-blue-500/20 backdrop-blur-sm"
          style={getCircleStyle()}
        />
        
        {/* Inner glow circle */}
        <div 
          className="absolute inset-16 rounded-full bg-gradient-to-br from-sky-400/40 to-blue-500/40 shadow-glow-cyan"
          style={getCircleStyle()}
        />
        
        {/* Center content */}
        <div 
          className="relative z-10 flex flex-col items-center justify-center"
          style={getCircleStyle()}
        >
          <div className="text-6xl md:text-7xl font-light text-white tabular-nums mb-2">
            {timeLeft}
          </div>
          <div className={`
            text-sm font-medium uppercase tracking-widest
            ${phase === 'inhale' ? 'text-sky-300' : ''}
            ${phase === 'hold' ? 'text-blue-300' : ''}
            ${phase === 'exhale' ? 'text-indigo-300' : ''}
          `}>
            {getInstruction()}
          </div>
        </div>

        {/* Ambient floating particles */}
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-sky-400/40 animate-pulse"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 3) * 20}%`,
                animationDuration: `${3 + i * 0.5}s`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Instruction text */}
      <div className="text-center mb-10 animate-fade-in" key={phase}>
        <h4 className="text-xl font-medium text-white mb-2">
          {getInstruction()}
        </h4>
        <p className="text-midnight-muted text-sm max-w-xs">
          {getSubtext()}
        </p>
      </div>

      {/* Phase indicator dots */}
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${phase === 'inhale' ? 'bg-sky-400 scale-125' : 'bg-midnight-border'}`} />
        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${phase === 'hold' ? 'bg-blue-400 scale-125' : 'bg-midnight-border'}`} />
        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${phase === 'exhale' ? 'bg-indigo-400 scale-125' : 'bg-midnight-border'}`} />
      </div>

      {/* Complete button */}
      <Button variant="secondary" onClick={onComplete}>
        I'm Feeling Better
      </Button>
    </div>
  );
};