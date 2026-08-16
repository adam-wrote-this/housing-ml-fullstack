"use client";

import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || "Unexpected UI error" };
  }

  componentDidCatch(error: Error) {
    // 在非生产环境保留控制台错误，便于调试。
    console.error("UI crashed:", error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <main className="mx-auto max-w-4xl p-4">
        <div className="rounded-md border border-rose-300 bg-rose-50 p-4 text-rose-800">
          <h1 className="text-lg font-semibold">Application error</h1>
          <p className="mt-1 text-sm">{this.state.message}</p>
        </div>
      </main>
    );
  }
}
