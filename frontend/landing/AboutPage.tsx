import React from 'react';
import { Link } from 'react-router-dom';
import { LandingNavbar } from './components/LandingNavbar';
import { Footer } from './components/Footer';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-midnight-bg">
      <LandingNavbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[150px] rounded-full" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
              Our Story
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-midnight-text mb-6">
              Why we built Softspace
            </h1>
            <p className="text-lg md:text-xl text-midnight-textSecondary">
              Because everyone deserves a space to breathe, reflect, and feel heard.
            </p>
          </div>
        </section>

        {/* Creator's Note */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-invert prose-lg max-w-none">
              <h2 className="font-heading text-3xl font-bold text-midnight-text mb-6">
                Creator's Note
              </h2>

              <div className="not-prose mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl bg-midnight-surface border border-midnight-border">
                  <img 
                    src="/profile.jpeg" 
                    alt="Danida Jayakody" 
                    className="w-44 h-44 rounded-full border-2 border-midnight-border object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-heading text-lg font-semibold text-midnight-text">Danida Jayakody</div>
                    <div className="text-sm text-midnight-textSecondary">Founder & Engineer</div>
                  </div>
                </div>
              </div>

              <p className="text-midnight-textSecondary leading-relaxed mb-6">
                I built Softspace because mental health support shouldn't be a luxury — and because the hardest moments often happen between appointments, between conversations, and late at night when you just need a calm space.
              </p>
              <p className="text-midnight-textSecondary leading-relaxed mb-6">
                This app is not a replacement for professional care. It’s meant to be a gentle companion for reflection, grounding, and making sense of your feelings in a way that’s private, non-judgmental, and accessible.
              </p>
              <p className="text-midnight-textSecondary leading-relaxed">
                If you're reading this, thank you for trusting something I've made. My hope is that Softspace feels like a small pocket of safety — and helps you take one kind step at a time.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-midnight-surface/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl font-bold text-midnight-text mb-12 text-center">
              Our Core Beliefs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: "🌱",
                  title: "Progress over perfection",
                  description: "We don't believe in streaks or guilt-trips. Growth isn't linear, and that's okay.",
                },
                {
                  icon: "🔒",
                  title: "Privacy is non-negotiable",
                  description: "Your thoughts are sacred. We encrypt everything and never share your data.",
                },
                {
                  icon: "💜",
                  title: "Compassion in every interaction",
                  description: "Our AI is designed to listen without judgment, respond with warmth, and meet you where you are.",
                },
                {
                  icon: "🌍",
                  title: "Accessibility matters",
                  description: "Mental wellness support should be available to everyone, regardless of circumstance.",
                },
              ].map((value, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-midnight-surface border border-midnight-border"
                >
                  <span className="text-3xl mb-4 block">{value.icon}</span>
                  <h3 className="font-heading text-xl font-semibold text-midnight-text mb-2">
                    {value.title}
                  </h3>
                  <p className="text-midnight-textSecondary">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Not a replacement */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <h2 className="font-heading text-2xl font-bold text-midnight-text mb-4">
                A complement, not a replacement
              </h2>
              <p className="text-midnight-textSecondary leading-relaxed mb-4">
                We want to be clear: Softspace is not a substitute for professional mental health care. If you're struggling with a clinical condition, we encourage you to seek help from a licensed therapist or counselor.
              </p>
              <p className="text-midnight-textSecondary leading-relaxed">
                Think of us as the space between — support for daily reflection, a companion for processing emotions, and a gentle nudge toward self-understanding. We're here to complement your journey, not replace the professionals who can provide clinical care.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-midnight-text mb-6">
              Ready to explore your calm space?
            </h2>
            <p className="text-lg text-midnight-textSecondary mb-8">
              Join us on a journey toward gentle self-discovery.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5"
            >
              Begin Your Journey
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
