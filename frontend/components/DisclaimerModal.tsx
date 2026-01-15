import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { REGION_OPTIONS, getEmergencyResources, getUserRegionCode } from '../utils/emergencyResources';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [region, setRegion] = useState<string>('LK'); // Default to Sri Lanka
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already accepted disclaimer
    const hasAccepted = localStorage.getItem('softspace_disclaimer_accepted');
    if (!hasAccepted) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    const inferred = getUserRegionCode();
    // Only override default if we can detect a different region
    if (inferred && inferred !== 'LK') setRegion(inferred);
  }, []);

  const selectedResources = getEmergencyResources(region);

  const handleAccept = () => {
    localStorage.setItem('softspace_disclaimer_accepted', 'true');
    setIsOpen(false);
    onAccept();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} size="lg">
      {/* Header - fixed */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-midnight-border">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl md:text-4xl">⚕️</span>
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white">Important Information</h2>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 scrollbar-thin scrollbar-thumb-midnight-border scrollbar-track-transparent">
        <div className="space-y-3 sm:space-y-4 text-midnight-text">
        <div className="p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <h3 className="font-semibold text-yellow-200 mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">This is NOT a Replacement for Professional Therapy</h3>
          <p className="text-[11px] sm:text-xs md:text-sm text-yellow-100/80 leading-snug">
            Softspace is an AI-powered companion designed to support your mental wellness journey. 
            However, it is not a substitute for professional mental health care, diagnosis, or treatment.
          </p>
        </div>

        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
          <h3 className="font-semibold text-white text-xs sm:text-sm md:text-base">Please understand that:</h3>
          <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-5 list-disc text-midnight-muted text-[11px] sm:text-xs md:text-sm leading-snug">
            <li>This platform uses AI (Google's Gemini) and cannot provide medical or clinical advice</li>
            <li>Conversations are analyzed to provide insights, but this is not a clinical assessment</li>
            <li>If you're experiencing a mental health crisis, please contact emergency services or a crisis hotline immediately</li>
            <li>This tool is designed to complement, not replace, professional mental health support</li>
            <li>We encourage you to work with licensed mental health professionals for clinical care</li>
          </ul>
        </div>

        <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h3 className="font-semibold text-red-200 mb-2 sm:mb-2.5 text-xs sm:text-sm md:text-base">⚠️ Crisis Resources</h3>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-[10px] sm:text-xs text-red-100/80 flex-wrap">
            <span>Showing</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-red-900/40 border border-red-500/40 text-white text-[10px] sm:text-xs rounded px-1.5 sm:px-2 py-0.5 sm:py-1 focus:outline-none focus:ring-1 focus:ring-red-300"
            >
              {REGION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1a1222] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <span>resources</span>
          </div>

          <div className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-red-100/80">
            {selectedResources.resources.map((resource) => (
              <div key={`${selectedResources.regionCode}-${resource.name}`}>
                <p className="font-semibold text-red-100 text-[11px] sm:text-xs md:text-sm">{resource.name}{resource.availability ? ` (${resource.availability})` : ''}</p>
                <p className="text-red-100/80 text-[10px] sm:text-xs mb-1 leading-snug">{resource.description}</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {resource.actions.map((action) => (
                    <a
                      key={action.label}
                      href={action.href}
                      target={action.kind === 'web' ? '_blank' : undefined}
                      rel={action.kind === 'web' ? 'noopener noreferrer' : undefined}
                      className="text-red-200 underline hover:text-red-100 text-[10px] sm:text-xs"
                    >
                      {action.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            {selectedResources.emergencyNumber && (
              <p className="text-red-100/90 text-[11px] sm:text-xs md:text-sm">
                Emergency: Call {selectedResources.emergencyNumber} or your nearest emergency number
              </p>
            )}
            <p className="text-red-100/70 text-[10px] sm:text-xs">
              International: Visit <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="text-red-200 underline hover:text-red-100">findahelpline.com</a>
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-midnight-surface border border-midnight-border rounded-lg">
          <h3 className="font-semibold text-white mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">Your Privacy & Data</h3>
          <p className="text-[11px] sm:text-xs md:text-sm text-midnight-muted leading-snug">
              Your conversations are private and encrypted. We use them to provide personalized support 
              and insights. View our{' '}
              <button 
                onClick={() => navigate('/privacy')} 
                className="text-midnight-accent underline hover:text-midnight-accentHover"
              >
                Privacy Policy
              </button>{' '}
              and{' '}
              <button
                onClick={() => navigate('/terms')}
                className="text-midnight-accent underline hover:text-midnight-accentHover"
              >
                Terms of Service
              </button>{' '}
              for details.
            </p>
          </div>
        </div>
      </div>

      {/* Footer - fixed */}
      <div className="flex-shrink-0 px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4 md:px-8 md:pb-8 md:pt-6 border-t border-midnight-border">
        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={handleAccept}
            className="w-full px-4 py-2.5 sm:px-6 sm:py-3 bg-midnight-accent hover:bg-midnight-accentHover text-white font-semibold rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base"
          >
            I Understand & Accept
          </button>
          <p className="text-[10px] sm:text-xs text-center text-midnight-muted leading-tight">
            By continuing, you acknowledge that this is a wellness tool, not professional therapy
          </p>
        </div>
      </div>
    </Modal>
  );
};
