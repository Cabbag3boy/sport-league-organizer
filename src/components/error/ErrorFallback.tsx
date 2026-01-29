import React from "react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentName?: string;
  errorId: string;
}

/**
 * Reusable error fallback UI component for error boundaries.
 * Displays user-friendly error message with support reference.
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  componentName = "this component",
  errorId,
}) => {
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-900">
            Something went wrong in {componentName}
          </h3>
          <p className="mt-2 text-sm text-red-700">
            We're sorry for the inconvenience. Please try again or contact support with this error ID if the problem persists.
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-mono text-red-600">
            <span>Error ID:</span>
            <code className="rounded bg-red-100 px-2 py-1">{errorId}</code>
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-medium text-red-600 hover:text-red-700">
                Details (development only)
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-red-100 p-3 text-xs text-red-900">
                {error.message}
              </pre>
            </details>
          )}
          <button
            onClick={resetErrorBoundary}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
