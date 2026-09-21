import { app, shell, BrowserWindow, desktopCapturer, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getSettings, saveSettings } from './settings'
import {
  appendChunk,
  audioFilePath,
  closeAudioStream,
  createMeeting,
  deleteMeeting,
  listMeetings,
  openAudioStream,
  readMeeting,
  renameMeeting,
  writeMeeting
} from './storage'
import { transcribe } from './gladia'
import type { Settings } from '../shared/types'

// Chromium's CoreAudio Tap loopback path (MacCatapLoopbackAudioForScreenShare) is enabled by
// default as of Electron 39, so no feature switch is needed. Capture instead depends on the
// NSAudioCaptureUsageDescription Info.plist key and the "System Audio Recording Only" grant.

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle('settings:get', async () => getSettings())

  ipcMain.handle('settings:save', async (_event, settings: Settings) => saveSettings(settings))

  ipcMain.handle('recording:start', async () => {
    const meeting = await createMeeting()
    openAudioStream(meeting.id)
    return meeting
  })

  ipcMain.on('recording:chunk', (_event, id: string, chunk: Uint8Array) => {
    appendChunk(id, chunk)
  })

  ipcMain.handle('recording:stop', async (_event, id: string, durationMs: number) => {
    await closeAudioStream(id)
    const meeting = await readMeeting(id)
    meeting.durationMs = durationMs
    meeting.status = 'uploading'
    return writeMeeting(meeting)
  })

  ipcMain.handle('meeting:transcribe', async (event, id: string) => {
    const settings = await getSettings()
    if (!settings.gladiaApiKey) {
      const meeting = await readMeeting(id)
      meeting.status = 'error'
      meeting.error = 'Gladia API key is not configured.'
      await writeMeeting(meeting)
      return meeting
    }

    let meeting = await readMeeting(id)
    meeting.status = 'uploading'
    meeting.error = undefined
    await writeMeeting(meeting)
    event.sender.send('meeting:status', { id, status: 'uploading' })

    try {
      const result = await transcribe(
        audioFilePath(id),
        settings.gladiaApiKey,
        {
          summaryType: settings.summaryType,
          language: settings.language
        },
        (status) => {
          const nextStatus = status === 'uploading' ? 'uploading' : 'transcribing'
          event.sender.send('meeting:status', { id, status: nextStatus })
        }
      )

      meeting = await readMeeting(id)
      meeting.status = 'done'
      meeting.summary = result.summary
      meeting.fullTranscript = result.fullTranscript
      meeting.utterances = result.utterances
      meeting.error = undefined
      await writeMeeting(meeting)
      event.sender.send('meeting:status', { id, status: 'done' })
      return meeting
    } catch (error) {
      meeting = await readMeeting(id)
      meeting.status = 'error'
      meeting.error = error instanceof Error ? error.message : 'Transcription failed'
      await writeMeeting(meeting)
      event.sender.send('meeting:status', { id, status: 'error' })
      return meeting
    }
  })

  ipcMain.handle('meeting:list', async () => listMeetings())

  ipcMain.handle('meeting:get', async (_event, id: string) => readMeeting(id))

  ipcMain.handle('meeting:rename', async (_event, id: string, title: string) =>
    renameMeeting(id, title)
  )

  ipcMain.handle('meeting:delete', async (_event, id: string) => {
    await deleteMeeting(id)
  })

  ipcMain.handle('system:getAppInfo', async () => ({
    name: app.getName(),
    isDev: is.dev
  }))

  ipcMain.handle('system:openScreenRecordingSettings', async () => {
    if (process.platform !== 'darwin') return
    await shell.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture'
    )
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.note-taker.app')

  // The macOS system picker never asks Chromium for a CoreAudio Tap, so system audio silently
  // stays absent. Selecting the screen ourselves is what triggers the tap, and it also spares the
  // user a picker on every meeting.
  session.defaultSession.setDisplayMediaRequestHandler(
    (_request, callback) => {
      desktopCapturer
        .getSources({ types: ['screen'] })
        .then((sources) => {
          if (sources.length === 0) {
            callback({})
            return
          }
          callback({ video: sources[0], audio: 'loopback' })
        })
        .catch(() => callback({}))
    },
    { useSystemPicker: false }
  )

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
