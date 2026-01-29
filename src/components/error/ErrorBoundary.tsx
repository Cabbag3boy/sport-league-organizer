import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  fallback?: (error: Error, reset: () => void, errorId: string) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

/**
 * Error Boundary component to catch and handle rendering errors in component tree.
 * Logs errors to console and provides recovery mechanism.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const errorId = `ERR-${timestamp}-${random}`;

    console.error(`[${this.props.componentName || "ErrorBoundary"}] Error caught:`, {
      errorId,
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
    });

    this.setState({
      errorInfo,
      errorId,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.resetErrorBoundary,
          this.state.errorId
        );
      }

      return (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">
            Something went wrong in {this.props.componentName || "this component"}
          </p>
          <p className="mt-2 text-sm text-red-700">
            Error ID: <code className="font-mono">{this.state.errorId}</code>
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-red-600 hover:text-red-700">
                Error details (dev only)
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-900">
                {this.state.error.toString()}
                {"\n\n"}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={this.resetErrorBoundary}
            className="mt-4 rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
