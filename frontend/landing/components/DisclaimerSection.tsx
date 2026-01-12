import React from 'react';

export const DisclaimerSection: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-midnight-bg" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium mb-4">
            Important to Know
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-midnight-text mb-6">
            What Softspace is — and isn't
          </h2>
          <p className="text-lg text-midnight-textSecondary">
            We believe in transparency about our capabilities and limitations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* What it IS */}
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-green-400">What it IS</h3>
            </div>
            <ul className="space-y-4">
              {[
                "A supportive AI companion for daily check-ins",
                "A space for reflection and emotional processing",
                "Tools for mindfulness and self-care",
                "A way to track your wellness journey",
                "Support between therapy sessions",
                "Available 24/7 when you need to talk",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-midnight-textSecondary">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* What it ISN'T */}
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-red-500/5 to-rose-500/5 border border-red-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-red-400">What it ISN'T</h3>
            </div>
            <ul className="space-y-4">
              {[
                "A replacement for professional therapy",
                "A medical or mental health diagnosis tool",
                "A crisis intervention service",
                "A substitute for medication",
                "Qualified to treat mental illness",
                "A replacement for human connection",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-midnight-textSecondary">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Crisis Resources */}
        <div className="mt-12 p-6 rounded-2xl bg-midnight-surface border border-midnight-border">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-midnight-text mb-2">
                If you're in crisis
              </h3>
              <p className="text-midnight-textSecondary mb-4">
                If you're experiencing a mental health emergency, please reach out to professional crisis services:
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="tel:988" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  988 Suicide & Crisis Lifeline
                </a>
                <a href="sms:741741" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Text HOME to 741741
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
