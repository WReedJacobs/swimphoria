import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? <DefaultErrorFallback error={this.state.error} onReset={() => this.setState({ error: null })} />
    }
    return this.props.children
  }
}

function DefaultErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="h-10 w-10 text-danger" />
      <div>
        <p className="font-semibold text-text-primary">Something went wrong</p>
        <p className="mt-1 max-w-sm text-sm text-text-secondary">{error.message}</p>
      </div>
      <button
        onClick={onReset}
        className="rounded-component border border-border px-4 py-2 text-sm text-text-secondary hover:border-primary hover:text-primary"
      >
        Try again
      </button>
    </div>
  )
}
