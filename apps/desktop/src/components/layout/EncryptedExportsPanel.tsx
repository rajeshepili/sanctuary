import { CheckCircle2, FileKey2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { isDesktopApp } from '#/lib/is-desktop'
import type { UserPreferences } from '#/types'
import type { UpdatePreferencesInput } from '#/features/preferences/preferences.schema'

type Props = {
  prefs: UserPreferences
  exportLoading: boolean
  update: (patch: UpdatePreferencesInput, msg?: string) => void
  onChooseFolder: () => void
  onCreateExport: () => void
}

export function EncryptedExportsPanel({
  prefs,
  exportLoading,
  update,
  onChooseFolder,
  onCreateExport,
}: Props) {
  if (!isDesktopApp()) {
    return (
      <p className="text-sm text-muted-foreground">
        Encrypted <code className="text-xs">.enc</code> exports are available in
        the installed desktop app.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Save passphrase-protected <code className="text-xs">.enc</code> files to
        a folder you choose. You run exports manually — nothing uploads
        automatically.
      </p>
      {!prefs.syncDirectory ? (
        <Button type="button" className="w-full" onClick={onChooseFolder}>
          <FileKey2 className="w-4 h-4 mr-2" /> Choose export folder
        </Button>
      ) : (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="w-4 h-4 text-green-600" /> Folder ready
          </div>
          <code className="block text-xs truncate">{prefs.syncDirectory}</code>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={exportLoading}
              onClick={onCreateExport}
            >
              <FileKey2 className="w-4 h-4 mr-1" />
              {exportLoading ? 'Exporting…' : 'Create .enc export'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                update({
                  syncDirectory: null,
                  syncPassphraseHash: null,
                  lastSyncedAt: null,
                })
              }
            >
              Remove folder
            </Button>
          </div>
          {prefs.lastSyncedAt && (
            <p className="text-xs text-muted-foreground">
              Last export: {new Date(prefs.lastSyncedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
