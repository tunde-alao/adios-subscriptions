import type { Meeting } from '../../../shared/types'
import { formatDuration, formatRelativeDate } from '@/lib/meeting-format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Settings, Plus } from 'lucide-react'

type MeetingListProps = {
  meetings: Meeting[]
  activeMeetingId: string | null
  onSelectMeeting: (id: string) => void
  onNewMeeting: () => void
  onOpenSettings: () => void
}

function statusLabel(status: Meeting['status']): string {
  switch (status) {
    case 'recording':
      return 'Recording'
    case 'uploading':
      return 'Uploading'
    case 'transcribing':
      return 'Transcribing'
    case 'done':
      return 'Done'
    case 'error':
      return 'Error'
  }
}

export function MeetingList({
  meetings,
  activeMeetingId,
  onSelectMeeting,
  onNewMeeting,
  onOpenSettings
}: MeetingListProps): React.JSX.Element {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-card">
      <div className="p-4">
        <Button className="w-full" onClick={onNewMeeting}>
          <Plus className="size-4" />
          New Meeting
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {meetings.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">No meetings yet.</p>
          ) : (
            meetings.map((meeting) => (
              <button
                key={meeting.id}
                type="button"
                onClick={() => onSelectMeeting(meeting.id)}
                className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${
                  activeMeetingId === meeting.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="truncate text-sm font-medium">{meeting.title}</div>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{formatRelativeDate(meeting.createdAt)}</span>
                  <span>{formatDuration(meeting.durationMs)}</span>
                </div>
                <Badge variant="secondary" className="mt-2">
                  {statusLabel(meeting.status)}
                </Badge>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />
      <div className="p-4">
        <Button variant="outline" className="w-full" onClick={onOpenSettings}>
          <Settings className="size-4" />
          Settings
        </Button>
      </div>
    </aside>
  )
}
