import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TermsOfService: React.FC = () => {
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
            Back
          </button>
          <h1 className="text-xl font-bold text-white">Terms of Service</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-sm text-midnight-muted">Last Updated: January 3, 2026</div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Welcome</h2>
            <p className="text-midnight-muted leading-relaxed">
              These Terms of Service ("Terms") govern your access to and use of Softspace,
              including our website, application, and related services (collectively, the "Service"). By
              accessing or using the Service, you agree to these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Important Safety Notice</h2>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-100/80 leading-relaxed">
                Softspace is an AI-powered wellness tool and is not a substitute for professional mental health
                care, medical advice, diagnosis, or treatment.
              </p>
              <p className="text-sm text-yellow-100/80 leading-relaxed mt-3">
                If you are in immediate danger or experiencing a crisis, call your local emergency number.
                If you are in the United States, you can call or text 988 (Suicide & Crisis Lifeline).
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Eligibility</h2>
            <p className="text-midnight-muted leading-relaxed">
              The Service is not intended for children under 13. By using the Service, you represent that you
              are at least 13 years old and that you have the legal capacity to enter into these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Your Account</h2>
            <ul className="list-disc ml-5 space-y-2 text-midnight-muted">
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You agree to provide accurate information and keep your account details up to date.</li>
              <li>You are responsible for activity that occurs under your account.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Acceptable Use</h2>
            <p className="text-midnight-muted leading-relaxed">You agree not to:</p>
            <ul className="list-disc ml-5 space-y-2 text-midnight-muted">
              <li>Use the Service for illegal activity or to violate any applicable laws.</li>
              <li>Attempt to access, probe, or disrupt our systems or other users’ data.</li>
              <li>Upload or transmit malware, or abuse rate limits and API protections.</li>
              <li>Use the Service to harm, threaten, or harass others.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">AI-Generated Content</h2>
            <div className="space-y-3 text-midnight-muted">
              <p>
                The Service may generate responses using artificial intelligence. AI can be incorrect,
                incomplete, or inappropriate. You agree to use your judgment and seek professional help when
                needed.
              </p>
              <p>
                You understand that AI responses are not professional therapy and should not be treated as
                clinical guidance.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Your Content</h2>
            <p className="text-midnight-muted leading-relaxed">
              You retain ownership of the content you submit (such as journal entries and chat messages).
              You grant us a limited license to process your content solely to provide and improve the
              Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Privacy</h2>
            <p className="text-midnight-muted leading-relaxed">
              Our collection and use of personal information is described in our Privacy Policy.
            </p>
            <div className="p-4 bg-midnight-surface border border-midnight-border rounded-lg">
              <button
                onClick={() => navigate('/privacy-policy')}
                className="text-midnight-accent underline hover:text-midnight-accentHover text-sm"
              >
                View Privacy Policy
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Termination</h2>
            <p className="text-midnight-muted leading-relaxed">
              We may suspend or terminate access to the Service if you violate these Terms or if we need to
              protect the Service, users, or the public. You may stop using the Service at any time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Disclaimers</h2>
            <p className="text-midnight-muted leading-relaxed">
              The Service is provided on an “as is” and “as available” basis. We make no warranties that the
              Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Limitation of Liability</h2>
            <p className="text-midnight-muted leading-relaxed">
              To the maximum extent permitted by law, we will not be liable for indirect, incidental,
              consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Changes to These Terms</h2>
            <p className="text-midnight-muted leading-relaxed">
              We may update these Terms from time to time. If changes are material, we will take reasonable
              steps to notify you (such as through the app or by email). Your continued use of the Service
              means you accept the updated Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Contact</h2>
            <div className="p-4 bg-midnight-surface border border-midnight-border rounded-lg">
              <p className="text-sm text-midnight-muted">
                Questions about these Terms? Email:{' '}
                <a
                  href="mailto:legal@softspace.app"
                  className="text-midnight-accent underline hover:text-midnight-accentHover"
                >
                  legal@softspace.app
                </a>
              </p>
            </div>
          </section>

          <div className="pt-8 border-t border-midnight-border">
            <p className="text-sm text-midnight-muted text-center">
              By using Softspace, you acknowledge that this is a wellness tool, not professional therapy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
