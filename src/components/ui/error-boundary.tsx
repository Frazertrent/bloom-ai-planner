import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleReportIssue = () => {
    const subject = encodeURIComponent("Bug Report: Application Error");
    const body = encodeURIComponent(
      `Error: ${this.state.error?.message}\n\nStack: ${this.state.error?.stack}\n\nComponent Stack: ${this.state.errorInfo?.componentStack}`
    );
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We're sorry, but something unexpected happened. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={this.handleRetry} 
                className="w-full min-h-[44px]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={this.handleGoHome}
                className="w-full min-h-[44px]"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              <Button 
                variant="ghost" 
                onClick={this.handleReportIssue}
                className="w-full min-h-[44px] text-muted-foreground"
              >
                <Bug className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
              
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4 p-3 bg-muted rounded-lg text-xs">
                  <summary className="cursor-pointer font-medium text-destructive">
                    Error Details
                  </summary>
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap text-muted-foreground">
                    {this.state.error.message}
                    {"\n\n"}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
