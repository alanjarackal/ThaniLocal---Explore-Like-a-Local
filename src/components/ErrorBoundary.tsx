
import React from 'react';
import { toast } from 'sonner';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Show a toast notification
    toast.error('Something went wrong. Please try again or refresh the page.');
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                We&apos;re sorry, but something went wrong while trying to display this content.
              </p>
              {this.state.error && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Error details:</p>
                  <pre className="mt-2 p-4 bg-gray-50 rounded text-sm text-gray-600 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="mt-8">
                <p className="text-sm font-medium text-gray-700 mb-2">Component Stack:</p>
                <pre className="p-4 bg-gray-50 rounded text-sm text-gray-600 overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 