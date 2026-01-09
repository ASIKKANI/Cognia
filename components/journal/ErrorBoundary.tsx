import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_: Error): Partial<State> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center bg-destructive/5 rounded-2xl border border-destructive/20">
                    <h1 className="text-2xl font-serif text-destructive mb-4">Something went wrong.</h1>
                    <p className="text-muted-foreground mb-6 max-w-md">The editor encountered an unexpected error. Please try refreshing the page.</p>
                    <details className="text-left w-full max-w-2xl bg-black/5 p-4 rounded-lg overflow-auto max-h-[200px] text-xs font-mono">
                        <summary className="cursor-pointer mb-2 font-bold opacity-70">Error Details</summary>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}
