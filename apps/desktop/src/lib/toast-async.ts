import { toast } from 'sonner'
import { parseError } from './error-parser'

type ToastMessages<T> = {
  loading: string
  success: string | ((data: T) => string)
  error?: string | ((err: unknown) => string)
}

type ToastOptions = {
  onError?: (err: unknown) => void
}

export async function toastAsync<T>(
  promiseFactory: () => Promise<T>,
  messages: ToastMessages<T>,
  options?: ToastOptions,
): Promise<T> {
  const promise = promiseFactory()

  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: (err) => {
      if (typeof messages.error === 'function') {
        return messages.error(err)
      }
      if (messages.error) {
        return messages.error
      }
      
      const parsed = parseError(err)
      return parsed.message
    },
  })

  try {
    const res = await promise
    return res
  } catch (err) {
    options?.onError?.(err)
    throw err
  }
}
