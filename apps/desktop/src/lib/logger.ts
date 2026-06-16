
export class Logger {
  private readonly prefix: string

  constructor(context: string) {
    this.prefix = `[${context}]`
  }

  info(message: string, ...args: unknown[]) {
    console.info(`${this.prefix} [INFO] ${message}`, ...args)
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(`${this.prefix} [WARN] ${message}`, ...args)
  }

  error(message: string, error?: unknown, ...args: unknown[]) {
    console.error(`${this.prefix} [ERROR] ${message}`, error, ...args)
  }

  debug(message: string, ...args: unknown[]) {
    if (import.meta.env.DEV) {
      console.debug(`${this.prefix} [DEBUG] ${message}`, ...args)
    }
  }
}

export const createLogger = (context: string) => new Logger(context)
