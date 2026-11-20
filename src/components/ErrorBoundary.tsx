import React, { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught React application error:', error, errorInfo)
    try {
      document.body.style.overflow = ''
    } catch {
      // ignore
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-paper text-ink p-6 selection:bg-sage/20 selection:text-ink">
          <div className="glass-card max-w-md w-full p-8 text-center border border-white/[0.1] shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage/10 text-sage mb-4 font-bold font-head text-lg">
              EA
            </div>
            <h2 className="font-head text-xl font-bold text-ink">Something went wrong</h2>
            <p className="mt-2 text-sm text-mute leading-relaxed">
              Something went wrong while loading the portfolio. Please refresh the page to continue.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn btn-p w-full sm:w-auto !text-xs !py-2.5 !px-5"
              >
                Refresh Page
              </button>
              <a
                href="/"
                className="btn btn-o w-full sm:w-auto !text-xs !py-2.5 !px-5"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
