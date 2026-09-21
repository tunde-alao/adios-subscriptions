import { useEffect, useState } from 'react'
import type { Meeting } from '../../shared/types'
import { MeetingList } from '@/components/MeetingList'
import { NotesView } from '@/components/NotesView'
import { RecordView } from '@/components/RecordView'
import { SettingsDialog } from '@/components/SettingsDialog'
import { Toaster } from '@/components/ui/sonner'

type View = 'record' | 'notes'

function App(): React.JSX.Element {
  const [view, setView] = useState<View>('record')
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)

  const activeMeeting = meetings.find((meeting) => meeting.id === activeMeetingId) ?? null

  const refreshMeetings = async (): Promise<void> => {
    const nextMeetings = await window.api.listMeetings()
    setMeetings(nextMeetings)
  }

  const refreshSettings = async (): Promise<void> => {
    const settings = await window.api.getSettings()
    setHasApiKey(Boolean(settings.gladiaApiKey.trim()))
  }

  useEffect(() => {
    void refreshMeetings()
    void refreshSettings()
  }, [])

  const upsertMeeting = (meeting: Meeting): void => {
    setMeetings((current) => {
      const existingIndex = current.findIndex((item) => item.id === meeting.id)
      if (existingIndex === -1) return [meeting, ...current]
      const next = [...current]
      next[existingIndex] = meeting
      return next
    })
  }

  const handleNewMeeting = (): void => {
    setActiveMeetingId(null)
    setView('record')
  }

  const handleSelectMeeting = (id: string): void => {
    setActiveMeetingId(id)
    setView('notes')
  }

  const handleProcessingComplete = (meeting: Meeting): void => {
    upsertMeeting(meeting)
    setActiveMeetingId(meeting.id)
    setView('notes')
  }

  return (
    <div className="dark flex h-screen bg-background text-foreground">
      <MeetingList
        meetings={meetings}
        activeMeetingId={activeMeetingId}
        onSelectMeeting={handleSelectMeeting}
        onNewMeeting={handleNewMeeting}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 overflow-hidden">
        {view === 'record' || !activeMeeting ? (
          <RecordView
            hasApiKey={hasApiKey}
            onOpenSettings={() => setSettingsOpen(true)}
            onMeetingCreated={upsertMeeting}
            onProcessingComplete={handleProcessingComplete}
            onStatusChange={upsertMeeting}
          />
        ) : (
          <NotesView meeting={activeMeeting} onMeetingUpdated={upsertMeeting} />
        )}
      </main>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={(open) => {
          setSettingsOpen(open)
          if (!open) void refreshSettings()
        }}
      />
      <Toaster />
    </div>
  )
}

export default App
