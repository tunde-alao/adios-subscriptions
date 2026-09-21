export type MeetingStatus = 'recording' | 'uploading' | 'transcribing' | 'done' | 'error'

export type Utterance = {
  start: number
  end: number
  speaker: number
  text: string
}

export type Meeting = {
  id: string
  title: string
  createdAt: string
  durationMs: number
  status: MeetingStatus
  error?: string
  summary?: string
  utterances?: Utterance[]
  fullTranscript?: string
}

export type SummaryType = 'general' | 'bullet_points' | 'concise'

export type Settings = {
  gladiaApiKey: string
  summaryType: SummaryType
  language: string | 'auto'
}

export type MeetingStatusEvent = {
  id: string
  status: MeetingStatus
}

export type AppInfo = {
  name: string
  isDev: boolean
}
