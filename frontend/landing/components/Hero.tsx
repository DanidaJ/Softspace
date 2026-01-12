import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  // Generate static stars with CSS-only twinkle animation (no falling, no movement)
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 3 + 4}s`,
    }));
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Static gradient background */}
      <div 
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(to bottom, #0A0E17, #111827)' }}
      />

      {/* Subtle static stars with gentle twinkle (CSS only, no movement) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration,
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs - very subtle, slow breathing */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[180px] rounded-full animate-breathe" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[180px] rounded-full animate-breathe" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/5 blur-[150px] rounded-full" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-midnight-surface/50 border border-midnight-border backdrop-blur-sm mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-midnight-textSecondary">A soft space for your mind</span>
        </div>

        {/* Headline */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-midnight-text mb-6 leading-tight animate-slide-up">
          A calm space when your
          <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            mind feels loud
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-midnight-textSecondary max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          An AI companion that listens without judgment, helps you reflect, and gently supports your mental wellness journey.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link
            to="/signup"
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            Begin Your Journey
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 text-midnight-textSecondary hover:text-midnight-text border border-midnight-border hover:border-midnight-borderSubtle rounded-2xl transition-all hover:bg-white/5 flex items-center gap-2"
          >
            See How It Helps
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-midnight-muted animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Private & Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>No Judgment</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Your Pace</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-midnight-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};
