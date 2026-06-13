import { useEffect, useMemo } from 'react'
import { useJournalEditor } from '#/hooks/use-journal-editor'

interface UseEditorInstanceOptions {
  value: string
  setValue: (v: string) => void
  onSave: () => void
  isExpandedPage?: boolean
  isInlinePane?: boolean
}

/**
 * Encapsulates Tiptap editor instance management, synchronization, and keyboard shortcuts.
 */
export function useEditorInstance({
  value,
  setValue,
  onSave,
  isExpandedPage = false,
  isInlinePane = false,
}: UseEditorInstanceOptions) {
  const editorClassName = isExpandedPage
    ? 'prose-lg sm:prose-xl leading-relaxed min-h-[60vh] py-4'
    : isInlinePane
      ? 'leading-8 flex-1 overflow-y-auto min-h-0 px-1 py-2 outline-none'
      // Card widget — visual borders handled by wrapper in JournalEditor.tsx.
      // We just need layout, height, and scroll behavior here.
      : 'leading-8 max-h-[300px] overflow-y-auto min-h-[160px] px-4 py-4 outline-none'

  const editor = useJournalEditor({
    content: value,
    placeholder: 'Start writing… anything you want to remember.',
    className: editorClassName,
    editorProps: {
      handleKeyDown: (_view, event) => {
        const ctrl = event.metaKey || event.ctrlKey
        if (ctrl && event.key === 'Enter') {
          event.preventDefault()
          // Check if there is content or media (handled by caller via saveDisabled)
          onSave()
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor: e }) => {
      setValue(e.getMarkdown())
    },
  })

  // Sync external value with internal editor state
  useEffect(() => {
    if (!editor || editor.isFocused) return
    if (value !== editor.getMarkdown()) {
      editor.setMarkdown(value)
    }
  }, [value, editor])

  const wordCount = useMemo(() => {
    if (!editor) return 0
    return editor.getMarkdown().trim().split(/\s+/).filter(Boolean).length
  }, [editor, value]) // Re-run when value changes as well for accuracy

  return {
    editor,
    wordCount,
  }
}
