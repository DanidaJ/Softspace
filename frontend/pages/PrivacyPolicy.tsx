import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-midnight-bg text-midnight-text">
      {/* Header */}
      <div className="border-b border-midnight-border bg-midnight-bg/95 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-midnight-muted hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to App
          </button>
          <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Last Updated */}
          <div className="text-sm text-midnight-muted">
            Last Updated: December 23, 2025
          </div>

          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Your Privacy Matters</h2>
            <p className="text-midnight-muted leading-relaxed">
              At Softspace, we take your privacy seriously. This policy explains how we collect, use, 
              and protect your personal information when you use our AI-powered mental wellness platform.
            </p>
          </section>

          {/* What We Collect */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">What Information We Collect</h2>
            <div className="space-y-3 text-midnight-muted">
              <div>
                <h3 className="font-semibold text-white mb-2">Account Information</h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Email address and name (for account creation)</li>
                  <li>Authentication credentials (securely hashed via Supabase)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Usage Data</h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Conversations with the AI companion</li>
                  <li>Journal entries and mood logs</li>
                  <li>Task and goal tracking data</li>
                  <li>Session timestamps and activity patterns</li>
                  <li>Emotional insights and detected themes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">How We Use Your Data</h2>
            <ul className="list-disc ml-5 space-y-2 text-midnight-muted">
              <li>To provide personalized AI responses and therapeutic support</li>
              <li>To generate insights about your emotional patterns and progress</li>
              <li>To improve the platform's effectiveness and user experience</li>
              <li>To detect crisis situations and provide appropriate resources</li>
              <li>To send you important updates (if you've opted in)</li>
            </ul>
            <div className="p-4 bg-midnight-accent/10 border border-midnight-accent/30 rounded-lg mt-4">
              <p className="text-sm text-midnight-highlight">
                <strong>We never sell your data.</strong> Your conversations and personal information 
                are not shared with third parties for advertising or marketing purposes.
              </p>
            </div>
          </section>

          {/* AI & Third-Party Services */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">AI Processing & Third-Party Services</h2>
            <div className="space-y-3 text-midnight-muted">
              <p>
                <strong className="text-white">Google Gemini AI:</strong> Your messages are sent to 
                Google's Gemini AI to generate therapeutic responses. Google's use of this data is 
                governed by their own privacy policy. We send only the necessary conversation context.
              </p>
              <p>
                <strong className="text-white">Supabase:</strong> We use Supabase for authentication 
                and database services. Your data is encrypted at rest and in transit.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">How We Protect Your Data</h2>
            <ul className="list-disc ml-5 space-y-2 text-midnight-muted">
              <li>End-to-end encryption for data transmission (HTTPS/TLS)</li>
              <li>Database encryption at rest via Supabase</li>
              <li>Secure authentication with JWT tokens</li>
              <li>Regular security updates and monitoring</li>
              <li>Limited access controls - only you can access your data</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Your Rights & Control</h2>
            <div className="space-y-3 text-midnight-muted">
              <p>You have the right to:</p>
              <ul className="list-disc ml-5 space-y-2">
                <li><strong className="text-white">Access:</strong> View all data we have about you</li>
                <li><strong className="text-white">Export:</strong> Download your conversations and journal entries</li>
                <li><strong className="text-white">Delete:</strong> Request complete deletion of your account and data</li>
                <li><strong className="text-white">Correct:</strong> Update or correct your personal information</li>
                <li><strong className="text-white">Opt-out:</strong> Stop receiving notifications or promotional messages</li>
              </ul>
              <div className="mt-4 p-4 bg-midnight-surface border border-midnight-border rounded-lg">
                <p className="text-sm">
                  To exercise any of these rights, please contact us at{' '}
                  <a href="mailto:privacy@softspace.app" className="text-midnight-accent underline hover:text-midnight-accentHover">
                    privacy@softspace.app
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Data Retention</h2>
            <p className="text-midnight-muted">
              We retain your data for as long as your account is active. If you delete your account, 
              we will permanently delete your data within 30 days, except where we are legally required 
              to retain certain information.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Children's Privacy</h2>
            <p className="text-midnight-muted">
              Our service is not intended for users under 13 years of age. We do not knowingly collect 
              personal information from children. If we become aware that a child has provided us with 
              personal information, we will delete it immediately.
            </p>
          </section>

          {/* Crisis Situations */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Crisis Situations & Safety</h2>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-100/90">
                If our AI detects language indicating you may be in crisis or at risk of harm, we may 
                flag this for safety purposes. We may also display crisis resources and hotlines. In 
                extreme cases where there is imminent danger, we reserve the right to contact emergency 
                services if you've provided emergency contact information.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Changes to This Policy</h2>
            <p className="text-midnight-muted">
              We may update this privacy policy from time to time. We will notify you of any significant 
              changes via email or through the app. Your continued use of the platform after changes 
              constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Contact Us</h2>
            <p className="text-midnight-muted">
              If you have questions or concerns about this privacy policy or your data:
            </p>
            <div className="p-4 bg-midnight-surface border border-midnight-border rounded-lg">
              <p className="text-sm text-midnight-muted">
                Email: <a href="mailto:privacy@softspace.app" className="text-midnight-accent underline hover:text-midnight-accentHover">privacy@softspace.app</a>
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-8 border-t border-midnight-border">
            <p className="text-sm text-midnight-muted text-center">
              By using Softspace, you agree to this Privacy Policy and our{' '}
              <button
                onClick={() => navigate('/terms')}
                className="text-midnight-accent underline hover:text-midnight-accentHover"
              >
                Terms of Service
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
