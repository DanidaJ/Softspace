import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { VerifyEmail } from './VerifyEmail';

// Validation utilities
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  return { valid: errors.length === 0, errors };
};

export const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [verificationPending, setVerificationPending] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password validation state
  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  
  // Check password match
  const passwordsMatch = password === confirmPassword;

  // Check if email is valid
  const emailValid = validateEmail(email);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    // Validate name
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    // Validate email
    if (!emailValid) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (!passwordValidation.valid) {
      setError('Password does not meet requirements');
      return;
    }

    // Check password match
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      await signup(email, password, name);
      // Show verification pending screen instead of navigating
      setVerificationPending(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show verification pending screen after successful signup
  if (verificationPending) {
    return <VerifyEmail email={email} />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-midnight-bg relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full" />
      
      {/* Back to Home button */}
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-midnight-muted hover:text-white transition-colors group">
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm">Back to Home</span>
      </Link>

      {/* Signup card */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-midnight-surface backdrop-blur-xl border border-midnight-border shadow-2xl relative z-10 mx-4">
        {/* Subtle gradient at top */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-t-2xl pointer-events-none" />
        
        <div className="text-center mb-8 relative">
          {/* Logo/Brand */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <img
              src={`${import.meta.env.BASE_URL}icons/icon.png`}
              alt="Softspace"
              className="w-14 h-14 object-contain"
              draggable={false}
            />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-midnight-text mb-2 tracking-tight">
            Create Account
          </h1>
          <p className="text-midnight-textSecondary text-sm">
            Begin your therapeutic journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          
          <Input 
            type="text" 
            placeholder="Your Name" 
            label="Full Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => handleBlur('name')}
            error={touched.name && !name.trim() ? 'Name is required' : undefined}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            required
          />
          <Input 
            type="email" 
            placeholder="you@example.com" 
            label="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            error={touched.email && email && !emailValid ? 'Please enter a valid email' : undefined}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            required
          />
          <div className="space-y-2">
            <Input 
              type="password" 
              placeholder="••••••••" 
              label="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              required
            />
            {/* Password requirements indicator */}
            {password && (
              <div className="p-3 rounded-lg bg-midnight-bg border border-midnight-border">
                <p className="text-xs text-midnight-muted mb-2">Password requirements:</p>
                <div className="grid grid-cols-2 gap-1">
                  <div className={`text-xs flex items-center gap-1.5 ${password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                    <span>{password.length >= 8 ? '✓' : '○'}</span> 8+ characters
                  </div>
                  <div className={`text-xs flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                    <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span> Uppercase
                  </div>
                  <div className={`text-xs flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                    <span>{/[a-z]/.test(password) ? '✓' : '○'}</span> Lowercase
                  </div>
                  <div className={`text-xs flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                    <span>{/[0-9]/.test(password) ? '✓' : '○'}</span> Number
                  </div>
                </div>
              </div>
            )}
          </div>

          <Input 
            type="password" 
            placeholder="••••••••" 
            label="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            error={touched.confirmPassword && confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            required
          />

          <div className="pt-2">
            <Button type="submit" fullWidth variant="primary" isLoading={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>

          <p className="text-xs text-center text-midnight-muted">
            By creating an account, you agree to our{' '}
            <Link to="/privacy" className="text-midnight-accent hover:underline">Privacy Policy</Link>
            {' '}and{' '}
            <Link to="/terms" className="text-midnight-accent hover:underline">Terms of Service</Link>
          </p>
        </form>

        <div className="mt-8 pt-6 border-t border-midnight-border text-center text-sm text-midnight-textSecondary">
          Already have an account?{' '}
          <Link to="/login" className="text-midnight-accent hover:text-midnight-highlight font-medium transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};