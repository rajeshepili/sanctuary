export interface SanctuaryDesktopApi {
  isDesktop: true
  getAutoUpdateEnabled: () => Promise<boolean>
  setAutoUpdateEnabled: (enabled: boolean) => Promise<void>
  checkForUpdates: () => Promise<void>
  selectDirectory: () => Promise<string | null>
  writeFileStructure: (
    basePath: string,
    files: Array<{ path: string; content: string | Uint8Array }>,
  ) => Promise<void>
  listFiles: (dirPath: string) => Promise<string[]>
  readFileBase64: (filePath: string) => Promise<string | null>
}

declare global {
  interface Window {
    sanctuary?: SanctuaryDesktopApi
  }
}

export {}
