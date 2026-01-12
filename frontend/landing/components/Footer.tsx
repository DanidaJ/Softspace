import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-midnight-surface border-t border-midnight-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <img
                  src={`${import.meta.env.BASE_URL}icons/icon.png`}
                  alt="Softspace"
                  className="w-6 h-6 object-contain"
                  draggable={false}
                />
              </div>
              <span className="font-heading font-semibold text-xl text-midnight-text">
                Softspace
              </span>
            </Link>
            <p className="text-midnight-textSecondary text-sm max-w-sm mb-6">
              A soft space for your mind. AI-powered support for your mental wellness journey.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-midnight-muted">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-midnight-text mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-midnight-textSecondary hover:text-midnight-text transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-midnight-textSecondary hover:text-midnight-text transition-colors text-sm">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-midnight-textSecondary hover:text-midnight-text transition-colors text-sm">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-midnight-textSecondary hover:text-midnight-text transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-midnight-textSecondary hover:text-midnight-text transition-colors text-sm">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-midnight-text mb-4">Account</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-midnight-textSecondary hover:text-midnight-text transition-colors text-sm">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-midnight-textSecondary hover:text-midnight-text transition-colors text-sm">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-midnight-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-xs text-midnight-muted">
                © {currentYear} Nerdtastic🧠™ by Danida Jayakody
              </p>
              <p className="text-xs text-midnight-muted">
                Softspace is a project by Nerdtastic🧠™ | All rights reserved.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://danidajay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-blue-500/10 text-midnight-muted hover:text-blue-400 transition-all duration-200"
                title="Website"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/danida-jayakody-52a884200/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-blue-600/10 text-midnight-muted hover:text-blue-300 transition-all duration-200"
                title="LinkedIn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a
                href="https://github.com/DanidaJ"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-purple-500/10 text-midnight-muted hover:text-purple-400 transition-all duration-200"
                title="GitHub"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"></path>
                </svg>
              </a>
              <a
                href="mailto:jayakodydanida@gmail.com"
                className="p-2 rounded-lg hover:bg-red-500/10 text-midnight-muted hover:text-red-400 transition-all duration-200"
                title="Email"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
