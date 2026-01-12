import React from 'react';

const pacePoints = [
  {
    icon: "🚫",
    title: "No streaks to maintain",
    description: "Miss a day? That's okay. There's no guilt-tripping here.",
  },
  {
    icon: "⏰",
    title: "No time pressure",
    description: "Chat for 2 minutes or 2 hours. There's no rush.",
  },
  {
    icon: "🎯",
    title: "No perfection expected",
    description: "Progress isn't linear. Neither is healing.",
  },
  {
    icon: "🤫",
    title: "No judgment, ever",
    description: "Express yourself freely. This space is yours.",
  },
];

export const PaceSection: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-midnight-bg" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-px h-64 bg-gradient-to-b from-transparent via-midnight-border to-transparent" />
      <div className="absolute top-1/2 right-0 w-px h-64 bg-gradient-to-b from-transparent via-midnight-border to-transparent" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
          Your Pace, Your Space
        </span>
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-midnight-text mb-6">
          This isn't another app to feel guilty about
        </h2>
        <p className="text-lg text-midnight-textSecondary max-w-2xl mx-auto mb-12">
          We believe in gentle progress. There are no notifications shaming you, no algorithms demanding attention, and no pressure to be consistent.
        </p>

        {/* Pace Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pacePoints.map((point, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-midnight-surface/30 border border-midnight-border text-left hover:border-midnight-borderSubtle transition-all"
            >
              <span className="text-3xl mb-3 block">{point.icon}</span>
              <h3 className="font-heading text-lg font-semibold text-midnight-text mb-2">
                {point.title}
              </h3>
              <p className="text-midnight-textSecondary text-sm">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-midnight-border">
          <p className="text-xl md:text-2xl text-midnight-text italic font-light">
            "The goal isn't to be perfect. It's to be a little kinder to yourself each day."
          </p>
        </div>
      </div>
    </section>
  );
};
