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
  Cloud,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Switch } from '#/components/ui/switch'
import { Button } from '#/components/ui/button'
import { ScrollArea } from '#/components/ui/scroll-area'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '#/components/ui/drawer'
import { CategoryManager } from '#/features/habits/components/CategoryManager'
import {
  exportMarkdown,
  exportAllData,
} from '#/features/journal/journal.export'
import { runHumanReadableExport } from '#/features/journal/journal.export.service'
import { performEncryptedSync } from '#/features/preferences/preferences.sync.service'
import { toast } from 'sonner'
import { PinModal } from './PinModal'
import { useState, useEffect } from 'react'
import { hashPin, verifyPin } from '#/utils/crypto'
import { formatCoordinates } from '#/lib/format-coordinates'
import { IconButton } from '#/components/ui/icon-button'
import { useUIStore } from '#/stores/ui-store'
import { usePreferencesQueries } from '#/features/preferences/preferences.queries'
import { usePreferencesMutations } from '#/features/preferences/preferences.mutations'
import type { UpdatePreferencesInput } from '#/features/preferences/preferences.schema'

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
      <div>
        <div className="text-sm font-bold">{label}</div>
        <div className="text-[11px] text-muted-foreground">{description}</div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary"
      />
    </label>
  )
}

export function SanctuarySettings() {
  const { prefs } = usePreferencesQueries()
  const { updatePreferences } = usePreferencesMutations()

  const [pinModalMode, setPinModalMode] = useState<'enable' | 'disable' | null>(
    null,
  )
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [locLoading, setLocLoading] = useState(false)
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false)
  const [updateCheckLoading, setUpdateCheckLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)

  const isDesktop = typeof window !== 'undefined' && window.sanctuary?.isDesktop
  const { setLocked } = useUIStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!window.sanctuary) return
    void window.sanctuary.getAutoUpdateEnabled().then(setAutoUpdateEnabled)
  }, [])

  const update = (patch: UpdatePreferencesInput, successMessage?: string) => {
    updatePreferences.mutate(patch, {
      onSuccess: () => {
        if (successMessage) toast.success(successMessage)
      },
    })
  }

  const handleGrantLocation = () => {
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        update(
          {
            latitude,
            longitude,
            locationLabel: formatCoordinates(latitude, longitude),
          },
          'Location saved.',
        )
        setLocLoading(false)
      },
      () => {
        toast.error(
          'Location access denied. Scenes use your local timezone instead.',
        )
        setLocLoading(false)
      },
      { timeout: 8000 },
    )
  }

  const handleAutoUpdateToggle = async (enabled: boolean) => {
    if (!window.sanctuary) return
    await window.sanctuary.setAutoUpdateEnabled(enabled)
    setAutoUpdateEnabled(enabled)
    toast.success(
      enabled ? 'Auto-update checks enabled.' : 'Auto-update checks disabled.',
    )
  }

  const handleCheckForUpdates = async () => {
    if (!window.sanctuary) return
    setUpdateCheckLoading(true)
    try {
      await window.sanctuary.checkForUpdates()
      toast.message('Update check complete.')
    } catch {
      toast.error('Could not check for updates.')
    } finally {
      setUpdateCheckLoading(false)
    }
  }

  const handleSetupSync = async () => {
    if (!window.sanctuary) return
    const dir = await window.sanctuary.selectDirectory()
    if (!dir) return

    // For now, use the Privacy PIN as the sync passphrase if available, or ask for one.
    // Simplifying for now: Use a default or prompt.
    const passphrase = prompt('Enter a passphrase for E2E encryption:')
    if (!passphrase) return

    const hashed = await hashPin(passphrase) // We can reuse hashPin for simplicity or just use raw if it's high entropy

    update(
      {
        syncDirectory: dir,
        syncPassphraseHash: hashed,
      },
      'Sync directory configured.',
    )
  }

  const handleRunSync = async () => {
    if (!prefs.syncDirectory) return
    setSyncLoading(true)
    try {
      // In a real app we'd prompt for the passphrase or get it from a secure store
      const passphrase = prompt('Enter your sync passphrase to proceed:')
      if (!passphrase) {
        setSyncLoading(false)
        return
      }

      const syncedAt = await performEncryptedSync(
        prefs.syncDirectory,
        passphrase,
      )
      if (syncedAt) {
        update({ lastSyncedAt: syncedAt }, 'Sync complete.')
      }
    } catch (e) {
      toast.error('Sync failed. Check passphrase.')
    } finally {
      setSyncLoading(false)
    }
  }

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <IconButton
            tooltip="Personalize Sanctuary"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-5 h-5" />
          </IconButton>
        </DrawerTrigger>

        <DrawerContent className="max-h-[95vh] flex flex-col">
          <ScrollArea className="w-full">
            <div className="mx-auto w-full max-w-2xl p-6 md:p-8 space-y-8">
              <DrawerHeader className="p-0 space-y-2">
                <DrawerTitle className="text-2xl font-bold">
                  Settings
                </DrawerTitle>
                <DrawerDescription className="text-sm text-muted-foreground">
                  Customize what tools are shown on your dashboard.
                </DrawerDescription>
              </DrawerHeader>

              <div className="pt-4 border-t border-border/10 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pb-2">
                  Habit Categories
                </h3>
                <CategoryManager />
              </div>

              <div className="pt-4 border-t border-border/10 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pb-2">
                  Data
                </h3>

                <div className="flex flex-col gap-2">
                  {isDesktop && (
                    <Button
                      variant="outline"
                      onClick={() => void runHumanReadableExport()}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-left cursor-pointer h-auto"
                    >
                      <div>
                        <div className="text-sm font-bold flex items-center gap-2 text-foreground">
                          <FolderArchive className="w-4 h-4 text-primary" />{' '}
                          Export Human-Readable Archive
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1 font-normal">
                          Creates a structured folder with Markdown entries,
                          media, and a local viewer.
                        </div>
                      </div>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const result = await exportMarkdown()
                        const blob = new Blob([result.content], {
                          type: 'text/markdown',
                        })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `sanctuary-export-${new Date().toISOString().split('T')[0]}.md`
                        a.click()
                        URL.revokeObjectURL(url)
                        toast.success(`Exported ${result.count} entries`)
                      } catch {
                        toast.error('Failed to export data')
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-foreground/3 transition-colors text-left cursor-pointer h-auto"
                  >
                    <div>
                      <div className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                        <Download className="w-4 h-4 text-muted-foreground" />{' '}
                        Export Single Markdown
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const result = await exportAllData()
                        const blob = new Blob(
                          [JSON.stringify(result, null, 2)],
                          {
                            type: 'application/json',
                          },
                        )
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `sanctuary-backup-${new Date().toISOString().split('T')[0]}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                        toast.success(
                          `Exported ${result.entries.length} entries`,
                        )
                      } catch {
                        toast.error('Failed to export data')
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-foreground/3 transition-colors text-left cursor-pointer h-auto"
                  >
                    <div>
                      <div className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                        <Download className="w-4 h-4 text-muted-foreground" />{' '}
                        Export JSON Backup
                      </div>
                    </div>
                  </Button>
                </div>
              </div>

              {isDesktop && (
                <div className="pt-4 border-t border-border/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pb-2">
                    Sync
                  </h3>

                  {!prefs.syncDirectory ? (
                    <button
                      onClick={handleSetupSync}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-foreground/3 transition-colors text-left cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-bold flex items-center gap-2">
                          <Cloud className="w-4 h-4 text-primary" /> Setup Local
                          Encrypted Sync
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          Select a folder (like Dropbox or iCloud) to keep your
                          data synced across devices with E2E encryption.
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-bold flex items-center gap-2">
                            <Cloud className="w-3.5 h-3.5 text-primary" /> Sync
                            Active
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {prefs.syncDirectory}
                          </div>
                          {prefs.lastSyncedAt && (
                            <div className="text-[9px] text-primary/70 mt-1 uppercase font-bold">
                              Last synced:{' '}
                              {new Date(prefs.lastSyncedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <IconButton
                            tooltip="Run Sync Now"
                            onClick={handleRunSync}
                            disabled={syncLoading}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary disabled:opacity-50"
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`}
                            />
                          </IconButton>
                          <IconButton
                            tooltip="Remove Sync"
                            onClick={() =>
                              update(
                                {
                                  syncDirectory: null,
                                  syncPassphraseHash: null,
                                  lastSyncedAt: null,
                                },
                                'Sync disabled.',
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                          >
                            <XIcon className="w-4 h-4" />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-border/10 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pb-2">
                  Trash & Recovery
                </h3>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false)
                    navigate({ to: '/trash' })
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-foreground/3 transition-colors text-left cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-bold flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-primary" /> View Trash
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      Recover or permanently delete trashed entries.
                    </div>
                  </div>
                </button>
              </div>

              <div className="pt-4 border-t border-border/10 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pb-2">
                  Scene Location
                </h3>

                {prefs.latitude && prefs.longitude ? (
                  <div className="flex items-start justify-between gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">
                          {prefs.locationLabel ??
                            `${prefs.latitude.toFixed(2)}°, ${prefs.longitude.toFixed(2)}°`}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Saved locally. Coordinates are never sent over the
                          network.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <IconButton
                        tooltip="Update location"
                        onClick={handleGrantLocation}
                        disabled={locLoading}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0 disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${locLoading ? 'animate-spin' : ''}`}
                        />
                      </IconButton>
                      <IconButton
                        tooltip="Clear location"
                        onClick={() =>
                          update(
                            {
                              latitude: null,
                              longitude: null,
                              locationLabel: null,
                            },
                            'Location cleared.',
                          )
                        }
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </IconButton>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleGrantLocation}
                    disabled={locLoading}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-foreground/3 transition-colors text-left cursor-pointer disabled:opacity-60"
                  >
                    <div>
                      <div className="text-sm font-bold flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        {locLoading
                          ? 'Detecting location…'
                          : 'Enable Location-Aware Scenes'}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        Uses the OS location API only — no internet lookup.
                        Falls back to timezone if denied.
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {isDesktop && (
                <div className="pt-4 border-t border-border/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pb-2">
                    Updates
                  </h3>
                  <ToggleRow
                    label="Automatic update checks"
                    description="Checks GitHub for new releases on startup. Only version metadata is fetched — no journal data is sent."
                    checked={autoUpdateEnabled}
                    onChange={(val) => void handleAutoUpdateToggle(val)}
                  />
                  <Button
                    variant="outline"
                    disabled={updateCheckLoading}
                    onClick={() => void handleCheckForUpdates()}
                    className="w-full"
                  >
                    {updateCheckLoading ? 'Checking…' : 'Check for updates now'}
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t border-border/10 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/10 pb-2">
                  App Lock
                </h3>

                <div className="flex flex-col gap-2">
                  {!prefs.privacyPin ? (
                    <button
                      onClick={() => {
                        setPinModalMode('enable')
                        setIsDrawerOpen(false)
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-foreground/3 transition-colors text-left cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-bold flex items-center gap-2">
                          <Lock className="w-4 h-4 text-primary" /> Enable App
                          Lock
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          Require a 4-digit PIN when opening Sanctuary.
                        </div>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setPinModalMode('disable')
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-foreground/3 transition-colors text-left cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-bold flex items-center gap-2">
                          <Unlock className="w-4 h-4 text-amber-500" /> Disable
                          App Lock
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          Remove the PIN requirement on startup.
                        </div>
                      </div>
                    </button>
                  )}
                  {prefs.privacyPin && (
                    <button
                      onClick={() => {
                        setLocked(true)
                        setIsDrawerOpen(false)
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-foreground/3 transition-colors text-left cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-bold flex items-center gap-2 text-primary">
                          <Lock className="w-4 h-4 text-primary" /> Lock Now
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          Require a PIN next time the app opens.
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border/10">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />

                  <div className="text-xs flex-1">
                    <div className="font-bold">Privacy & Disclaimer</div>
                    <p className="opacity-90 mt-1">
                      All data is stored locally on your device. This is not a
                      substitute for professional mental health care.
                    </p>
                  </div>

                  {prefs.disclaimerAgreed ? (
                    <span className="text-[10px] px-2 py-1 rounded bg-amber-500/20 shrink-0">
                      Agreed
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => update({ disclaimerAgreed: true })}
                      className="shrink-0"
                    >
                      I Agree
                    </Button>
                  )}
                </div>
              </div>

              <DrawerFooter className="p-0 mt-6">
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      {pinModalMode && (
        <PinModal
          mode={pinModalMode}
          onClose={() => setPinModalMode(null)}
          onSubmit={async (pin) => {
            if (pinModalMode === 'enable') {
              update({ privacyPin: pin }, 'App Lock enabled.')
            } else {
              const isValid = await verifyPin(pin, prefs.privacyPin || '')
              if (!isValid) {
                toast.error('Incorrect PIN.')
                return
              }
              update({ privacyPin: null }, 'App Lock disabled.')
            }
            setPinModalMode(null)
          }}
        />
      )}
    </>
  )
}
