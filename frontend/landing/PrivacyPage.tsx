import React from 'react';
import { Link } from 'react-router-dom';
import { LandingNavbar } from './components/LandingNavbar';
import { Footer } from './components/Footer';

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

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-midnight-bg">
      <LandingNavbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-green-500/10 blur-[150px] rounded-full" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-sm font-medium mb-4">
              Privacy First
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-midnight-text mb-6">
              Your thoughts deserve protection
            </h1>
            <p className="text-lg md:text-xl text-midnight-textSecondary">
              We built Softspace with privacy at its core. Mental health is deeply personal, and your data should reflect that.
            </p>
          </div>
        </section>

        {/* Privacy Points */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {privacyPoints.map((point, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-midnight-surface border border-midnight-border"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
                    {point.icon}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-midnight-text mb-2">
                    {point.title}
                  </h3>
                  <p className="text-midnight-textSecondary">
                    {point.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Policy */}
        <section className="py-16 md:py-24 bg-midnight-surface/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
              <h2 className="font-heading text-3xl font-bold text-midnight-text">
                Privacy Policy Details
              </h2>
              <Link
                to="/privacy-policy"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-4"
              >
                Read the full Privacy Policy
              </Link>
            </div>

            <div className="space-y-8 text-midnight-textSecondary">
              <div>
                <h3 className="font-heading text-xl font-semibold text-midnight-text mb-3">
                  What we collect
                </h3>
                <p className="leading-relaxed mb-3">
                  We collect only what's necessary to provide you with a personalized experience:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Account information (email, password hash)</li>
                  <li>Your conversations with Softspace (your AI companion)</li>
                  <li>Mood entries and journal entries you choose to save</li>
                  <li>Goals and therapeutic progress data</li>
                </ul>
              </div>

              <div>
                <h3 className="font-heading text-xl font-semibold text-midnight-text mb-3">
                  How we use your data
                </h3>
                <p className="leading-relaxed">
                  Your data is used solely to provide you with a personalized experience within Softspace. 
                  We use it to remember your conversation context, track your mood patterns over time, 
                  and help you visualize your mental wellness journey. We do NOT use your data for advertising, 
                  sell it to third parties, or use it to train AI models.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-xl font-semibold text-midnight-text mb-3">
                  Data storage & security
                </h3>
                <p className="leading-relaxed">
                  Your data is stored securely using industry-standard encryption. We use secure cloud 
                  infrastructure with encryption at rest and in transit. Access to your data is strictly 
                  limited and protected by authentication systems.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-xl font-semibold text-midnight-text mb-3">
                  Your rights
                </h3>
                <p className="leading-relaxed mb-3">
                  You have complete control over your data:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> View all data we have about you</li>
                  <li><strong>Export:</strong> Download your data in a portable format</li>
                  <li><strong>Delete:</strong> Permanently erase all your data with one click</li>
                  <li><strong>Correction:</strong> Update or correct your information anytime</li>
                </ul>
              </div>

              <div>
                <h3 className="font-heading text-xl font-semibold text-midnight-text mb-3">
                  AI & Third Parties
                </h3>
                <p className="leading-relaxed">
                  We use AI models to power Softspace, your companion. When you chat, your messages are sent to 
                  AI providers for processing, but are not stored by them or used for training their models. 
                  We do not share your data with advertisers, data brokers, or any third parties for 
                  commercial purposes.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-xl font-semibold text-midnight-text mb-3">
                  Contact us
                </h3>
                <p className="leading-relaxed">
                  If you have questions about your privacy or data, please reach out to us. We're here 
                  to help and will respond to all inquiries promptly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-midnight-text mb-6">
              Feel safe exploring your calm space
            </h2>
            <p className="text-lg text-midnight-textSecondary mb-8">
              Your privacy is protected. Begin your journey with confidence.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5"
            >
              Get Started
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
