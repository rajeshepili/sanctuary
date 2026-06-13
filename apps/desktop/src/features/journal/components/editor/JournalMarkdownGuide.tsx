import { motion } from 'framer-motion'

const MD_HINTS = [
  { syntax: '**bold**', label: 'Bold' },
  { syntax: '_italic_', label: 'Italic' },
  { syntax: '# Heading', label: 'Heading' },
  { syntax: '- item', label: 'List' },
  { syntax: '> quote', label: 'Quote' },
  { syntax: '`code`', label: 'Code' },
  { syntax: '---', label: 'Divider' },
  { syntax: '#tag', label: 'Tag' },
]

interface Props {
  isExpandedPage: boolean
}

export function JournalMarkdownGuide({ isExpandedPage }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`
        absolute z-10
        bg-card/95 border border-border/60 backdrop-blur-xl
        rounded-2xl p-3 shadow-xl
        grid grid-cols-2 gap-x-5 gap-y-1.5
        min-w-[220px]
        ${isExpandedPage ? 'bottom-full mb-3 left-0' : 'bottom-3 right-3'}
      `}
    >
      <p className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
        Markdown cheatsheet
      </p>
      {MD_HINTS.map(({ syntax, label }) => (
        <div key={syntax} className="flex items-center gap-2">
          <code className="text-[11px] font-mono bg-foreground/8 px-1.5 py-0.5 rounded text-primary/90 shrink-0">
            {syntax}
          </code>
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </motion.div>
  )
}
