import { Component, type ErrorInfo, type ReactNode } from 'react';

interface IslandErrorBoundaryProps {
  fallback: string;
  children: ReactNode;
}

interface IslandErrorBoundaryState {
  hasError: boolean;
}

// A broken simulation falls back to a plain explanation of the same concept.
export class IslandErrorBoundary extends Component<
  IslandErrorBoundaryProps,
  IslandErrorBoundaryState
> {
  override state: IslandErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): IslandErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <p className="text-muted" data-island-fallback>
        {this.props.fallback}
      </p>
    );
  }
}
