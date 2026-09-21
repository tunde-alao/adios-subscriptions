import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Meeting, MeetingStatusEvent, Settings, AppInfo } from '../shared/types'

const api = {
  getSettings: (): Promise<Settings> => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: Settings): Promise<Settings> =>
    ipcRenderer.invoke('settings:save', settings),
  startRecording: (): Promise<Meeting> => ipcRenderer.invoke('recording:start'),
  sendChunk: (id: string, chunk: Uint8Array): void => {
    ipcRenderer.send('recording:chunk', id, chunk)
  },
  stopRecording: (id: string, durationMs: number): Promise<Meeting> =>
    ipcRenderer.invoke('recording:stop', id, durationMs),
  transcribeMeeting: (id: string): Promise<Meeting> =>
    ipcRenderer.invoke('meeting:transcribe', id),
  listMeetings: (): Promise<Meeting[]> => ipcRenderer.invoke('meeting:list'),
  getMeeting: (id: string): Promise<Meeting> => ipcRenderer.invoke('meeting:get', id),
  renameMeeting: (id: string, title: string): Promise<Meeting> =>
    ipcRenderer.invoke('meeting:rename', id, title),
  deleteMeeting: (id: string): Promise<void> => ipcRenderer.invoke('meeting:delete', id),
  onMeetingStatus: (callback: (event: MeetingStatusEvent) => void): (() => void) => {
    const listener = (_: Electron.IpcRendererEvent, payload: MeetingStatusEvent): void => {
      callback(payload)
    }
    ipcRenderer.on('meeting:status', listener)
    return () => {
      ipcRenderer.removeListener('meeting:status', listener)
    }
  },
  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke('system:getAppInfo'),
  openScreenRecordingSettings: (): Promise<void> =>
    ipcRenderer.invoke('system:openScreenRecordingSettings')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error exposed in non-isolated mode
  window.electron = electronAPI
  // @ts-expect-error exposed in non-isolated mode
  window.api = api
}
