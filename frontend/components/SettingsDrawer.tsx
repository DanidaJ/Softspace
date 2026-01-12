import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from '../types';
import { api } from '../utils/api';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onToggle: (key: keyof Settings) => void;
  onLogout: () => Promise<void> | void;
  onDeleteAccount: () => Promise<void> | void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose, settings, onToggle, onLogout, onDeleteAccount }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      setIsProcessing(true);
      await onLogout();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your account and all associated data? This cannot be undone.');
    if (!confirmed) return;

    try {
      setIsProcessing(true);
      await onDeleteAccount();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      setExportSuccess(false);
      
      const exportData = await api.account.exportData();
      
      // Create and download the JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `softspace-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-80 h-full bg-midnight-bg border-l border-midnight-border shadow-2xl p-6 transform transition-transform duration-300 ease-out overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-midnight-surface rounded-full transition-colors text-midnight-muted hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-midnight-muted uppercase tracking-wider">Appearance</h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-surface border border-midnight-border">
              <span className="text-sm text-gray-200">Dark Mode</span>
              <button 
                onClick={() => onToggle('darkMode')}
                className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${settings.darkMode ? 'bg-sky-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 ${settings.darkMode ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-surface border border-midnight-border">
              <span className="text-sm text-gray-200">Animations</span>
              <button 
                onClick={() => onToggle('animations')}
                className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${settings.animations ? 'bg-sky-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 ${settings.animations ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Privacy - Safe Mode always on, just informational */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-midnight-muted uppercase tracking-wider">Privacy & Safety</h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-surface border border-midnight-border">
              <div className="flex flex-col">
                <span className="text-sm text-gray-200">Content Safety</span>
                <span className="text-xs text-midnight-muted">Always enabled to keep conversations therapeutic</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs text-green-400 font-medium">Protected</span>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-midnight-muted uppercase tracking-wider">Your Data</h3>
            <button 
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-midnight-surface border border-midnight-border hover:bg-midnight-elevated transition-colors disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  {isExporting ? (
                    <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : exportSuccess ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm text-gray-200">
                    {isExporting ? 'Exporting...' : exportSuccess ? 'Downloaded!' : 'Export My Data'}
                  </span>
                  <span className="text-xs text-midnight-muted">Download all your data as JSON</span>
                </div>
              </div>
            </button>
          </div>
          
          {/* About & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">About & Legal</h3>
            <button 
              onClick={() => {
                // Clear disclaimer flag to show it again
                localStorage.removeItem('softspace_disclaimer_accepted');
                window.location.reload(); // Reload to show disclaimer immediately
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>View Disclaimer</span>
              <svg className="w-4 h-4 text-midnight-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button 
              onClick={() => {
                onClose();
                navigate('/privacy');
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>Privacy Policy</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button 
              onClick={() => {
                onClose();
                navigate('/terms');
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>Terms of Service</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('softspace_disclaimer_accepted', 'false');
                window.location.reload();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/5 rounded-lg transition-colors"
            >
              View Disclaimer Again
            </button>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <button 
              onClick={handleDeleteAccount}
              disabled={isProcessing}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Delete Account
            </button>
            <button 
              onClick={handleLogout}
              disabled={isProcessing}
              className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-white/5 rounded-lg transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};