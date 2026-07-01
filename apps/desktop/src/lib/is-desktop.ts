/** True when Electron IPC bridge is available (installed app or electron dev). */
export function isDesktopApp(): boolean {
  return typeof window !== 'undefined' && !!window.sanctuary
}
