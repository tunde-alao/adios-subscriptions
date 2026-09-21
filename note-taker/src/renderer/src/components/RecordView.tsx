import { useEffect, useRef, useState } from 'react'
import type { Meeting } from '../../../shared/types'
import { startRecording, stopRecording, type RecordingSession } from '@/lib/recorder'
import { formatDuration } from '@/lib/meeting-format'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mic, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { SystemAudioPermissionHelp } from '@/components/SystemAudioPermissionHelp'

type RecordViewProps = {
  hasApiKey: boolean
  onOpenSettings: () => void
  onMeetingCreated: (meeting: Meeting) => void
  onProcessingComplete: (meeting: Meeting) => void
  onStatusChange: (meeting: Meeting) => void
}

type ViewState = 'idle' | 'recording' | 'processing'

export function RecordView({
  hasApiKey,
  onOpenSettings,
  onMeetingCreated,
  onProcessingComplete,
  onStatusChange
}: RecordViewProps): React.JSX.Element {
  const [viewState, setViewState] = useState<ViewState>('idle')
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [systemAudioOk, setSystemAudioOk] = useState(true)
  const [processingLabel, setProcessingLabel] = useState('Uploading audio…')

  const sessionRef = useRef<RecordingSession | null>(null)
  const startedAtRef = useRef<number>(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const unsubscribe = window.api.onMeetingStatus((event) => {
      if (!meeting || event.id !== meeting.id) return
      if (event.status === 'uploading') {
        setProcessingLabel('Uploading audio…')
      } else if (event.status === 'transcribing') {
        setProcessingLabel('Transcribing…')
      }
    })
    return unsubscribe
  }, [meeting])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const handleStart = async (): Promise<void> => {
    if (!hasApiKey) {
      onOpenSettings()
      return
    }

    try {
      const created = await window.api.startRecording()
      setMeeting(created)
      onMeetingCreated(created)

      const session = await startRecording(created.id)
      session.onSystemAudioEnded = () => {
        toast.warning('System audio stopped. Recording microphone only.')
        setSystemAudioOk(false)
      }

      sessionRef.current = session
      setSystemAudioOk(session.systemAudioOk)
      if (!session.systemAudioOk) {
        toast.warning('System audio unavailable. Recording microphone only.')
      }

      startedAtRef.current = Date.now()
      setElapsedMs(0)
      setViewState('recording')
      timerRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current)
      }, 250)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start recording')
    }
  }

  const handleStop = async (): Promise<void> => {
    if (!meeting || !sessionRef.current) return

    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    const durationMs = Date.now() - startedAtRef.current
    setElapsedMs(durationMs)
    setViewState('processing')
    setProcessingLabel('Uploading audio…')

    try {
      await stopRecording(sessionRef.current)
      sessionRef.current = null

      const stopped = await window.api.stopRecording(meeting.id, durationMs)
      setMeeting(stopped)
      onStatusChange(stopped)

      const transcribed = await window.api.transcribeMeeting(meeting.id)
      setMeeting(transcribed)
      onStatusChange(transcribed)
      onProcessingComplete(transcribed)
      setViewState('idle')
      setMeeting(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to stop recording')
      setViewState('idle')
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle>Meeting Recorder</CardTitle>
          <CardDescription>
            Capture your microphone and system audio, then transcribe with Gladia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasApiKey && (
            <Alert>
              <AlertTitle>Gladia API key required</AlertTitle>
              <AlertDescription>
                Add your API key in Settings before starting a meeting.
                <Button variant="link" className="h-auto p-0 pl-1" onClick={onOpenSettings}>
                  Open Settings
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {viewState === 'idle' && (
            <div className="flex justify-center">
              <Button size="lg" onClick={() => void handleStart()} disabled={!hasApiKey}>
                Start Meeting
              </Button>
            </div>
          )}

          {viewState === 'recording' && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-red-500" />
                </span>
                <span className="text-3xl font-semibold tabular-nums">{formatDuration(elapsedMs)}</span>
              </div>

              <div className="flex justify-center gap-2">
                <Badge variant="secondary">
                  <Mic className="size-3" />
                  Microphone
                </Badge>
                <Badge variant={systemAudioOk ? 'secondary' : 'destructive'}>
                  <Volume2 className="size-3" />
                  System audio
                </Badge>
              </div>

              {!systemAudioOk && <SystemAudioPermissionHelp />}

              <div className="flex justify-center">
                <Button size="lg" variant="destructive" onClick={() => void handleStop()}>
                  Stop Meeting
                </Button>
              </div>
            </div>
          )}

          {viewState === 'processing' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{processingLabel}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
