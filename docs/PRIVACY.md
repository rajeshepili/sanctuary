# Privacy

Sanctuary is built for one person on one machine. Here is what that means in practice.

## The short version

| Topic | What Sanctuary does |
| ----- | ------------------- |
| Accounts | None. No sign-up server. |
| Encrypted exports | Optional `.enc` files you write to a folder you pick |
| Analytics | No third-party analytics |
| Where data lives | SQLite database and a `media/` folder on your computer |
| Network | The app talks to a local server on your machine, not the public internet |

## What gets stored on disk

- Journal entries, identities, preferences, and prompt usage
- Image attachments you add to entries
- An optional 4-digit PIN, stored as a salted hash in the local database

## Development vs the installed app

- **`pnpm dev`**: uses `dev.db` in the project folder unless you point `DATABASE_URL` somewhere else.
- **Installed desktop app**: stores data in your OS app-data folder (for example `~/.config/sanctuary/` on Linux).

## Things only you can do

- Back up the database and media folder if your entries matter to you.
- Anyone who can log into your computer can read local files unless you use disk encryption and a strong OS password.
- Export folders you create (for example under `Documents/Sanctuary Exports`) are plain files you chose to write.

## Open source

The code is public. Running Sanctuary does not send your journal text to the maintainers.

To report a security issue, see [SECURITY.md](../SECURITY.md).
