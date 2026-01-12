import React from 'react';

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Talk to Softspace, Your AI Companion",
    description: "A gentle, understanding AI that listens without judgment and remembers your journey. Available 24/7 for those late-night moments.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "Track Your Emotional Universe",
    description: "Visualize your moods over time with beautiful cosmic-themed charts. Spot patterns and understand yourself better.",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: "Guided Journaling",
    description: "No more blank page anxiety. Thoughtful prompts help you explore your thoughts and discover insights about yourself.",
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Coping Tools & Exercises",
    description: "Breathing exercises, grounding techniques, and mindfulness tools for when you need immediate calm.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Gentle Progress Tracking",
    description: "Set wellness goals and watch your growth — without pressure. No streaks to maintain, just gentle encouragement.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Therapeutic Memory",
    description: "Softspace remembers what matters to you — your goals, struggles, and breakthroughs — providing personalized support over time.",
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-500/10",
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-midnight-bg" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-4">
            How It Helps
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-midnight-text mb-6">
            Your personal wellness universe
          </h2>
          <p className="text-lg text-midnight-textSecondary max-w-2xl mx-auto">
            Every tool is designed with care — to support you, not overwhelm you. Go at your own pace.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 md:p-8 rounded-2xl bg-midnight-surface/30 border border-midnight-border hover:border-midnight-borderSubtle transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <div className={`bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`}>
                  <div className="text-blue-400">{feature.icon}</div>
                </div>
              </div>
              <h3 className="font-heading text-xl font-semibold text-midnight-text mb-3">
                {feature.title}
              </h3>
              <p className="text-midnight-textSecondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
