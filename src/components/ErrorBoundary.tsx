"use client";

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#2d2d2d] border border-[#3a3a3a] rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-[#ffb3d1] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#e0e0e0] mb-2">Something went wrong</h1>
            <p className="text-[#888888] mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#6C739C] text-[#F0DAD5] rounded-lg hover:bg-[#6C739C]/80 transition-colors focus-visible:outline-2 focus-visible:outline-[#6C739C] focus-visible:outline-offset-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

