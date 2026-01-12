import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-midnight-bg relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 text-center px-4">
        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[180px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-midnight-accent via-purple-400 to-blue-400 leading-none">
            404
          </h1>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Lost in Space
          </h2>
          <p className="text-midnight-muted text-lg max-w-md mx-auto">
            The page you're looking for seems to have drifted into a different galaxy.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-midnight-accent text-white hover:bg-midnight-accentHover transition-colors font-medium"
          >
            Return Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl border border-midnight-border text-midnight-muted hover:text-white hover:border-midnight-accent/50 transition-all font-medium"
          >
            Go Back
          </button>
        </div>

        {/* Decorative elements */}
        <div className="mt-16 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-midnight-accent/50 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-purple-500/50 animate-pulse [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
};
