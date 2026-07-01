import {
  Settings,
  ShieldAlert,
  Download,
  Lock,
  Unlock,
  MapPin,
  Globe,
  X as XIcon,
  RefreshCw,
  Trash2,
  FolderArchive,
  ListTodo,
  Database,
  Paintbrush,
  FolderOpen,
  AlertTriangle,
  Upload,
  LayoutTemplate,
  Monitor,
  Shield,
  Info,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Switch } from '#/components/ui/switch'
import { Button } from '#/components/ui/button'
import { ScrollArea } from '#/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { Tooltip, TooltipTrigger, TooltipContent } from '#/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { CategoryManager } from '#/features/habits/subdomains/categories/components/CategoryManager'
import {
  exportMarkdown,
  exportAllData,
  importBackupFromJson,
} from '#/features/export/export.api'
import { runHumanReadableExport } from '#/features/export/export.service'
import {
  createEncryptedExport,
  restoreEncryptedExport,
} from '#/features/export/export.encrypted.service'
import { toast } from 'sonner'
import { PinModal } from './PinModal'
import { PassphraseModal } from './PassphraseModal'
import { useState, useEffect, useCallback, memo } from 'react'
import { hashPin, verifyPin } from '#/utils/crypto'
import { formatCoordinates } from '#/lib/format-coordinates'
import { IconButton } from '#/components/ui/icon-button'
import { sessionStore } from '#/lib/session-store'
import { useUIStore } from '#/stores/ui-store'
import { preferencesQueryOptions } from '#/features/preferences/preferences.options'
import { usePreferencesMutations } from '#/features/preferences/preferences.mutations'
import type { UpdatePreferencesInput } from '#/features/preferences/preferences.schema'
import { APP_REPO_URL } from '#/config/branding'
import { journalKeys } from '#/features/journal/journal.keys'
import type { UserPreferences } from '#/types'
import { isDesktopApp } from '#/lib/is-desktop'
import { EncryptedExportsPanel } from './EncryptedExportsPanel'

const SETTINGS_TABS: { value: string; icon: LucideIcon; label: string }[] = [
  { value: 'general', icon: Paintbrush, label: 'General' },
  { value: 'data', icon: Database, label: 'Data' },
  { value: 'appearance', icon: Monitor, label: 'Appearance' },
  { value: 'habits', icon: ListTodo, label: 'Identities' },
  { value: 'security', icon: Shield, label: 'Security' },
]

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between p-3 rounded-xl border border-border/50 cursor-pointer hover:bg-foreground/3 transition-colors">
      <div className="pr-4">
        <div className="text-sm font-bold">{label}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}

type BackupStatus = {
  count: number
  oldest: string | null
  newest: string | null
  failureCount: number
  backupPath: string
}

