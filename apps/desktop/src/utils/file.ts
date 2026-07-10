export const readFilesAsBase64 = async (
  files: FileList | File[],
): Promise<{ file: File; base64: string }[]> => {
  const fileArray = Array.from(files).filter((file) =>
    file.type.startsWith('image/'),
  )

  const promises = fileArray.map((file) => {
    return new Promise<{ file: File; base64: string }>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve({ file, base64: event.target.result as string })
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('File reading error'))
      reader.readAsDataURL(file)
    })
  })

  return Promise.all(promises)
}
