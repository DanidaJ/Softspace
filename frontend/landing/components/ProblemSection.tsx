import React from 'react';

const problems = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    title: "Racing thoughts at 2 AM",
    description: "When everyone's asleep but your mind won't stop spinning, and you need someone to listen.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Not sure how you feel",
    description: "Sometimes emotions are tangled, and you need a gentle way to understand what's really going on inside.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Feeling alone in the struggle",
    description: "When you don't want to burden friends or family, but still need someone to talk to.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Wanting to journal but don't know how",
    description: "Blank pages feel intimidating, and you wish someone could guide your reflection.",
  },
];

export const ProblemSection: React.FC = () => {
  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-bg via-midnight-surface/50 to-midnight-bg" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
            We understand
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-midnight-text mb-6">
            You're not alone in feeling this way
          </h2>
          <p className="text-lg text-midnight-textSecondary max-w-2xl mx-auto">
            Life gets overwhelming. Sometimes you just need a space to breathe, reflect, and feel heard — without pressure or judgment.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group p-6 md:p-8 rounded-2xl bg-midnight-surface/50 border border-midnight-border hover:border-midnight-borderSubtle transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  {problem.icon}
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold text-midnight-text mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-midnight-textSecondary leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transition text */}
        <div className="text-center mt-16">
          <p className="text-lg text-midnight-muted italic">
            "What if you had a companion who's always there, ready to listen?"
          </p>
        </div>
      </div>
    </section>
  );
};
