import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText,
  icon, 
  rightElement,
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-midnight-textSecondary ml-0.5 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-midnight-muted group-focus-within:text-midnight-accent transition-colors duration-200">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full 
            bg-midnight-surface border border-midnight-border rounded-xl 
            px-4 py-3.5 
            ${icon ? 'pl-12' : ''}
            ${rightElement ? 'pr-12' : ''}
            text-midnight-text placeholder-midnight-muted/60
            shadow-sm
            transition-all duration-200 ease-out-expo
            focus:outline-none 
            focus:border-midnight-accent/60 
            focus:ring-2 focus:ring-midnight-accent/20 
            focus:bg-midnight-elevated
            focus:shadow-glow-sm
            hover:border-midnight-borderSubtle
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20' : ''}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-red-400 ml-0.5 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span className="text-xs text-midnight-muted ml-0.5">{helperText}</span>
      )}
    </div>
  );
};