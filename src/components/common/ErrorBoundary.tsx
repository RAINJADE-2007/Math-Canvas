"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Math Canvas 渲染异常:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-700">页面出现了一些问题</h2>
          <p className="text-sm text-red-600">当前版本暂不支持该数学内容，或发生了未预期的错误。</p>
          <button
            type="button"
            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            onClick={() => this.setState({ hasError: false, message: "" })}
          >
            重新加载
          </button>
          {this.state.message ? (
            <p className="mt-2 max-w-md break-all font-mono text-xs text-red-400">{this.state.message}</p>
          ) : null}
        </div>
      );
    }
    return this.props.children;
  }
}
