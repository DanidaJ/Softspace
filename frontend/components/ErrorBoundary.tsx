import React, { Component, ErrorInfo, ReactNode } from 'react';

const isDev = import.meta.env.DEV;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // TODO: In production, send to error tracking service (Sentry, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-midnight-bg relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full" />

          <div className="w-full max-w-lg p-8 rounded-2xl bg-midnight-surface backdrop-blur-xl border border-midnight-border shadow-2xl relative z-10 mx-4">
            {/* Error icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Error message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-3">
                Something went wrong
              </h1>
              <p className="text-midnight-muted text-sm leading-relaxed">
                We're sorry, but something unexpected happened. Don't worry, your data is safe.
                Please try refreshing the page or going back to home.
              </p>
            </div>

            {/* Error details (collapsible in dev mode) */}
            {isDev && this.state.error && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-midnight-muted hover:text-white transition-colors">
                  Show technical details
                </summary>
                <div className="mt-3 p-4 rounded-xl bg-midnight-bg border border-midnight-border overflow-auto max-h-48">
                  <p className="text-red-400 text-xs font-mono mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-gray-500 text-xs font-mono whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-4 py-3 rounded-xl border border-midnight-border text-midnight-muted hover:text-white hover:border-midnight-accent/50 transition-all font-medium text-sm"
              >
                Go Home
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-3 rounded-xl bg-midnight-accent text-white hover:bg-midnight-accentHover transition-colors font-medium text-sm"
              >
                Refresh Page
              </button>
            </div>

            {/* Support link */}
            <p className="mt-6 text-center text-xs text-midnight-muted">
              If this problem persists, please{' '}
              <a
                href="mailto:jayakodydanida@gmail.com"
                className="text-midnight-accent hover:text-midnight-accentHover transition-colors"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  const [, setError] = React.useState<Error | null>(null);
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
};