const GeneralPanel = memo(function GeneralPanel({
  prefs,
  update,
  autoUpdateEnabled,
  autoLaunchEnabled,
  onAutoUpdateToggle,
  onAutoLaunchToggle,
  onCheckUpdates,
  updateCheckLoading,
  locLoading,
  onGrantLocation,
}: {
  prefs: UserPreferences
  update: (p: UpdatePreferencesInput, msg?: string) => void
  autoUpdateEnabled: boolean
  autoLaunchEnabled: boolean
  onAutoUpdateToggle: (v: boolean) => void
  onAutoLaunchToggle: (v: boolean) => void
  onCheckUpdates: () => void
  updateCheckLoading: boolean
  locLoading: boolean
  onGrantLocation: () => void
}) {
  const isDesktop = isDesktopApp()

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-primary">Layout</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {(
            [
              ['standard', 'Compact header', 'Content starts near the top.'],
              ['immersive', 'Full-screen scene', 'Scroll down from the landscape.'],
            ] as const
          ).map(([value, label, desc]) => (
            <button
              key={value}
              type="button"
              onClick={() => update({ layoutMode: value }, 'Layout updated.')}
              className={`text-left p-3 rounded-xl border text-sm ${prefs.layoutMode === value
                  ? 'border-primary bg-primary/5'
                  : 'border-border/50'
                }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <LayoutTemplate className="w-3.5 h-3.5" /> {label}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-primary">Scene location</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground opacity-60 hover:opacity-100 cursor-help transition-opacity" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm p-3 text-xs">
              <div className="flex flex-col gap-2.5">
                <p><strong>Why:</strong> Calculates accurate sunrise and sunset times to dynamically change the background scene to match your local time of day.</p>
                <p><strong>What:</strong> Only rough latitude and longitude are collected.</p>
                <p><strong>How often:</strong> Only fetched exactly once when you click the button.</p>
                <p><strong>Tip:</strong> Once granted and saved, you can completely disable location services in your OS/browser and Sanctuary will continue using the saved coordinates permanently.</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        {prefs.latitude && prefs.longitude ? (
          <div className="flex items-start justify-between gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex gap-2 min-w-0">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-bold truncate">
                  {prefs.locationLabel ??
                    `${prefs.latitude.toFixed(2)}°, ${prefs.longitude.toFixed(2)}°`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for sunrise/sunset scenes. Never sent online.
                </p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <IconButton tooltip="Refresh" onClick={onGrantLocation} disabled={locLoading}>
                <RefreshCw className={`w-4 h-4 ${locLoading ? 'animate-spin' : ''}`} />
              </IconButton>
              <IconButton
                tooltip="Clear"
                onClick={() =>
                  update({ latitude: null, longitude: null, locationLabel: null })
                }
              >
                <XIcon className="w-4 h-4" />
              </IconButton>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full justify-start gap-2" onClick={onGrantLocation} disabled={locLoading}>
            <Globe className="w-4 h-4" />
            {locLoading ? 'Detecting…' : 'Use location for scenes'}
          </Button>
        )}
      </section>

      {isDesktop && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-primary">System</h3>
          <ToggleRow
            label="Start on login"
            description="Opens minimized to the system tray."
            checked={autoLaunchEnabled}
            onChange={onAutoLaunchToggle}
          />
          <ToggleRow
            label="Check for updates"
            description="Looks at GitHub for new releases. No journal data is sent."
            checked={autoUpdateEnabled}
            onChange={onAutoUpdateToggle}
          />
          <Button variant="outline" className="w-full" disabled={updateCheckLoading} onClick={onCheckUpdates}>
            {updateCheckLoading ? 'Checking…' : 'Check now'}
          </Button>
        </section>
      )}
    </div>
  )
})

export function SanctuarySettings() {
  const { data: prefs } = useSuspenseQuery(preferencesQueryOptions())
  const { updatePreferences } = usePreferencesMutations()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const lockPinSession = useUIStore((s) => s.lockPinSession)
  const unlockPinSession = useUIStore((s) => s.unlockPinSession)

  const [activeTab, setActiveTab] = useState('general')
  const [isOpen, setIsOpen] = useState(false)
  const [pinModalMode, setPinModalMode] = useState<'enable' | 'disable' | null>(null)
  const [passphraseModal, setPassphraseModal] = useState<'export-setup' | 'export-run' | 'restore' | null>(null)
  const [pendingExportDir, setPendingExportDir] = useState<string | null>(null)
  const [pendingRestorePath, setPendingRestorePath] = useState<string | null>(null)
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge')

  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false)
  const [autoLaunchEnabled, setAutoLaunchEnabled] = useState(false)
  const [locLoading, setLocLoading] = useState(false)
  const [updateCheckLoading, setUpdateCheckLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null)

  const isDesktop = isDesktopApp()

  useEffect(() => {
    if (!window.sanctuary) return
    void window.sanctuary.getAutoUpdateEnabled().then(setAutoUpdateEnabled)
    void window.sanctuary.getAutoLaunch().then(setAutoLaunchEnabled)
  }, [])

  const fetchBackupStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/backup', { method: 'POST' })
      if (res.ok) setBackupStatus((await res.json()) as BackupStatus)
    } catch {
      // non-critical
    }
  }, [])

  useEffect(() => {
    if (isOpen && activeTab === 'data') void fetchBackupStatus()
  }, [isOpen, activeTab, fetchBackupStatus])

  const update = useCallback(
    (patch: UpdatePreferencesInput, successMessage?: string) => {
      updatePreferences.mutate(patch, {
        onSuccess: () => {
          if (successMessage) toast.success(successMessage)
        },
      })
    },
    [updatePreferences],
  )

  const openPassphrase = (mode: 'export-setup' | 'export-run' | 'restore') => {
    setIsOpen(false)
    setPassphraseModal(mode)
  }

  const handleChooseExportFolder = async () => {
    const dir = await window.sanctuary?.selectDirectory()
    if (dir) {
      setPendingExportDir(dir)
      openPassphrase('export-setup')
    }
  }

  const handleCreateEncExport = () => {
    openPassphrase('export-run')
  }

  const invalidateJournal = () => {
    void queryClient.invalidateQueries({ queryKey: journalKeys.entries })
    void queryClient.invalidateQueries({ queryKey: journalKeys.trash })
  }

  const handleGrantLocation = () => {
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update(
          {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            locationLabel: formatCoordinates(pos.coords.latitude, pos.coords.longitude),
          },
          'Location saved.',
        )
        setLocLoading(false)
      },
      () => {
        toast.error('Location denied — using timezone instead.')
        setLocLoading(false)
      },
      { timeout: 8000 },
    )
  }

  const handleRestoreJson = async (mode: 'merge' | 'replace') => {
    if (!window.sanctuary?.selectBackupFile || !window.sanctuary.readFileText) return
    const filePath = await window.sanctuary.selectBackupFile()
    if (!filePath) return

    setRestoreLoading(true)
    try {
      if (filePath.endsWith('.enc')) {
        setPendingRestorePath(filePath)
        setRestoreMode(mode)
        openPassphrase('restore')
        return
      }
      const json = await window.sanctuary.readFileText(filePath)
      if (!json) throw new Error('Empty file')
      const result = await importBackupFromJson({ data: { json, mode } })
      invalidateJournal()
      toast.success(`Restored ${result.entriesImported} entries.`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Restore failed.')
    } finally {
      setRestoreLoading(false)
    }
  }

  const handleConfirmRestorePassphrase = async (passphrase: string) => {
    if (!pendingRestorePath) return
    setPassphraseModal(null)
    setRestoreLoading(true)
    try {
      const result = await restoreEncryptedExport(
        pendingRestorePath,
        passphrase,
        restoreMode,
      )
      invalidateJournal()
      toast.success(`Restored ${result.entriesImported} entries.`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Restore failed.')
    } finally {
      setRestoreLoading(false)
      setPendingRestorePath(null)
    }
  }

  const handleConfirmExportPassphrase = async (passphrase: string) => {
    if (passphraseModal === 'export-setup' && pendingExportDir) {
      const hashed = await hashPin(passphrase)
      update(
        { syncDirectory: pendingExportDir, syncPassphraseHash: hashed },
        'Export folder saved.',
      )
      setPendingExportDir(null)
      setPassphraseModal(null)
      return
    }

    if (passphraseModal === 'export-run' && prefs.syncDirectory) {
      setPassphraseModal(null)
      setExportLoading(true)
      try {
        const at = await createEncryptedExport(prefs.syncDirectory, passphrase)
        update({ lastSyncedAt: at }, 'Encrypted export saved.')
      } catch {
        toast.error('Export failed. Check the folder and passphrase.')
      } finally {
        setExportLoading(false)
      }
    }
  }

  const handleBackupNow = async () => {
    setBackupLoading(true)
    try {
      const res = await fetch('/api/backup?action=run', { method: 'POST' })
      if (res.ok) {
        await fetchBackupStatus()
        toast.success('Backup saved.')
      } else toast.error('Backup failed.')
    } finally {
      setBackupLoading(false)
    }
  }

  const handleOpenBackupFolder = async () => {
    if (!window.sanctuary?.openBackupDir) return
    const dir = backupStatus?.backupPath ?? (await window.sanctuary.getBackupDir())
    await window.sanctuary.openBackupDir(dir)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <IconButton tooltip="Settings" className="p-2 rounded-full hover:bg-foreground/5">
            <Settings className="w-5 h-5" />
          </IconButton>
        </DialogTrigger>

        <DialogContent className="w-[92vw] sm:max-w-4xl p-0 gap-0 h-[min(85vh,720px)] flex flex-col">
          <DialogHeader className="px-6 py-5 border-b shrink-0">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" /> Settings
            </DialogTitle>
            <DialogDescription>
              <a href={`${APP_REPO_URL}/blob/main/docs/USER_GUIDE.md`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                User guide
              </a>
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 min-h-0 flex-col sm:flex-row">
            <div className="sm:hidden px-4 pt-3">
              <select
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                <option value="general">General</option>
                <option value="data">Data</option>
                <option value="appearance">Appearance</option>
                <option value="habits">Identities</option>
                <option value="security">Security</option>
              </select>
            </div>
            <div className="w-52 border-r p-4 shrink-0 hidden sm:block">
              <TabsList className="flex flex-col h-auto w-full bg-transparent gap-1">
                {SETTINGS_TABS.map(({ value, icon: Icon, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="w-full justify-start gap-2 rounded-lg px-3 py-2.5 data-[state=active]:bg-primary/12 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border data-[state=active]:border-primary/25 data-[state=inactive]:hover:bg-muted/60"
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 max-w-2xl">
                {activeTab === 'general' && (
                  <GeneralPanel
                    prefs={prefs}
                    update={update}
                    autoUpdateEnabled={autoUpdateEnabled}
                    autoLaunchEnabled={autoLaunchEnabled}
                    onAutoUpdateToggle={async (v) => {
                      if (!window.sanctuary) return
                      await window.sanctuary.setAutoUpdateEnabled(v)
                      setAutoUpdateEnabled(v)
                    }}
                    onAutoLaunchToggle={async (v) => {
                      if (!window.sanctuary) return
                      await window.sanctuary.setAutoLaunch(v)
                      setAutoLaunchEnabled(v)
                    }}
                    onCheckUpdates={async () => {
                      setUpdateCheckLoading(true)
                      try {
                        await window.sanctuary?.checkForUpdates()
                        toast.message('Update check finished.')
                      } finally {
                        setUpdateCheckLoading(false)
                      }
                    }}
                    updateCheckLoading={updateCheckLoading}
                    locLoading={locLoading}
                    onGrantLocation={handleGrantLocation}
                  />
                )}

                {activeTab === 'data' && (
                  <div className="space-y-8">
                    {isDesktop && (
                      <section className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-primary">Automatic backups</h3>
                          {backupStatus && backupStatus.failureCount >= 3 && (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Failing
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Saves a JSON file to your computer while Sanctuary is open. Not a cloud service.
                        </p>
                        <div className="p-3 rounded-xl border bg-muted/30 text-sm space-y-1">
                          <p>
                            <span className="text-muted-foreground">Last backup: </span>
                            {prefs.lastBackupAt
                              ? new Date(prefs.lastBackupAt).toLocaleString()
                              : 'None yet'}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Files: </span>
                            {backupStatus?.count ?? '—'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {(['daily', 'weekly', 'manual'] as const).map((freq) => (
                            <Button
                              key={freq}
                              type="button"
                              size="sm"
                              variant={prefs.backupFrequency === freq ? 'default' : 'outline'}
                              className="flex-1 capitalize"
                              onClick={() =>
                                update({
                                  backupFrequency: freq,
                                  backupEnabled: freq !== 'manual',
                                })
                              }
                            >
                              {freq}
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => void handleOpenBackupFolder()}>
                            <FolderOpen className="w-4 h-4 mr-1" /> Open folder
                          </Button>
                          <Button type="button" size="sm" className="flex-1" disabled={backupLoading} onClick={() => void handleBackupNow()}>
                            <RefreshCw className={`w-4 h-4 mr-1 ${backupLoading ? 'animate-spin' : ''}`} />
                            Back up now
                          </Button>
                        </div>
                      </section>
                    )}

                    <section className="space-y-3">
                      <h3 className="text-sm font-bold text-primary">Restore from backup</h3>
                      <p className="text-xs text-muted-foreground">
                        Pick a `.json` or `.enc` file you exported earlier.
                      </p>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" disabled={restoreLoading} onClick={() => void handleRestoreJson('merge')}>
                          <Upload className="w-4 h-4 mr-1" /> Merge entries
                        </Button>
                        <Button type="button" variant="destructive" size="sm" disabled={restoreLoading} onClick={() => void handleRestoreJson('replace')}>
                          Replace all entries
                        </Button>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-sm font-bold text-primary">Export</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        JSON backups use version 2 — journal entries and identities in plain text.
                        Good for long-term archives if you keep multiple copies. For sensitive
                        copies, use Encrypted exports instead.
                      </p>
                      <div className="grid gap-2">
                        {isDesktop && (
                          <Button type="button" variant="outline" className="justify-start" onClick={() => void runHumanReadableExport()}>
                            <FolderArchive className="w-4 h-4 mr-2" /> Human-readable folder
                          </Button>
                        )}
                        <Button type="button" variant="outline" className="justify-start" onClick={async () => {
                          const r = await exportMarkdown()
                          const blob = new Blob([r.content], { type: 'text/markdown' })
                          const a = document.createElement('a')
                          a.href = URL.createObjectURL(blob)
                          a.download = `sanctuary-${Date.now()}.md`
                          a.click()
                          toast.success(`Exported ${r.count} entries`)
                        }}>
                          <Download className="w-4 h-4 mr-2" /> Single Markdown file
                        </Button>
                        <Button type="button" variant="outline" className="justify-start" onClick={async () => {
                          const r = await exportAllData()
                          const blob = new Blob([JSON.stringify(r, null, 2)])
                          const a = document.createElement('a')
                          a.href = URL.createObjectURL(blob)
                          a.download = `sanctuary-backup-${Date.now()}.json`
                          a.click()
                          toast.success('JSON backup downloaded')
                        }}>
                          <Database className="w-4 h-4 mr-2" /> JSON backup file
                        </Button>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-sm font-bold text-primary">Encrypted .enc export</h3>
                      <EncryptedExportsPanel
                        prefs={prefs}
                        exportLoading={exportLoading}
                        update={update}
                        onChooseFolder={() => void handleChooseExportFolder()}
                        onCreateExport={handleCreateEncExport}
                      />
                    </section>

                    <section>
                      <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => { setIsOpen(false); navigate({ to: '/trash' }) }}>
                        <Trash2 className="w-4 h-4 mr-2 text-destructive" /> View trash
                      </Button>
                    </section>
                  </div>
                )}

                {activeTab === 'export' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-primary">Encrypted exports</h3>
                    <EncryptedExportsPanel
                      prefs={prefs}
                      exportLoading={exportLoading}
                      update={update}
                      onChooseFolder={() => void handleChooseExportFolder()}
                      onCreateExport={handleCreateEncExport}
                    />
                  </div>
                )}

                {activeTab === 'habits' && <CategoryManager />}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      PIN locks Sanctuary when you open the app. It is not full-disk encryption.
                    </p>
                    {!prefs.privacyPin ? (
                      <Button type="button" className="w-full justify-start" onClick={() => { setPinModalMode('enable'); setIsOpen(false) }}>
                        <Lock className="w-4 h-4 mr-2" /> Set up 4-digit PIN
                      </Button>
                    ) : (
                      <>
                        <div className="p-3 rounded-xl border bg-muted/30 text-sm flex items-center gap-2">
                          <Lock className="w-4 h-4 text-primary" />
                          <span>PIN is on — required on next app launch.</span>
                        </div>
                        <Button type="button" variant="outline" className="w-full justify-start" onClick={() => setPinModalMode('disable')}>
                          <Unlock className="w-4 h-4 mr-2" /> Turn off PIN
                        </Button>
                        <Button type="button" className="w-full justify-start" onClick={() => {
                          sessionStore.clearPinSession()
                          lockPinSession()
                          setIsOpen(false)
                        }}>
                          <Lock className="w-4 h-4 mr-2" /> Lock now
                        </Button>
                      </>
                    )}
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm flex gap-3">
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                      <p className="text-muted-foreground">
                        Data stays on your device. Sanctuary is not medical or mental-health advice.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {pinModalMode && (
        <PinModal
          mode={pinModalMode}
          onClose={() => setPinModalMode(null)}
          onSubmit={async (pin) => {
            if (pinModalMode === 'enable') {
              update({ privacyPin: pin }, 'PIN enabled.')
              sessionStore.setPinSessionUnlocked()
              unlockPinSession()
            } else if (await verifyPin(pin, prefs.privacyPin || '')) {
              update({ privacyPin: null }, 'PIN removed.')
              sessionStore.clearPinSession()
              lockPinSession()
            } else {
              toast.error('Wrong PIN.')
              return
            }
            setPinModalMode(null)
          }}
        />
      )}

      <PassphraseModal
        open={passphraseModal === 'export-setup'}
        title="Export passphrase"
        description="You'll need this to decrypt the file later. We cannot recover it."
        confirmLabel="Save"
        onClose={() => { setPassphraseModal(null); setPendingExportDir(null) }}
        onSubmit={handleConfirmExportPassphrase}
      />

      <PassphraseModal
        open={passphraseModal === 'export-run'}
        title="Enter export passphrase"
        description="Creates a new encrypted file in your export folder."
        confirmLabel="Export"
        onClose={() => setPassphraseModal(null)}
        onSubmit={handleConfirmExportPassphrase}
      />

      <PassphraseModal
        open={passphraseModal === 'restore'}
        title="Decrypt backup"
        description="Enter the passphrase for this encrypted export."
        confirmLabel="Restore"
        onClose={() => { setPassphraseModal(null); setPendingRestorePath(null) }}
        onSubmit={handleConfirmRestorePassphrase}
      />
    </>
  )
}
