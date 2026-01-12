import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { Dashboard } from './pages/Dashboard';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { NotFound } from './pages/NotFound';
import { LandingPage, AboutPage, PrivacyPage, FAQPage } from './landing';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading while checking auth status to prevent redirect flash
  if (loading) {
    return (
      <div className="h-screen w-screen bg-midnight-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-midnight-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-midnight-muted text-sm">Loading...</span>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Redirect authenticated users away from landing/auth pages
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-screen bg-midnight-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-midnight-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-midnight-muted text-sm">Loading...</span>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/app" /> : <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      
      {/* Auth Pages - redirect to app if already logged in */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* Protected App Routes */}
      <Route 
        path="/app" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/*" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* 404 - Catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;