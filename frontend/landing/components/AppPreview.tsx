import React, { useState } from 'react';

const screens = [
  {
    id: 'chat',
    title: 'Chat with Softspace',
    description: 'Your AI companion that listens, remembers, and supports you through conversations.',
    content: (
      <div className="h-full flex flex-col">
        {/* Message list */}
        <div className="p-4 space-y-3 flex-1 overflow-hidden">
          <div className="flex justify-start">
            <div className="bg-midnight-elevated/60 border border-midnight-border rounded-2xl rounded-bl-md px-4 py-2 max-w-[78%]">
              <p className="text-sm text-midnight-textSecondary leading-relaxed">
                Hi — I’m here with you. What’s been on your mind today?
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl rounded-br-md px-4 py-2 max-w-[70%]">
              <p className="text-sm text-midnight-text leading-relaxed">
                I feel a little overwhelmed and I can’t focus.
              </p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-midnight-elevated/60 border border-midnight-border rounded-2xl rounded-bl-md px-4 py-2 max-w-[82%]">
              <p className="text-sm text-midnight-textSecondary leading-relaxed">
                That makes sense. Want to try a quick reset: name one thing you can control right now, and one small next step?
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl rounded-br-md px-4 py-2 max-w-[60%]">
              <p className="text-sm text-midnight-text leading-relaxed">
                Okay. Let’s do it.
              </p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-midnight-elevated/40 border border-midnight-border rounded-2xl rounded-bl-md px-4 py-2 max-w-[68%]">
              <p className="text-sm text-midnight-muted leading-relaxed">
                Try a 30-second breathing pattern, or keep chatting.
              </p>
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="px-4 pb-4">
          <div className="h-12 rounded-xl bg-midnight-surface border border-midnight-border flex items-center px-3 gap-2">
            <div className="text-sm text-midnight-muted flex-1 truncate">
              Type a message…
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'mood',
    title: 'Track Your Mood',
    description: 'Visualize your emotional patterns with beautiful cosmic-themed charts.',
    content: (
      <div className="h-full flex flex-col">
        <div className="p-4 space-y-4 flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-midnight-textSecondary text-sm">This Week</span>
          <span className="text-xs text-midnight-muted">7 entries</span>
        </div>
        <div className="flex items-end justify-between gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-20 rounded-lg bg-midnight-surface border border-midnight-border overflow-hidden flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-blue-500/35 to-purple-500/25"
                  style={{ height: `${35 + i * 5}%` }}
                />
              </div>
              <span className="text-xs text-midnight-muted">•</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-midnight-surface border border-midnight-border p-3">
              <div className="text-xs text-midnight-muted">
                {i === 0 ? 'Average' : i === 1 ? 'Best day' : 'Trend'}
              </div>
              <div className="text-sm text-midnight-text mt-1">
                {i === 0 ? 'Balanced' : i === 1 ? 'Calmer' : 'Steady'}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="text-2xl">🌙</span>
          <span className="text-midnight-text text-sm">Mood insights</span>
        </div>
        </div>
      </div>
    ),
  },
  {
    id: 'journal',
    title: 'Guided Journaling',
    description: 'Thoughtful prompts help you explore your thoughts without the blank page anxiety.',
    content: (
      <div className="h-full flex flex-col">
        <div className="p-4 space-y-4 flex-1 overflow-hidden">
        <div className="bg-midnight-elevated/50 rounded-xl p-4">
          <span className="text-xs text-blue-400 font-medium">Today's Prompt</span>
          <p className="mt-3 text-sm text-midnight-textSecondary leading-relaxed">
            What’s one small win from today — and what helped you get there?
          </p>
        </div>
        <div className="space-y-2">
          <span className="text-xs text-midnight-muted">Your reflection</span>
          <div className="bg-midnight-surface rounded-xl p-3 border border-midnight-border">
            <p className="text-sm text-midnight-textSecondary leading-relaxed">
              I took a short break instead of pushing through. It didn’t fix everything, but it helped me feel more grounded.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-midnight-muted">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Autosave</span>
        </div>
        </div>

        <div className="px-4 pb-4">
          <div className="h-10 rounded-xl bg-midnight-surface border border-midnight-border" />
        </div>
      </div>
    ),
  },
  {
    id: 'tools',
    title: 'Coping Tools',
    description: 'Breathing exercises, grounding techniques, and mindfulness tools for immediate calm.',
    content: (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 text-center border border-blue-500/20">
            <div className="text-2xl mb-2">🌬️</div>
            <span className="text-sm text-midnight-text">Breathing</span>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 text-center border border-purple-500/20">
            <div className="text-2xl mb-2">🌍</div>
            <span className="text-sm text-midnight-text">Grounding</span>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-4 text-center border border-amber-500/20">
            <div className="text-2xl mb-2">🧘</div>
            <span className="text-sm text-midnight-text">Meditation</span>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl p-4 text-center border border-emerald-500/20">
            <div className="text-2xl mb-2">🌊</div>
            <span className="text-sm text-midnight-text">Black Hole</span>
          </div>
        </div>
        <p className="text-xs text-center text-midnight-muted">Quick tools for moments that feel heavy</p>
      </div>
    ),
  },
];

export const AppPreview: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState(0);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-bg via-midnight-surface/30 to-midnight-bg" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
            See It In Action
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-midnight-text mb-6">
            A glimpse into your calm space
          </h2>
          <p className="text-lg text-midnight-textSecondary max-w-2xl mx-auto">
            Designed to feel like a safe haven — calming visuals, gentle interactions, and everything you need at your fingertips.
          </p>
        </div>

        {/* Preview Container */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Phone Mockup */}
          <div className="relative flex-shrink-0">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full scale-150" />
            
            {/* Phone frame */}
            <div className="relative w-[280px] md:w-[320px] h-[580px] md:h-[660px] bg-midnight-surface rounded-[3rem] border-4 border-midnight-elevated shadow-2xl overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-midnight-elevated rounded-b-2xl z-10" />
              
              {/* Screen content */}
              <div className="h-full bg-midnight-bg pt-10 overflow-hidden">
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 py-2 text-xs text-midnight-muted">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8z"/>
                    </svg>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 4h-3V2h-4v2H7v18h10V4z"/>
                    </svg>
                  </div>
                </div>
                
                {/* App header */}
                <div className="px-4 py-3 border-b border-midnight-border">
                  <h3 className="font-heading font-semibold text-midnight-text">
                    {screens[activeScreen].title}
                  </h3>
                </div>
                
                {/* Screen content */}
                <div className="h-full overflow-hidden transition-all duration-500">
                  {screens[activeScreen].content}
                </div>
              </div>
            </div>
          </div>

          {/* Screen Selector */}
          <div className="flex-1 space-y-4 w-full lg:max-w-md">
            {screens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => setActiveScreen(index)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                  activeScreen === index
                    ? 'bg-midnight-surface border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-midnight-surface/30 border-midnight-border hover:border-midnight-borderSubtle hover:bg-midnight-surface/50'
                }`}
              >
                <h4 className={`font-heading font-semibold mb-1 ${
                  activeScreen === index ? 'text-midnight-text' : 'text-midnight-textSecondary'
                }`}>
                  {screen.title}
                </h4>
                <p className="text-sm text-midnight-muted">
                  {screen.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
