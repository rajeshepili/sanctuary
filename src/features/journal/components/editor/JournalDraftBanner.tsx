interface Props {
  draftError?: string | null
  retryDraftSave?: () => void
  copyDraft?: () => void
}

export function JournalDraftBanner({
  draftError,
  retryDraftSave,
  copyDraft,
}: Props) {
  return (
    <div className="rounded-3xl border border-red-300/70 bg-red-500/10 p-4 text-sm text-red-900 shadow-sm mt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold">Draft save failed</p>
          <p className="mt-1 text-xs text-red-700">
            {draftError ??
              'Unable to save your draft. Please retry or copy it somewhere safe.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {retryDraftSave && (
            <button
              onClick={retryDraftSave}
              className="rounded-lg border border-red-300/80 bg-white/90 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
            >
              Retry save
            </button>
          )}
          {copyDraft && (
            <button
              onClick={copyDraft}
              className="rounded-lg border border-border/80 bg-background/90 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-slate-100"
            >
              Copy draft
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
