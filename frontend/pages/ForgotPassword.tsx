import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-midnight-bg">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/20 blur-[120px] rounded-full" />

        <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 mx-4 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
          <p className="text-gray-400 text-sm mb-6">
            We've sent a password reset link to <span className="text-white font-medium">{email}</span>
          </p>
          <p className="text-gray-500 text-xs mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <Link 
            to="/login" 
            className="inline-block px-6 py-2.5 rounded-xl bg-midnight-accent text-white hover:bg-midnight-accentHover transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-midnight-bg">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/20 blur-[120px] rounded-full" />

      <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 mx-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-400 text-sm">Enter your email and we'll send you a recovery link.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <Input 
            type="email" 
            placeholder="you@example.com" 
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            required
          />
          
          <Button type="submit" fullWidth variant="primary" isLoading={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};