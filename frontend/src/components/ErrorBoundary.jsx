import React from 'react';
import { AlertCircle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error Boundary caught:', error, errorInfo);
        this.setState({ errorInfo });

        // Kirim ke error tracking service (optional)
        // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-zinc-950 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-md text-center border border-red-100 dark:border-red-900">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />

                        <h1 className="text-2xl font-bold text-red-900 dark:text-red-400 mb-2">
                            Oops! Something went wrong
                        </h1>

                        <p className="text-red-700 dark:text-red-300 mb-6 text-sm">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>

                        {import.meta.env.DEV && this.state.errorInfo && (
                            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 mb-6 text-left max-h-40 overflow-auto">
                                <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                                    {this.state.errorInfo.componentStack}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
                            >
                                Go Home
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 px-6 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all"
                            >
                                Reload
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
