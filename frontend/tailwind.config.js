/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './landing/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          // Core backgrounds (elevation system)
          bg: 'rgb(var(--color-bg) / <alpha-value>)',
          surface: 'rgb(var(--color-surface) / <alpha-value>)',
          elevated: 'rgb(var(--color-elevated) / <alpha-value>)',
          
          // Interactive accent
          accent: 'rgb(var(--color-accent) / <alpha-value>)',
          accentHover: 'rgb(var(--color-accent-hover) / <alpha-value>)',
          
          // Text hierarchy
          text: 'rgb(var(--color-text) / <alpha-value>)',
          textSecondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-muted) / <alpha-value>)',
          highlight: 'rgb(var(--color-highlight) / <alpha-value>)',
          
          // Borders & dividers
          border: 'rgb(var(--color-border) / <alpha-value>)',
          borderSubtle: 'rgb(var(--color-border-subtle) / <alpha-value>)',
          divider: 'rgb(var(--color-divider) / <alpha-value>)',
          
          // Semantic
          success: 'rgb(var(--color-success) / <alpha-value>)',
          warning: 'rgb(var(--color-warning) / <alpha-value>)',
          danger: 'rgb(var(--color-danger) / <alpha-value>)',
        },
      },
      fontFamily: {
        // Poppins for headings - modern, geometric
        heading: [
          'Poppins',
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        // Inter for body text - highly readable
        sans: [
          'Inter',
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      fontSize: {
        // Professional type scale with tracking
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
      },
      spacing: {
        // Consistent spacing scale
        '4.5': '1.125rem',
        '13': '3.25rem',
        '18': '4.5rem',
      },
      borderRadius: {
        // Consistent radius scale
        'DEFAULT': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        // Elevation system
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'DEFAULT': '0 2px 4px -1px rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        
        // Inner shadows for depth
        'inner-subtle': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.03)',
        'inner-glow': 'inset 0 0 20px 0 rgba(96, 165, 250, 0.05)',
        
        // Glow effects
        'glow-sm': '0 0 10px rgba(96, 165, 250, 0.15)',
        'glow': '0 0 20px rgba(96, 165, 250, 0.2), 0 0 40px rgba(96, 165, 250, 0.1)',
        'glow-lg': '0 0 30px rgba(96, 165, 250, 0.25), 0 0 60px rgba(96, 165, 250, 0.15)',
        
        // Card shadows
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -1px rgba(0, 0, 0, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.03)',
        'card-hover': '0 12px 20px -4px rgba(0, 0, 0, 0.35), 0 4px 6px -2px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(96, 165, 250, 0.1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        breathePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'breathe-pulse': 'breathePulse 4s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(135deg, rgba(96, 165, 250, 0.03) 0%, transparent 50%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
