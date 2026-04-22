'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Props for the ErrorBoundary component.
 */
interface Props {
  /** The child components to render within the boundary. */
  children: ReactNode;
  /** An optional custom fallback UI to display when an error occurs. */
  fallback?: ReactNode;
}

/**
 * State for the ErrorBoundary component.
 */
interface State {
  /** Whether an error has been caught by the boundary. */
  hasError: boolean;
  /** The error message, if any. */
  error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in its child
 * component tree, logs those errors, and displays a fallback UI instead of the
 * component tree that crashed.
 * 
 * @example
 * <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<Props, State> {
  /**
   * Initializes the ErrorBoundary state.
   * @param props The props for the component.
   */
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Updates state so the next render will show the fallback UI.
   * @param error The error that was thrown.
   * @returns The new state object.
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Catches errors thrown by descendant components.
   * @param error The error that was thrown.
   * @param errorInfo Information about the component stack during the error.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  /**
   * Renders either the fallback UI (if an error occurred) or the children.
   * @returns The React node to render.
   */
  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-xl text-red-200">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="text-sm">{this.state.error?.message || 'An unexpected error occurred.'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
