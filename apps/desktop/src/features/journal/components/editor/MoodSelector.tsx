import { useJournalEditorContext } from './JournalEditorContext'
import { MOODS } from '#/features/journal/journal.moods'

export function MoodSelector() {
  const { mood, setMood } = useJournalEditorContext()

  return (
    <div className="pt-4 flex flex-wrap items-center gap-2">
      <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground/60 mr-1">
        Feeling
      </span>
      {MOODS.map((m) => {
        const isActive = mood === m.value
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => setMood(isActive ? null : m.value)}
            title={m.label}
            className={`
              flex items-center justify-center h-8 px-2.5 rounded-full text-xs font-medium border transition-all duration-300 ease-out
              ${
                isActive
                  ? m.activeColor
                  : `border-transparent text-muted-foreground/70 bg-transparent ${m.color}`
              }
            `}
          >
            <span className="mr-1.5 text-sm">{m.emoji}</span>
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
