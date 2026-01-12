import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LandingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `px-4 py-2 transition-colors rounded-lg hover:bg-white/5 ${
      isActive(path) ? 'text-midnight-text' : 'text-midnight-textSecondary hover:text-midnight-text'
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-midnight-bg/80 backdrop-blur-xl border-b border-midnight-border shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <img
                src={`${import.meta.env.BASE_URL}icons/icon.png`}
                alt="Softspace"
                className="w-9 h-9 object-contain scale-1"
                draggable={false}
              />
            </div>
            <span className="font-heading font-semibold text-xl text-midnight-text hidden sm:block">
              Softspace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={navLinkClass('/')}>
              Home
            </Link>
            <Link to="/about" className={navLinkClass('/about')}>
              About
            </Link>
            <Link to="/privacy" className={navLinkClass('/privacy')}>
              Privacy
            </Link>
            <Link to="/terms" className={navLinkClass('/terms')}>
              Terms
            </Link>
            <Link to="/faq" className={navLinkClass('/faq')}>
              FAQ
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-midnight-text text-sm max-w-[120px] truncate">
                    {user.email?.split('@')[0] || 'User'}
                  </span>
                  <svg className="w-4 h-4 text-midnight-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-midnight-surface border border-midnight-border rounded-xl shadow-xl overflow-hidden z-50">
                    <Link
                      to="/app"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-3 text-sm text-midnight-text hover:bg-midnight-bg transition-colors"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        try {
                          await logout();
                        } finally {
                          navigate('/');
                        }
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-midnight-bg transition-colors border-t border-midnight-border"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-midnight-textSecondary hover:text-midnight-text transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-400 hover:to-indigo-500 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-midnight-textSecondary hover:text-midnight-text hover:bg-white/5 transition-colors"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-midnight-surface/95 backdrop-blur-xl border-b border-midnight-border">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-3 hover:bg-white/5 rounded-lg transition-colors ${
                isActive('/') ? 'text-midnight-text' : 'text-midnight-textSecondary hover:text-midnight-text'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-3 hover:bg-white/5 rounded-lg transition-colors ${
                isActive('/about') ? 'text-midnight-text' : 'text-midnight-textSecondary hover:text-midnight-text'
              }`}
            >
              About
            </Link>
            <Link
              to="/privacy"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-3 hover:bg-white/5 rounded-lg transition-colors ${
                isActive('/privacy') ? 'text-midnight-text' : 'text-midnight-textSecondary hover:text-midnight-text'
              }`}
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-3 hover:bg-white/5 rounded-lg transition-colors ${
                isActive('/terms') ? 'text-midnight-text' : 'text-midnight-textSecondary hover:text-midnight-text'
              }`}
            >
              Terms
            </Link>
            <Link
              to="/faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-3 hover:bg-white/5 rounded-lg transition-colors ${
                isActive('/faq') ? 'text-midnight-text' : 'text-midnight-textSecondary hover:text-midnight-text'
              }`}
            >
              FAQ
            </Link>
            <div className="pt-4 border-t border-midnight-border space-y-2">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/app"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 text-midnight-text hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      try {
                        await logout();
                      } finally {
                        navigate('/');
                      }
                    }}
                    className="block w-full text-center px-4 py-3 text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 text-midnight-textSecondary hover:text-midnight-text hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
