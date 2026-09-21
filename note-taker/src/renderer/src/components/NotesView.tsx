import { useEffect, useState } from 'react'
import type { Meeting } from '../../../shared/types'
import {
  formatDuration,
  formatTimestamp,
  getSummaryText,
  getTranscriptText,
  groupUtterances
} from '@/lib/meeting-format'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type NotesViewProps = {
  meeting: Meeting
  onMeetingUpdated: (meeting: Meeting) => void
}

export function NotesView({ meeting, onMeetingUpdated }: NotesViewProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary')
  const [title, setTitle] = useState(meeting.title)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    setTitle(meeting.title)
  }, [meeting.id, meeting.title])

  const handleCopy = async (): Promise<void> => {
    const text =
      activeTab === 'summary' ? getSummaryText(meeting) : getTranscriptText(meeting)
    await navigator.clipboard.writeText(text)
    toast.success(
      activeTab === 'summary' ? 'Summary copied to clipboard' : 'Transcript copied to clipboard'
    )
  }

  const handleTitleBlur = async (): Promise<void> => {
    const trimmed = title.trim()
    if (!trimmed || trimmed === meeting.title) {
      setTitle(meeting.title)
      return
    }
    const updated = await window.api.renameMeeting(meeting.id, trimmed)
    onMeetingUpdated(updated)
  }

  const handleRetry = async (): Promise<void> => {
    setRetrying(true)
    try {
      const updated = await window.api.transcribeMeeting(meeting.id)
      onMeetingUpdated(updated)
      if (updated.status === 'error') {
        toast.error(updated.error ?? 'Transcription failed')
      } else {
        toast.success('Transcription complete')
      }
    } finally {
      setRetrying(false)
    }
  }

  const utteranceGroups = groupUtterances(meeting)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-border p-6">
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => void handleTitleBlur()}
            className="text-lg font-semibold"
          />
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{new Date(meeting.createdAt).toLocaleString()}</span>
            <span>•</span>
            <span>{formatDuration(meeting.durationMs)}</span>
          </div>
        </div>
        <Button variant="outline" onClick={() => void handleCopy()}>
          <Copy className="size-4" />
          Copy
        </Button>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        {meeting.status === 'error' && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Transcription failed</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{meeting.error}</p>
              <Button variant="outline" onClick={() => void handleRetry()} disabled={retrying}>
                {retrying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Retrying…
                  </>
                ) : (
                  'Retry transcription'
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {(meeting.status === 'uploading' || meeting.status === 'transcribing') && (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {meeting.status === 'uploading' ? 'Uploading audio…' : 'Transcribing…'}
            </p>
          </div>
        )}

        {meeting.status === 'done' && (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'summary' | 'transcript')}
            className="flex h-full flex-col"
          >
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4 flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-240px)] rounded-lg border border-border p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-6">
                  {getSummaryText(meeting)}
                </pre>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="transcript" className="mt-4 flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-240px)] rounded-lg border border-border p-4">
                <div className="space-y-4">
                  {utteranceGroups.length > 0 ? (
                    utteranceGroups.map((group, index) => (
                      <div key={`${group.speaker}-${group.start}-${index}`} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Speaker {group.speaker + 1}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(group.start)}
                          </span>
                        </div>
                        <p className="text-sm leading-6">{group.text}</p>
                      </div>
                    ))
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-6">
                      {meeting.fullTranscript || 'No transcript available.'}
                    </pre>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
