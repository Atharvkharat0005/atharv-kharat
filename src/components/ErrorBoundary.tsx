import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        const parsedError = JSON.parse(this.state.error?.message || '{}');
        if (parsedError.error) {
          errorMessage = parsedError.error;
          isFirestoreError = true;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 border border-emerald-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={40} className="text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                {isFirestoreError ? "Database Connection Error" : "Something went wrong"}
              </h2>
              <p className="text-slate-600">
                {isFirestoreError 
                  ? "We're having trouble reaching our database. This might be a temporary connection issue."
                  : errorMessage}
              </p>
              {isFirestoreError && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 font-mono break-all text-left">
                  {errorMessage}
                </div>
              )}
            </div>
            <button
              onClick={this.handleRetry}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
