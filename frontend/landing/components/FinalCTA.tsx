import React from 'react';
import { Link } from 'react-router-dom';

export const FinalCTA: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-bg via-midnight-surface/50 to-midnight-bg" />
      
      {/* Animated orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Stars decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-midnight-text mb-6">
            Ready to find your calm?
          </h2>
          <p className="text-lg md:text-xl text-midnight-textSecondary max-w-2xl mx-auto mb-10">
            Your private space in the cosmos is waiting. No credit card required. No commitments. Just a gentle step toward feeling a little better.
          </p>

          {/* CTA Button */}
          <Link
            to="/signup"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-semibold text-lg rounded-2xl shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-1"
          >
            Begin Your Journey
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          {/* Trust note */}
          <p className="mt-8 text-sm text-midnight-muted">
            🔒 Your data is encrypted and never shared
          </p>
        </div>
      </div>
    </section>
  );
};
