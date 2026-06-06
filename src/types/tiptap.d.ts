import '@tiptap/react'

declare module '@tiptap/react' {
  interface Editor {
    setMarkdown: (content: string) => void
  }
}
