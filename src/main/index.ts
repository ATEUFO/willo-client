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

  // Create the browser window.
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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
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
