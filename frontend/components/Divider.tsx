import React from 'react';

interface DividerProps {
  className?: string;
  label?: string;
  variant?: 'subtle' | 'default' | 'gradient';
}

export const Divider: React.FC<DividerProps> = ({
  className = '',
  label,
  variant = 'default',
}) => {
  const variants = {
    subtle: 'bg-midnight-border/50',
    default: 'bg-midnight-border',
    gradient: 'bg-gradient-to-r from-transparent via-midnight-border to-transparent',
  };

  if (label) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className={`flex-1 h-px ${variants[variant]}`} />
        <span className="text-xs font-medium text-midnight-muted uppercase tracking-wider">
          {label}
        </span>
        <div className={`flex-1 h-px ${variants[variant]}`} />
      </div>
    );
  }

  return <div className={`h-px ${variants[variant]} ${className}`} />;
};
