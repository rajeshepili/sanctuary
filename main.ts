import { app, BrowserWindow, session } from 'electron'
import { join } from 'node:path'
import { fork } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
import net from 'node:net'
import electronUpdater from 'electron-updater'

const { autoUpdater } = electronUpdater

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

const isDev = !app.isPackaged

let serverProcess: ChildProcess | null = null
let mainWindow: BrowserWindow | null = null
let isQuitting = false

function showStartupError(win: BrowserWindow | null, error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  if (win) {
    win.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(getErrorHtml(message))}`,
    )
  }
}

/**
 * Polling mechanism to ensure the embedded server is actively accepting connections
 * before the main window attempts to load the application.
 */
const waitForPort = (port: number, timeout = isDev ? 10_000 : 45_000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now()

    const checkPort = () => {
      const socket = new net.Socket()
      socket.on('connect', () => {
        socket.destroy()
        resolve()
      })
      socket.on('error', () => {
        socket.destroy()
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for port ${port}`))
        } else {
          setTimeout(checkPort, 200)
        }
      })
      socket.connect(port, '127.0.0.1')
    }

    checkPort()
  })
}

function installContentSecurityPolicy() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' http://127.0.0.1:* http://localhost:*; object-src 'none'; base-uri 'self'",
        ],
      },
    })
  })
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  })

  mainWindow.setBackgroundColor('#1a1a1a')

  if (isDev) {
    const PORT = 3000
    console.log('Running in development mode...')
    mainWindow.loadURL(`http://localhost:${PORT}`)
    mainWindow.webContents.openDevTools()
  } else {
    console.log('Running in production mode, finding open port...')

    const getFreePort = () =>
      new Promise<number>((resolve, reject) => {
        const srv = net.createServer()
        srv.listen(0, () => {
          const addr = srv.address()
          const port = addr && typeof addr === 'object' ? addr.port : 0
          srv.close(() => resolve(port))
        })
        srv.on('error', reject)
      })

    try {
      const PORT = await getFreePort()

      const userDataPath = app.getPath('userData')
      const dbPath = join(userDataPath, 'sanctuary.db')
      const mediaPath = join(userDataPath, 'media')
      const migrationsPath = join(
        process.resourcesPath,
        'app.asar.unpacked',
        'drizzle',
      )

      const serverPath = join(
        process.resourcesPath,
        'app.asar.unpacked',
        '.output',
        'server',
        'index.mjs',
      )

      serverProcess = fork(serverPath, [], {
        execPath: process.execPath,
        execArgv: [],
        env: {
          ...process.env,
          PORT: PORT.toString(),
          NODE_ENV: 'production',
          DATABASE_URL: `file:${dbPath}`,
          MEDIA_STORAGE_PATH: mediaPath,
          MIGRATIONS_PATH: migrationsPath,
        },
        stdio: 'inherit',
      })

      serverProcess.on('exit', (code, signal) => {
        serverProcess = null
        if (
          !isQuitting &&
          code !== 0 &&
          mainWindow &&
          !mainWindow.isDestroyed()
        ) {
          console.error(
            `[server] Exited unexpectedly (code=${code}, signal=${signal})`,
          )
          showStartupError(
            mainWindow,
            new Error(
              `The local server exited unexpectedly (code ${code ?? signal}).\nPlease restart Sanctuary.`,
            ),
          )
        }
      })

      mainWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(getSplashHtml())}`,
      )

      await waitForPort(PORT)
      console.log(`Server is ready on port ${PORT}, loading window...`)
      mainWindow.loadURL(`http://localhost:${PORT}`)
    } catch (err) {
      console.error('Failed to start internal server:', err)
      showStartupError(mainWindow, err)
    }
  }
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.whenReady().then(() => {
  installContentSecurityPolicy()
  createWindow()

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.warn('Auto-updater failed to check for updates:', err.message)
    })
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

/**
 * Ensures the embedded Nitro server shuts down gracefully to allow SQLite WAL flushing.
 * Applies a 3-second timeout as a safety net against zombie processes.
 */
app.on('before-quit', (e) => {
  isQuitting = true
  if (serverProcess && !serverProcess.killed) {
    e.preventDefault()
    const forceQuitTimer = setTimeout(() => {
      console.warn('[server] Force-quitting after graceful shutdown timeout')
      app.exit(0)
    }, 3000)
    serverProcess.once('exit', () => {
      clearTimeout(forceQuitTimer)
      app.quit()
    })
    serverProcess.kill('SIGTERM')
  }
})

function getErrorHtml(message: string) {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sanctuary Startup Error</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      body { margin: 0; padding: 2rem; background: #0f172a; color: #f8fafc; }
      .card { max-width: 640px; margin: 4rem auto; padding: 2rem; border-radius: 24px; background: rgba(15, 23, 42, 0.94); border: 1px solid rgba(148, 163, 184, 0.3); box-shadow: 0 24px 80px rgba(15, 23, 42, 0.35); }
      h1 { margin-top: 0; font-size: 1.6rem; }
      p { line-height: 1.6; color: #cbd5e1; }
      code { display: block; white-space: pre-wrap; padding: 1rem; margin-top: 1rem; border-radius: 16px; background: rgba(30, 41, 59, 0.9); color: #fca5a5; }
      .hint { margin-top: 1.5rem; font-size: 0.95rem; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Sanctuary could not start</h1>
      <p>The desktop app could not connect to its local server. Please restart the app and check that the local services are available.</p>
      <code>${message}</code>
      <p class="hint">If this keeps happening, try rebuilding the app or checking the terminal output for the embedded server startup logs.</p>
    </div>
  </body>
</html>`
}

function getSplashHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #1a1a1a; color: #ffffff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    .loader { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #6366f1; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .container { text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="loader"></div>
    <div style="font-size: 14px; opacity: 0.7; letter-spacing: 1px;">PREPARING SANCTUARY</div>
  </div>
</body>
</html>`
}
