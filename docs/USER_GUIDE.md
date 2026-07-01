# User guide

Quick answers for everyday use of Sanctuary.

## Install

Download the installer for your OS from [GitHub Releases](https://github.com/rajeshepili/sanctuary/releases):

- **Linux**: `.AppImage` or `.deb`
- **macOS**: `.dmg`
- **Windows**: `.exe` (NSIS installer)

On first launch you choose **Quick start** (disclaimer only) or **Full setup** (name, disclaimer, backups, layout, optional PIN). Both paths require accepting that your data stays on this device only.

## Layout

In **Settings → General** (or during full onboarding) you can pick:

- **Compact header** — scene in the background, content near the top (default)
- **Full-screen scene** — landscape fills the viewport; scroll down to write on Home

## Journal

- Write on the home page or open **Journal** for past entries.
- Drafts auto-save while you type.
- Deleted entries go to **Trash** for 30 days before permanent removal (see Settings → Trash).

## Identities

- Create identities from the **Identities** page.
- Consistency is measured over a rolling window (default 30 days), not a single unbroken streak.
- Use **Rest mode** when you need a break without guilt-tripping yourself.

## Backups and restore

**Settings → Data** covers local backups and exports.

- Default backup folder: `~/Documents/Sanctuary Backups`
- **Daily** or **weekly** schedules run while the app is open — not a cloud service
- **Back up now** writes a JSON file immediately
- **Restore** from a `.json` or `.enc` file (merge new entries or replace all)

Keep backups somewhere safe. If you uninstall without a backup, your data is gone.

## Exports

From **Settings → Data**:

- **JSON backup** — full snapshot (journal + identities), good for restore
- **Single Markdown file** — one `.md` with all entries
- **Human-readable folder** (desktop) — markdown files plus media

## Encrypted exports (desktop)

**Settings → Encrypted exports** lets you save passphrase-protected `.enc` files to a folder you choose (USB drive, Dropbox folder, etc.). You run exports manually — nothing uploads automatically.

If you forget the passphrase, those files cannot be decrypted.

## App lock (PIN)

Settings → **App lock** lets you set a 4-digit PIN on cold start.

- The PIN is hashed locally; it is not sent anywhere.
- This is a casual screen lock, not full-disk encryption. Someone with file access to your computer can still read the database.
- Use **Lock now** in settings to require the PIN again without restarting.

## Auto-update

On desktop, you can enable update checks from Settings. The app only talks to GitHub to see if a newer release exists. Turn it off if you want zero network use.

## Where is my data?

| Item | Location (desktop) |
| ---- | ------------------ |
| Database | OS app-data folder / `sanctuary.db` |
| Photos | `media/` next to the database |
| Scheduled backups | Folder you configured (or Documents default) |

## Need help?

- [Guides on the website](https://rajeshepili.github.io/sanctuary/guides)
- [Report a bug](https://github.com/rajeshepili/sanctuary/issues)
- [Privacy details](PRIVACY.md)
