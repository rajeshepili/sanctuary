export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  
  // Check navigator.platform (legacy, but works)
  return navigator.platform.toLowerCase().includes('mac')
}
