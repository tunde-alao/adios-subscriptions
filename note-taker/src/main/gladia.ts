import { readFile } from 'fs/promises'
import type { Utterance } from '../shared/types'

const BASE = 'https://api.gladia.io/v2'

type GladiaUtterance = {
  start?: number
  start_time?: number
  end?: number
  end_time?: number
  speaker?: number
  text?: string
  transcript?: string
}

type GladiaResult = {
  summarization?: {
    success?: boolean
    results?: string
  }
  transcription?: {
    full_transcript?: string
    utterances?: GladiaUtterance[]
  }
}

export async function transcribe(
  audioPath: string,
  apiKey: string,
  opts: { summaryType: string; language: string },
  onStatus: (status: string) => void
): Promise<{ summary: string; fullTranscript: string; utterances: Utterance[] }> {
  onStatus('uploading')
  const bytes = await readFile(audioPath)
  const form = new FormData()
  form.append('audio', new File([bytes], 'audio.webm', { type: 'audio/webm' }))

  const uploadResponse = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: { 'x-gladia-key': apiKey },
    body: form
  })

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed ${uploadResponse.status}: ${await uploadResponse.text()}`)
  }

  const { audio_url } = (await uploadResponse.json()) as { audio_url: string }

  onStatus('transcribing')
  const body: Record<string, unknown> = {
    audio_url,
    diarization: true,
    diarization_config: { min_speakers: 1, max_speakers: 8 },
    summarization: true,
    summarization_config: { type: opts.summaryType },
    punctuation_enhanced: true
  }

  if (opts.language === 'auto') {
    body.detect_language = true
    body.enable_code_switching = true
  } else {
    body.language_config = { languages: [opts.language] }
  }

  const createResponse = await fetch(`${BASE}/pre-recorded`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gladia-key': apiKey
    },
    body: JSON.stringify(body)
  })

  if (!createResponse.ok) {
    throw new Error(`Job failed ${createResponse.status}: ${await createResponse.text()}`)
  }

  const { id } = (await createResponse.json()) as { id: string }

  for (let attempt = 0; attempt < 800; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const pollResponse = await fetch(`${BASE}/pre-recorded/${id}`, {
      headers: { 'x-gladia-key': apiKey }
    })

    if (!pollResponse.ok) continue

    const json = (await pollResponse.json()) as {
      status: string
      error?: unknown
      result?: GladiaResult
    }

    if (json.status === 'done' && json.result) {
      const utterances = (json.result.transcription?.utterances ?? []).map((utterance) => ({
        start: utterance.start ?? utterance.start_time ?? 0,
        end: utterance.end ?? utterance.end_time ?? 0,
        speaker: utterance.speaker ?? 0,
        text: utterance.text ?? utterance.transcript ?? ''
      }))

      return {
        summary: json.result.summarization?.results ?? '',
        fullTranscript: json.result.transcription?.full_transcript ?? '',
        utterances
      }
    }

    if (json.status === 'error') {
      throw new Error(JSON.stringify(json.error ?? json))
    }
  }

  throw new Error('Transcription timed out')
}
