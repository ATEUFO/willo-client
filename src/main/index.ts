import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { getDatabase, closeDatabase } from './database'
import { registerIpcHandlers } from './ipc'
import { connectWebSocket } from './sync/sync-manager'
import 'dotenv/config'
import icon from '../../resources/icon.png?asset'

import { existsSync } from 'fs'

function createWindow(): void {
  // Determine correct preload path (.mjs or .js)
  const preloadMjs = join(__dirname, '../preload/index.mjs')
  const preloadJs = join(__dirname, '../preload/index.js')
  const preloadPath = existsSync(preloadMjs) ? preloadMjs : preloadJs

  // Create the splash screen window.
  const splashWindow = new BrowserWindow({
    width: 400,
    height: 400,
    frame: false,
    transparent: false, // disable transparency for Linux compatibility
    backgroundColor: '#07111E', // match app theme background
    alwaysOnTop: true,
    resizable: false,
    center: true,
    show: false, // Hide initially to ensure it starts at 0s and avoids blank screen
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: preloadPath,
      sandbox: false
    }
  })

  splashWindow.center()

  splashWindow.once('ready-to-show', () => {
    splashWindow.show()
  })

  // Create the main browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    frame: false, // frameless window for custom titlebar
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: preloadPath,
      sandbox: false
    }
  })

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:maximized-state', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:maximized-state', false)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load URLs/Files
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    splashWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?splash=true`)
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    const indexPath = join(__dirname, '../renderer/index.html')
    splashWindow.loadFile(indexPath, { search: 'splash=true', hash: 'splash=true' })
    mainWindow.loadFile(indexPath)
  }

  // Show main window after 6 seconds and close splash
  setTimeout(() => {
    splashWindow.destroy()
    mainWindow.show()
  }, 6000)
}

// Initialization when Electron is ready
app.whenReady().then(() => {
  // Initialize local SQLite database
  getDatabase()

  // Register all IPC handlers for better-sqlite3 operations
  registerIpcHandlers()

  // Start real-time sync WebSocket connection
  connectWebSocket()

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Shortcuts & optimization
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  closeDatabase()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
