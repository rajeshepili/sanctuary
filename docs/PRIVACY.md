# Privacy

Sanctuary is designed with privacy as its core principle. Unlike most modern apps, Sanctuary does not "phone home" or store your data on our servers.

## Data Ownership

- **Local Storage:** All your journal entries, habits, and preferences are stored directly on your computer in a SQLite database.
- **Media Files:** Any images or videos you attach are copied to a local folder in your application data directory.
- **No Cloud Sync:** By default, there is no cloud synchronization. Your data never leaves your device unless you manually back it up or export it.

## Network Activity

Sanctuary's network activity is minimal and strictly limited to:
- **Local Communication:** Communicating with its own internal server (on `127.0.0.1`).
- **Auto-Updates:** If enabled, the app checks for new versions via GitHub Releases using `electron-updater`. This can be disabled in Preferences.

## Security Features

- **Privacy PIN:** You can set a 4-digit PIN in the app preferences. This PIN is required to unlock the app and is stored securely in the local database.
- **Session Tokens:** Communication between the UI and the internal server is secured by a one-time session token, preventing other applications on your machine from accessing your data.

## Your Responsibilities

Since Sanctuary is local-only, **you are responsible for your data**. If you lose access to your computer or delete the application data folder without a backup, your entries cannot be recovered. We recommend regular backups of your `userData` directory.
