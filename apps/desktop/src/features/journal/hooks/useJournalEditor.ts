import type { EditorOptions } from '@tiptap/react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'

interface UseJournalEditorProps extends Partial<EditorOptions> {
  placeholder?: string
  className?: string
}

export function useJournalEditor({
  placeholder = 'Reflect on this moment…',
  className = '',
  extensions = [],
  editorProps = {},
  ...props
}: UseJournalEditorProps = {}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder,
      }),
      ...extensions,
    ],
    immediatelyRender: false,
    contentType: 'markdown',
    parseOptions: {
      preserveWhitespace: true,
    },
    ...props,
    editorProps: {
      attributes: {
        class: [
          'prose prose-sm sm:prose-base prose-p:my-2',
          'prose-headings:mb-3 prose-headings:mt-6 prose-hr:my-6',
          'dark:prose-invert text-foreground prose-headings:text-foreground',
          'prose-p:text-foreground prose-strong:text-foreground',
          'prose-a:text-primary prose-code:text-primary',
          'prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary',
          'prose-li:text-foreground max-w-none focus:outline-none tiptap leading-8',
          className,
        ]
          .filter(Boolean)
          .join(' '),
      },
    },
  })

  if (editor) {
    editor.setMarkdown = (content: string) => {
      editor.commands.setContent(content, {
        contentType: 'markdown',
        parseOptions: { preserveWhitespace: true },
      })
    }
  }

  return editor
}
