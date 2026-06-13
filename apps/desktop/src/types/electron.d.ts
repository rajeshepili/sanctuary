export interface SanctuaryDesktopApi {
  isDesktop: true
  getAutoUpdateEnabled: () => Promise<boolean>
  setAutoUpdateEnabled: (enabled: boolean) => Promise<void>
  checkForUpdates: () => Promise<void>
}

declare global {
  interface Window {
    sanctuary?: SanctuaryDesktopApi
  }
}

export {}
