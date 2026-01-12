import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  glow = false,
  onClick,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover
    ? 'cursor-pointer hover:-translate-y-1 hover:shadow-card-hover hover:border-midnight-borderSubtle'
    : '';

  const glowStyles = glow ? 'shadow-glow-sm' : '';

  return (
    <div
      className={`
        bg-midnight-surface
        border border-midnight-border
        rounded-xl
        shadow-card
        transition-all duration-250 ease-out-expo
        ${paddingStyles[padding]}
        ${hoverStyles}
        ${glowStyles}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Subtle top gradient for depth */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

// Card header subcomponent
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '',
  action,
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h3 className="font-heading font-semibold text-lg text-midnight-text tracking-tight">
        {children}
      </h3>
      {action && <div>{action}</div>}
    </div>
  );
};

// Card content subcomponent
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '',
}) => {
  return (
    <div className={`text-midnight-textSecondary ${className}`}>
      {children}
    </div>
  );
};

// Skeleton loader for cards
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`
        bg-midnight-surface
        border border-midnight-border
        rounded-xl
        p-6
        animate-pulse
        ${className}
      `}
    >
      <div className="h-5 bg-midnight-border rounded-lg w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-midnight-border rounded-lg w-full" />
        <div className="h-4 bg-midnight-border rounded-lg w-4/5" />
        <div className="h-4 bg-midnight-border rounded-lg w-2/3" />
      </div>
    </div>
  );
};
