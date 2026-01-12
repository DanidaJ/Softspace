import React from 'react';
import { Link } from 'react-router-dom';

const privacyPoints = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Your data stays yours",
    description: "Your conversations, moods, and journals are encrypted and never shared with third parties.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    title: "No ads, ever",
    description: "Your mental health journey isn't a product. We don't monetize your data or show ads.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Not used for AI training",
    description: "Your personal data is never used to train AI models. Your thoughts remain private.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    title: "Delete everything, anytime",
    description: "You have full control. Delete your account and all data permanently with one click.",
  },
];

export const PrivacySection: React.FC = () => {
  return (
    <section id="privacy" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-bg via-midnight-surface/30 to-midnight-bg" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-green-500/5 blur-[150px] rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Content */}
          <div className="flex-1">
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-sm font-medium mb-4">
              Privacy First
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-midnight-text mb-6">
              Your thoughts deserve protection
            </h2>
            <p className="text-lg text-midnight-textSecondary mb-8">
              We built Softspace with privacy at its core. Mental health is deeply personal, and your data should reflect that.
            </p>

            <div className="space-y-6">
              {privacyPoints.map((point, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                    {point.icon}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-midnight-text mb-1">
                      {point.title}
                    </h3>
                    <p className="text-midnight-textSecondary text-sm">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-6">
                <Link
                  to="/privacy-policy"
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                >
                  Read our full privacy policy
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>

                <Link
                  to="/terms"
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                >
                  Terms of Service
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex-shrink-0">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
              
              {/* Badge */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-midnight-surface to-midnight-elevated border border-midnight-border flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-bold text-midnight-text mb-2">
                  Privacy Protected
                </h3>
                <p className="text-sm text-midnight-textSecondary">
                  Your data is encrypted and never sold or shared
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
