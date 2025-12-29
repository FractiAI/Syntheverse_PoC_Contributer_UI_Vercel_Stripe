'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
    error: Error | null
    resetError: () => void
}

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        
        this.setState({
            error,
            errorInfo,
        })

        // TODO: Send error to error tracking service (e.g., Sentry)
        // if (process.env.NODE_ENV === 'production') {
        //     Sentry.captureException(error, { contexts: { react: errorInfo } })
        // }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const Fallback = this.props.fallback
                return <Fallback error={this.state.error} resetError={this.handleReset} />
            }
            
            return <DefaultErrorFallback error={this.state.error} resetError={this.handleReset} />
        }

        return this.props.children
    }
}

/**
 * Default Error Fallback Component
 */
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
    const isDevelopment = process.env.NODE_ENV === 'development'

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <CardTitle>Something went wrong</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                    </p>

                    {isDevelopment && error && (
                        <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
                            <p className="font-mono text-sm text-destructive break-all">
                                {error.message}
                            </p>
                            {error.stack && (
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-sm text-muted-foreground">
                                        Stack trace
                                    </summary>
                                    <pre className="mt-2 text-xs overflow-auto max-h-64 bg-background p-2 rounded border">
                                        {error.stack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={resetError} variant="default">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">
                                <Home className="h-4 w-4 mr-2" />
                                Go Home
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

/**
 * Hook to trigger error boundary from functional components
 * Usage: const triggerError = useErrorHandler()
 */
export function useErrorHandler() {
    return React.useCallback((error: Error) => {
        throw error
    }, [])
}

