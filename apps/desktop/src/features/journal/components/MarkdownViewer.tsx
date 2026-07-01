import { EditorContent, Extension } from '@tiptap/react'
import { Plugin } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import type { Node as ProseMirrorNode } from 'prosemirror-model'
import { useEffect, useCallback } from 'react'
import { useJournalEditor } from '../hooks/useJournalEditor'
import { ScrollArea } from '#/components/ui/scroll-area'

const HASHTAG_RE = /(^|\s)(#[a-zA-Z0-9-]+)/g

function buildHashtagDecorations(doc: ProseMirrorNode): DecorationSet {
  const decorations: Decoration[] = []

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return
    HASHTAG_RE.lastIndex = 0
    let match
    while ((match = HASHTAG_RE.exec(node.text)) !== null) {
      const from = pos + match.index + match[1].length
      const to = from + match[2].length
      decorations.push(
        Decoration.inline(from, to, {
          class: 'hashtag-chip',
          'data-tag': match[2].slice(1),
        }),
      )
    }
  })

  return DecorationSet.create(doc, decorations)
}

const HashtagHighlight = Extension.create({
  name: 'hashtagHighlight',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        state: {
          init(_, { doc }) {
            return buildHashtagDecorations(doc)
          },
          apply(tr, oldSet) {
            return tr.docChanged ? buildHashtagDecorations(tr.doc) : oldSet
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})

interface MarkdownViewerProps {
  content: string
  onTagClick?: (tag: string) => void
  className?: string
  /**
   * When true, skips the ScrollArea wrapper so a parent scroll container
   * (e.g. the ReadingView overlay) can manage scrolling instead.
   */
  inline?: boolean
}

export function MarkdownViewer({
  content,
  onTagClick,
  className,
  inline = false,
}: MarkdownViewerProps) {
  const editor = useJournalEditor({
    extensions: [HashtagHighlight],
    content,
    editable: false,
    className: className ?? '',
  })

  useEffect(() => {
    if (!editor) return
    if (content !== editor.getMarkdown()) {
      editor.setMarkdown(content)
    }
  }, [content, editor])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('hashtag-chip') && onTagClick) {
        const tag = target.getAttribute('data-tag')
        if (tag) {
          e.preventDefault()
          e.stopPropagation()
          onTagClick(tag)
        }
      }
    },
    [onTagClick],
  )

  const inner = (
    <div onClick={handleClick}>
      <EditorContent editor={editor} />
    </div>
  )

  if (inline) return inner

  return <ScrollArea className="h-full">{inner}</ScrollArea>
}
