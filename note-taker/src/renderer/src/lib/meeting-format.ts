import type { Meeting } from '../../../shared/types'

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function formatTimestamp(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

export function groupUtterances(meeting: Meeting): Array<{ speaker: number; start: number; text: string }> {
  if (!meeting.utterances?.length) return []

  const groups: Array<{ speaker: number; start: number; text: string }> = []

  for (const utterance of meeting.utterances) {
    const last = groups[groups.length - 1]
    if (last && last.speaker === utterance.speaker) {
      last.text = `${last.text} ${utterance.text}`.trim()
    } else {
      groups.push({
        speaker: utterance.speaker,
        start: utterance.start,
        text: utterance.text
      })
    }
  }

  return groups
}

export function getSummaryText(meeting: Meeting): string {
  return meeting.summary?.trim() || 'No summary available.'
}

export function getTranscriptText(meeting: Meeting): string {
  if (meeting.utterances?.length) {
    return groupUtterances(meeting)
      .map(
        (group) =>
          `[${formatTimestamp(group.start)}] Speaker ${group.speaker + 1}: ${group.text}`
      )
      .join('\n\n')
  }

  return meeting.fullTranscript?.trim() || 'No transcript available.'
}
