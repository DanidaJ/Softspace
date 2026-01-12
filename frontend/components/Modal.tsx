import React, { useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children,
  size = 'md',
  showClose = true,
}) => {
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-midnight-bg/85 backdrop-blur-md animate-fade-in" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div 
        className={`
          relative w-full ${sizes[size]}
          bg-midnight-surface 
          rounded-2xl 
          border border-midnight-border
          shadow-2xl
          overflow-hidden 
          animate-scale-in
          z-10 
          max-h-[90vh] 
          flex flex-col
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Subtle gradient overlay at top */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-midnight-accent/5 to-transparent pointer-events-none" />
        
        {/* Close button */}
        {showClose && (
          <button
            onClick={onClose}
            className="
              absolute top-4 right-4 z-10
              p-2 rounded-lg
              text-midnight-muted hover:text-midnight-text
              hover:bg-white/5
              transition-colors duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-midnight-accent
            "
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {children}
      </div>
    </div>
  );
};