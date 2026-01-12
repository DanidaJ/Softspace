import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Button } from '../components/Button';

interface VerifyEmailProps {
  email?: string;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ email }) => {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address not available. Please try signing up again.');
      return;
    }

    setResending(true);
    setError('');

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (resendError) throw resendError;
      
      setResent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-midnight-bg relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full" />

      {/* Card */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-midnight-surface backdrop-blur-xl border border-midnight-border shadow-2xl relative z-10 mx-4 text-center">
        {/* Subtle gradient at top */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-t-2xl pointer-events-none" />

        {/* Email icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          {/* Animated ring */}
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-indigo-400/30 animate-ping" style={{ animationDuration: '2s' }} />
        </div>

        <h1 className="text-2xl font-bold text-midnight-text mb-2 font-display relative">
          Check Your Email
        </h1>
        
        <p className="text-midnight-muted mb-6 relative">
          We've sent a verification link to{' '}
          {email ? (
            <span className="text-indigo-400 font-medium">{email}</span>
          ) : (
            'your email address'
          )}
          . Please click the link to verify your account.
        </p>

        <div className="bg-midnight-bg/50 rounded-xl p-4 mb-6 relative">
          <h3 className="text-sm font-medium text-midnight-text mb-2">
            Didn't receive the email?
          </h3>
          <ul className="text-sm text-midnight-muted text-left space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              Check your spam or junk folder
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              Make sure you entered the correct email
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              Wait a few minutes and try again
            </li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm relative">
            {error}
          </div>
        )}

        {resent && !error && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm relative">
            Verification email sent! Please check your inbox.
          </div>
        )}

        <div className="space-y-3 relative">
          {email && (
            <Button
              variant="secondary"
              fullWidth
              onClick={handleResendEmail}
              disabled={resending || resent}
            >
              {resending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : resent ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email Sent
                </span>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          )}

          <Link to="/login">
            <Button variant="ghost" fullWidth>
              Back to Login
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-midnight-muted relative">
          Already verified?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
