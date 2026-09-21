import { app } from 'electron'
import { createWriteStream, type WriteStream } from 'fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type { Meeting } from '../shared/types'

const audioStreams = new Map<string, WriteStream>()

function meetingsRoot(): string {
  return join(app.getPath('userData'), 'meetings')
}

function meetingDir(id: string): string {
  return join(meetingsRoot(), id)
}

function meetingJsonPath(id: string): string {
  return join(meetingDir(id), 'meeting.json')
}

export function audioFilePath(id: string): string {
  return join(meetingDir(id), 'audio.webm')
}

export async function createMeeting(): Promise<Meeting> {
  const id = randomUUID()
  const meeting: Meeting = {
    id,
    title: `Meeting — ${new Date().toLocaleString()}`,
    createdAt: new Date().toISOString(),
    durationMs: 0,
    status: 'recording'
  }

  await mkdir(meetingDir(id), { recursive: true })
  await writeFile(meetingJsonPath(id), JSON.stringify(meeting, null, 2), 'utf-8')
  return meeting
}

export function openAudioStream(id: string): WriteStream {
  const stream = createWriteStream(audioFilePath(id), { flags: 'w' })
  audioStreams.set(id, stream)
  return stream
}

export function appendChunk(id: string, chunk: Uint8Array): void {
  const stream = audioStreams.get(id)
  if (!stream || stream.writableEnded) {
    // A chunk that lands after the stream closed is not worth crashing the app over.
    console.warn(`Dropping audio chunk for meeting ${id}: no open audio stream`)
    return
  }
  stream.write(Buffer.from(chunk))
}

export async function closeAudioStream(id: string): Promise<void> {
  const stream = audioStreams.get(id)
  if (!stream) return

  await new Promise<void>((resolve, reject) => {
    stream.end((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
  audioStreams.delete(id)
}

export async function readMeeting(id: string): Promise<Meeting> {
  const raw = await readFile(meetingJsonPath(id), 'utf-8')
  return JSON.parse(raw) as Meeting
}

export async function writeMeeting(meeting: Meeting): Promise<Meeting> {
  await mkdir(meetingDir(meeting.id), { recursive: true })
  await writeFile(meetingJsonPath(meeting.id), JSON.stringify(meeting, null, 2), 'utf-8')
  return meeting
}

export async function listMeetings(): Promise<Meeting[]> {
  try {
    const dirs = await readdir(meetingsRoot())
    const meetings: Meeting[] = []

    for (const dir of dirs) {
      try {
        const meeting = await readMeeting(dir)
        meetings.push(meeting)
      } catch {
        // skip invalid meeting dirs
      }
    }

    return meetings.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch {
    return []
  }
}

export async function deleteMeeting(id: string): Promise<void> {
  await closeAudioStream(id)
  await rm(meetingDir(id), { recursive: true, force: true })
}

export async function renameMeeting(id: string, title: string): Promise<Meeting> {
  const meeting = await readMeeting(id)
  meeting.title = title.trim() || meeting.title
  return writeMeeting(meeting)
}
