import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../utils/supabase';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setValidSession(!!session);
    };
    checkSession();

    // Listen for auth state changes (when user clicks the reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking session
  if (validSession === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-midnight-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-midnight-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-midnight-muted text-sm">Verifying reset link...</span>
        </div>
      </div>
    );
  }

  // Invalid or expired link
  if (!validSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-midnight-bg">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/20 blur-[120px] rounded-full" />

        <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 mx-4 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Link Expired</h1>
          <p className="text-gray-400 text-sm mb-6">
            This password reset link has expired or is invalid. Please request a new one.
          </p>
          <Link 
            to="/forgot-password" 
            className="inline-block px-6 py-2.5 rounded-xl bg-midnight-accent text-white hover:bg-midnight-accentHover transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  // Success state
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
          <h1 className="text-2xl font-bold text-white mb-2">Password Updated!</h1>
          <p className="text-gray-400 text-sm mb-6">
            Your password has been successfully updated. Redirecting you to login...
          </p>
          <Link 
            to="/login" 
            className="inline-block px-6 py-2.5 rounded-xl bg-midnight-accent text-white hover:bg-midnight-accentHover transition-colors"
          >
            Go to Login
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
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <img
              src={`${import.meta.env.BASE_URL}icons/icon.png`}
              alt="Softspace"
              className="w-12 h-12 object-contain"
              draggable={false}
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
          <p className="text-gray-400 text-sm">Choose a strong password for your account.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <Input 
            type="password" 
            placeholder="••••••••" 
            label="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            required
          />

          <Input 
            type="password" 
            placeholder="••••••••" 
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            required
          />

          {/* Password requirements */}
          <div className="p-3 rounded-xl bg-midnight-surface border border-midnight-border">
            <p className="text-xs text-midnight-muted mb-2">Password must contain:</p>
            <ul className="text-xs space-y-1">
              <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                <span>{password.length >= 8 ? '✓' : '○'}</span> At least 8 characters
              </li>
              <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span> One uppercase letter
              </li>
              <li className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                <span>{/[a-z]/.test(password) ? '✓' : '○'}</span> One lowercase letter
              </li>
              <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                <span>{/[0-9]/.test(password) ? '✓' : '○'}</span> One number
              </li>
            </ul>
          </div>
          
          <Button type="submit" fullWidth variant="primary" isLoading={loading}>
            {loading ? 'Updating...' : 'Update Password'}
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
