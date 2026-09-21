import { ElectronAPI } from '@electron-toolkit/preload'
import type { Meeting, MeetingStatusEvent, Settings, AppInfo } from '../shared/types'

export interface Api {
  getSettings: () => Promise<Settings>
  saveSettings: (settings: Settings) => Promise<Settings>
  startRecording: () => Promise<Meeting>
  sendChunk: (id: string, chunk: Uint8Array) => void
  stopRecording: (id: string, durationMs: number) => Promise<Meeting>
  transcribeMeeting: (id: string) => Promise<Meeting>
  listMeetings: () => Promise<Meeting[]>
  getMeeting: (id: string) => Promise<Meeting>
  renameMeeting: (id: string, title: string) => Promise<Meeting>
  deleteMeeting: (id: string) => Promise<void>
  onMeetingStatus: (callback: (event: MeetingStatusEvent) => void) => () => void
  getAppInfo: () => Promise<AppInfo>
  openScreenRecordingSettings: () => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
