import { useRef, useCallback } from 'react'

interface UseMediaPickerOptions {
  onAddMedia: (files: File[]) => void
}

/**
 * Manages the hidden file input and the logic for picking local media files.
 */
export function useMediaPicker({ onAddMedia }: UseMediaPickerOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const open = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith('image/'),
    )
    
    if (fileArray.length > 0) {
      onAddMedia(fileArray)
    }
    
    // Reset input so the same file can be picked again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onAddMedia])

  return {
    fileInputRef,
    open,
    handleFileChange,
  }
}
