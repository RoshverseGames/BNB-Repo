// Electron main process for B&B CRM
// Boots the Next.js standalone server, opens the app window,
// and wires up native menus + window lifecycle.

import { app, BrowserWindow, Menu, shell, dialog } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import { join } from 'path'
import { existsSync, mkdirSync, copyFile } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const isDev = !app.isPackaged
const PORT = 3000
const APP_NAME = 'B&B CRM'

let nextProcess: ChildProcess | null = null
let mainWindow: BrowserWindow | null = null

// ---------------------------------------------------------------------------
// Database bootstrap — copy the seed database to userData on first run
// ---------------------------------------------------------------------------
function getDbPath(): string {
  const userData = app.getPath('userData')
  const dbDir = join(userData, 'data')
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })
  return join(dbDir, 'custom.db')
}

function getDbEnvPath(): string {
  const userData = app.getPath('userData')
  const dbDir = join(userData, 'data')
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })
  return join(dbDir, 'custom.db')
}

function bootstrapDatabase() {
  const dbPath = getDbPath()
  // If DB already exists, leave it alone (preserve user data)
  if (existsSync(dbPath)) {
    console.log('[DB] Using existing database at', dbPath)
    return dbPath
  }
  // First run — try to copy the bundled seed database
  const seedDbPath = join(process.resourcesPath ?? __dirname, 'app', 'db', 'custom.db')
  if (existsSync(seedDbPath)) {
    copyFile(seedDbPath, dbPath, (err) => {
      if (err) console.error('[DB] Failed to copy seed database:', err)
      else console.log('[DB] Copied seed database to', dbPath)
    })
  } else {
    console.log('[DB] No seed database found at', seedDbPath, '— Next.js will create a fresh one')
  }
  return dbPath
}

// ---------------------------------------------------------------------------
// Next.js server lifecycle
// ---------------------------------------------------------------------------
function startNextServer(dbPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isDev) {
      // Dev mode: Next.js is already running via `bun run dev` on port 3000
      console.log('[Next] Dev mode — assuming Next.js dev server is running on port', PORT)
      resolve()
      return
    }

    // Packaged mode: run the Next.js standalone server
    const standaloneDir = join(process.resourcesPath ?? __dirname, 'app')
    const serverJs = join(standaloneDir, '.next', 'standalone', 'server.js')
    if (!existsSync(serverJs)) {
      reject(new Error(`Next.js standalone server not found at ${serverJs}`))
      return
    }

    console.log('[Next] Starting standalone server from', serverJs)
    nextProcess = spawn(process.execPath, [serverJs], {
      cwd: standaloneDir,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(PORT),
        HOSTNAME: '127.0.0.1',
        DATABASE_URL: `file:${dbPath}`,
        ELECTRON_RUN_AS_NODE: '1', // Run as plain Node (no Electron APIs)
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    nextProcess.stdout?.on('data', (data) => {
      const text = data.toString().trim()
      if (text) console.log('[Next]', text)
    })
    nextProcess.stderr?.on('data', (data) => {
      const text = data.toString().trim()
      if (text) console.error('[Next]', text)
    })

    nextProcess.on('error', (err) => reject(err))

    // Wait for server to be ready
    let attempts = 0
    const maxAttempts = 60
    const interval = setInterval(() => {
      attempts++
      const http = require('http')
      const req = http.request(
        { hostname: '127.0.0.1', port: PORT, path: '/', method: 'GET', timeout: 1000 },
        (res: { statusCode?: number }) => {
          if (res.statusCode && res.statusCode < 500) {
            clearInterval(interval)
            console.log('[Next] Server is ready')
            resolve()
          }
        }
      )
      req.on('error', () => {
        if (attempts >= maxAttempts) {
          clearInterval(interval)
          reject(new Error('Next.js server failed to start within 30 seconds'))
        }
      })
      req.end()
    }, 500)
  })
}

// ---------------------------------------------------------------------------
// Window creation
// ---------------------------------------------------------------------------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    title: APP_NAME,
    backgroundColor: '#ffffff',
    show: false,
    autoHideMenuBar: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    icon: join(__dirname, '..', 'build', 'icons', 'icon.png'),
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  const targetUrl = isDev ? `http://localhost:${PORT}` : `http://127.0.0.1:${PORT}`
  mainWindow.loadURL(targetUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }
}

// ---------------------------------------------------------------------------
// Native menu
// ---------------------------------------------------------------------------
function buildMenu(): Menu {
  const isMac = process.platform === 'darwin'
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [{
          label: APP_NAME,
          submenu: [
            { role: 'about' as const },
            { type: 'separator' as const },
            { role: 'services' as const },
            { type: 'separator' as const },
            { role: 'hide' as const },
            { role: 'hideOthers' as const },
            { role: 'unhide' as const },
            { type: 'separator' as const },
            { role: 'quit' as const },
          ],
        }]
      : []),
    {
      label: 'File',
      submenu: [
        isMac
          ? { role: 'close' as const }
          : { role: 'quit' as const },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' as const },
              { role: 'delete' as const },
              { role: 'selectAll' as const },
              { type: 'separator' as const },
              {
                label: 'Speech',
                submenu: [
                  { role: 'startSpeaking' as const },
                  { role: 'stopSpeaking' as const },
                ],
              },
            ]
          : [{ role: 'selectAll' as const }]),
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { role: 'toggleDevTools' as const },
        { type: 'separator' as const },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const },
        { type: 'separator' as const },
        {
          label: 'Toggle Theme',
          accelerator: 'CmdOrCtrl+T',
          click: () => mainWindow?.webContents.send('menu:toggle-theme'),
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        ...(isMac
          ? [{ type: 'separator' as const }, { role: 'front' as const }, { type: 'separator' as const }, { role: 'window' as const }]
          : [{ role: 'close' as const }]),
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Open Database Folder',
          click: () => {
            const dbPath = getDbPath()
            shell.showItemInFolder(dbPath)
          },
        },
        {
          label: 'Reset Demo Data',
          click: async () => {
            const result = await dialog.showMessageBox(mainWindow!, {
              type: 'warning',
              buttons: ['Reset', 'Cancel'],
              defaultId: 1,
              title: 'Reset Demo Data',
              message: 'This will erase ALL your CRM data and reseed the demo dataset.',
              detail: 'This action cannot be undone.',
            })
            if (result.response === 0) {
              mainWindow?.webContents.send('menu:reset-data')
            }
          },
        },
        { type: 'separator' as const },
        {
          label: 'About B&B CRM',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About B&B CRM',
              message: 'Bridges and Blueprints CRM',
              detail: `Version: ${app.getVersion()}\nPublisher: Rohan Deshpande\n\nA modern CRM for tracking companies, people, pipeline, and follow-ups.`,
              buttons: ['OK'],
            })
          },
        },
      ],
    },
  ]

  return Menu.buildFromTemplate(template)
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------
app.whenReady().then(async () => {
  try {
    const dbPath = bootstrapDatabase()
    await startNextServer(dbPath)
  } catch (err) {
    dialog.showErrorBox(
      'B&B CRM failed to start',
      `The CRM backend failed to start.\n\nError: ${err instanceof Error ? err.message : String(err)}\n\nPlease restart the app. If the problem persists, contact support.`
    )
    app.quit()
    return
  }

  Menu.setApplicationMenu(buildMenu())
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (nextProcess) {
    nextProcess.kill()
    nextProcess = null
  }
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (nextProcess) {
    nextProcess.kill()
    nextProcess = null
  }
})

process.on('exit', () => {
  if (nextProcess) {
    nextProcess.kill()
    nextProcess = null
  }
})
