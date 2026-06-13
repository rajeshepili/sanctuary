import type { ReactNode, ComponentType, ErrorInfo } from 'react'
import { Component, isValidElement } from 'react'
import { GlobalErrorFallback } from '#/components/layout/GlobalErrorFallback'

interface FallbackProps {
  error: Error
  reset: () => void
}

interface Props {
  children: ReactNode
  fallback?: ReactNode | ComponentType<FallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /**
   * Keys to listen for changes. When any key changes, the error boundary will reset.
   * Similar to react-error-boundary's resetKeys.
   */
  resetKeys?: Array<unknown>
}

interface State {
  hasError: boolean
  error: Error | null
  prevResetKeys: Array<unknown>
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      prevResetKeys: props.resetKeys || [],
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, prevResetKeys: [] } // prevResetKeys updated in componentDidUpdate
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    const { resetKeys } = props
    const { prevResetKeys, hasError } = state

    if (hasError && resetKeys && resetKeys.length > 0) {
      const keysChanged =
        resetKeys.length !== prevResetKeys.length ||
        resetKeys.some((key, i) => !Object.is(key, prevResetKeys[i]))

      if (keysChanged) {
        return {
          hasError: false,
          error: null,
          prevResetKeys: resetKeys,
        }
      }
    }

    return { prevResetKeys: resetKeys || [] }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props

      if (typeof fallback === 'function') {
        const FallbackComponent = fallback
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }

      if (isValidElement(fallback)) {
        return fallback
      }

      return (
        <GlobalErrorFallback
          error={this.state.error}
          reset={this.reset}
        />
      )
    }

    return this.props.children
  }
}
