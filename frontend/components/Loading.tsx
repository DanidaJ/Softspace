import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <svg
      className={`animate-spin text-midnight-accent ${sizes[size]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Full page loading overlay
interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-midnight-bg/90 backdrop-blur-sm">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-sm text-midnight-textSecondary animate-pulse">
        {message}
      </p>
    </div>
  );
};

// Skeleton loading placeholder
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
}) => {
  const variants = {
    text: 'h-4 rounded-lg',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`
        bg-midnight-border
        animate-pulse
        ${variants[variant]}
        ${className}
      `}
      style={{ width, height }}
    />
  );
};

// Loading dots animation
export const LoadingDots: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="w-2 h-2 bg-midnight-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-midnight-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-midnight-accent rounded-full animate-bounce" />
    </div>
  );
};
