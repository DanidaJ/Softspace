import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-midnight-border text-midnight-textSecondary',
    success: 'bg-green-500/15 text-green-400 border-green-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/15 text-red-400 border-red-500/20',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    accent: 'bg-midnight-accent/15 text-midnight-accent border-midnight-accent/20',
  };

  const sizes: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-midnight-muted',
    success: 'bg-green-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    info: 'bg-blue-400',
    accent: 'bg-midnight-accent',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full
        border border-transparent
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};
