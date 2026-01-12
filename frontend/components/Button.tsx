import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = `
    relative overflow-hidden
    font-medium rounded-xl
    transition-all duration-200 ease-out-expo
    transform active:scale-[0.97]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    flex items-center justify-center gap-2
    focus:outline-none focus-visible:ring-2 focus-visible:ring-midnight-accent focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-bg
  `;
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-500 to-blue-600
      text-white font-semibold
      shadow-lg shadow-blue-500/25
      hover:shadow-xl hover:shadow-blue-500/30
      hover:from-blue-400 hover:to-blue-500
      hover:-translate-y-0.5
      border border-blue-400/20
    `,
    secondary: `
      bg-midnight-surface
      text-midnight-text
      border border-midnight-border
      shadow-card
      hover:border-midnight-borderSubtle
      hover:bg-midnight-elevated
      hover:-translate-y-0.5
      hover:shadow-lg
    `,
    ghost: `
      bg-transparent
      text-midnight-textSecondary
      hover:text-midnight-text
      hover:bg-white/5
    `,
    danger: `
      bg-red-500/10
      text-red-400
      border border-red-500/20
      hover:bg-red-500/20
      hover:border-red-500/30
    `,
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
};