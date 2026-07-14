import { BubbleMenu } from '@tiptap/react/menus'
import type { Editor } from '@tiptap/react'
import { IconButton } from '#/components/ui/icon-button'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Quote,
  List,
  Code,
} from 'lucide-react'

interface Props {
  editor: Editor
}

export function JournalBubbleMenu({ editor }: Props) {
  const FORMAT_ACTIONS = [
    {
      tooltip: 'Bold',
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      tooltip: 'Italic',
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      tooltip: 'Strikethrough',
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
    },
    { divider: true },
    {
      tooltip: 'Heading 1',
      icon: Heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      tooltip: 'Heading 2',
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    { divider: true },
    {
      tooltip: 'Quote',
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      tooltip: 'List',
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      tooltip: 'Code',
      icon: Code,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive('code'),
    },
  ]

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-0.5 bg-card border border-border/60 shadow-xl backdrop-blur-xl px-1.5 py-1.5 rounded-xl z-50"
    >
      {FORMAT_ACTIONS.map((item, idx) => {
        if (item.divider) {
          return (
            <div
              key={`divider-${idx}`}
              className="w-px h-4 bg-border/60 mx-1.5 shrink-0"
            />
          )
        }

        const Icon = item.icon!
        return (
          <IconButton
            key={item.tooltip}
            tooltip={item.tooltip!}
            onClick={item.action}
            className={`w-8 h-8 p-0 rounded-lg ${
              item.isActive!()
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
          </IconButton>
        )
      })}
    </BubbleMenu>
  )
}
