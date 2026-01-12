import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-midnight-bg relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full" />
      
      {/* Back to Home button */}
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-midnight-muted hover:text-white transition-colors group">
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm">Back to Home</span>
      </Link>

      {/* Login card */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-midnight-surface backdrop-blur-xl border border-midnight-border shadow-2xl relative z-10 mx-4">
        {/* Subtle gradient at top */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-midnight-accent/5 to-transparent rounded-t-2xl pointer-events-none" />
        
        <div className="text-center mb-8 relative">
          {/* Logo/Brand */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <img
              src={`${import.meta.env.BASE_URL}icons/icon.png`}
              alt="Softspace"
              className="w-14 h-14 object-contain"
              draggable={false}
            />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-midnight-text mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-midnight-textSecondary text-sm">
            Sign in to continue your journey
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
          <Input 
            type="password" 
            placeholder="••••••••" 
            label="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            required
          />
          
          <div className="flex justify-end">
            <Link 
              to="/forgot-password" 
              className="text-sm text-midnight-accent hover:text-midnight-highlight transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" fullWidth variant="primary" isLoading={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-midnight-border text-center text-sm text-midnight-textSecondary">
          Don't have an account?{' '}
          <Link to="/signup" className="text-midnight-accent hover:text-midnight-highlight font-medium transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};