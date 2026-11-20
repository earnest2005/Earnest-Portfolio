import React, { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  onError?: () => void
}

interface State {
  hasError: boolean
}

export default class IntroErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[IntroErrorBoundary] Intro failed safely, falling back to default hero:', error, errorInfo)
    try {
      document.body.style.overflow = ''
    } catch {
      // ignore
    }
    this.props.onError?.()
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}
