import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LandingNavbar } from './components/LandingNavbar';
import { Footer } from './components/Footer';

const faqs = [
  {
    question: "Is Softspace free to use?",
    answer: "Yes! The core features are completely free. We believe mental wellness support should be accessible to everyone. We may offer premium features in the future, but the essential experience will always remain free.",
  },
  {
    question: "How does the AI companion work?",
    answer: "Softspace, your AI companion, uses advanced language models to have natural conversations with you. It remembers context from your sessions, understands your goals, and provides thoughtful, empathetic responses. It's designed to support your reflection and wellness journey, not to diagnose or treat conditions.",
  },
  {
    question: "Can I trust the AI with my personal thoughts?",
    answer: "Absolutely. Your conversations are encrypted and stored securely. We don't share your data with third parties, use it for advertising, or train AI models on your personal information. You can delete your data at any time.",
  },
  {
    question: "Will this replace my therapist?",
    answer: "No, and it's not meant to. Softspace is designed to complement professional care, not replace it. It's great for daily check-ins, reflection between sessions, or for those who don't have access to therapy. For clinical conditions, we always recommend professional support.",
  },
  {
    question: "What if I'm in a crisis?",
    answer: "If you're experiencing a mental health emergency, please contact professional crisis services immediately. Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741 (Crisis Text Line). Softspace is not equipped to handle crisis situations.",
  },
  {
    question: "How is my data protected?",
    answer: "Your data is encrypted both in transit and at rest. We use industry-standard security practices. You have full control over your data — you can export it or delete everything permanently at any time through your account settings.",
  },
  {
    question: "What features does Softspace offer?",
    answer: "Softspace includes: conversational AI support with Softspace, mood tracking with visualizations, guided journaling, breathing and grounding exercises, therapeutic goal setting, and progress insights — all in a calming, gentle environment.",
  },
  {
    question: "Can I use Softspace on mobile?",
    answer: "Yes! Softspace is fully responsive and works beautifully on mobile browsers. A dedicated mobile app may be available in the future.",
  },
  {
    question: "How does the mood tracking work?",
    answer: "You can log your mood throughout the day with simple selections. Over time, you'll see patterns and trends visualized in your personal dashboard. This helps you understand your emotional rhythms and identify triggers.",
  },
  {
    question: "Is my data used to train AI?",
    answer: "No. Your personal data is never used to train AI models. When you chat with Softspace, the conversation is processed by AI providers but is not stored by them for training purposes. Your thoughts remain your own.",
  },
];

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-midnight-bg">
      <LandingNavbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-4">
              Questions?
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-midnight-text mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-midnight-textSecondary">
              Everything you need to know about Softspace.
            </p>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-300 ${
                    openIndex === index
                      ? 'bg-midnight-surface border-midnight-borderSubtle shadow-lg'
                      : 'bg-midnight-surface/30 border-midnight-border hover:border-midnight-borderSubtle'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                  >
                    <h3 className={`font-heading font-semibold ${
                      openIndex === index ? 'text-midnight-text' : 'text-midnight-textSecondary'
                    }`}>
                      {faq.question}
                    </h3>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-midnight-elevated flex items-center justify-center transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}>
                      <svg className="w-5 h-5 text-midnight-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}>
                    <p className="px-6 pb-5 text-midnight-textSecondary leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Still have questions */}
        <section className="py-16 md:py-24 bg-midnight-surface/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-heading text-3xl font-bold text-midnight-text mb-4">
              Still have questions?
            </h2>
            <p className="text-lg text-midnight-textSecondary mb-8">
              Can't find what you're looking for? Feel free to reach out.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/about"
                className="px-6 py-3 text-midnight-textSecondary hover:text-midnight-text border border-midnight-border hover:border-midnight-borderSubtle rounded-xl transition-all hover:bg-white/5"
              >
                Learn More About Us
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
