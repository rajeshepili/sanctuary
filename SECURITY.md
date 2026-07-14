# Security policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |

Security fixes are published on the `main` branch and in subsequent tagged releases.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Email or open a **private** security advisory on GitHub:

- Repository: [rajeshepili/sanctuary](https://github.com/rajeshepili/sanctuary)
- Maintainer: [rajeshepili@users.noreply.github.com](mailto:rajeshepili@users.noreply.github.com)

Include:

- A description of the issue and potential impact
- Steps to reproduce (if applicable)
- Your environment (OS, Sanctuary version, web vs desktop)

We aim to acknowledge reports within **5 business days** and will coordinate disclosure
once a fix is available.

## Scope

Sanctuary is a **local, single-user** application. Typical scope:

- Local data exposure paths (SQLite, media files, exports)
- Desktop packaging and update integrity
- PIN / privacy controls bypass

Out of scope for this project:

- Hosted multi-tenant infrastructure (there is none)
- Third-party cloud services you configure outside this repository

## Safe use

- Keep backups of your database and media directory.
- Use a strong device login and filesystem encryption where possible.
- Do not share your local database or export folders publicly.
