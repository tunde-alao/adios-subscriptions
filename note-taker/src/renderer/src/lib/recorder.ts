export type RecordingSession = {
  recorder: MediaRecorder
  ctx: AudioContext
  sysStream: MediaStream | null
  micStream: MediaStream
  systemAudioOk: boolean
  pendingChunks: Set<Promise<void>>
  onSystemAudioEnded?: () => void
}

export async function startRecording(meetingId: string): Promise<RecordingSession> {
  // A denied screen/system-audio permission must not take the microphone down with it.
  const sysStream = await navigator.mediaDevices
    .getDisplayMedia({ audio: true, video: { width: 320, height: 240, frameRate: 1 } })
    .catch(() => null)

  const micStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  })

  const sysTrack = sysStream?.getAudioTracks()[0]
  const systemAudioOk = !!sysTrack && sysTrack.readyState === 'live'

  const ctx = new AudioContext({ sampleRate: 48000 })
  const dest = ctx.createMediaStreamDestination()
  ctx.createMediaStreamSource(micStream).connect(dest)
  if (sysTrack && systemAudioOk) {
    ctx.createMediaStreamSource(new MediaStream([sysTrack])).connect(dest)
  }

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm'

  const recorder = new MediaRecorder(dest.stream, {
    mimeType,
    audioBitsPerSecond: 128000
  })

  const pendingChunks = new Set<Promise<void>>()

  recorder.ondataavailable = (event) => {
    if (event.data.size === 0) return
    // Reading the blob is async, so stopRecording has to wait for these before telling main to
    // close the file — otherwise the last chunk arrives after the stream is gone.
    const pending = event.data.arrayBuffer().then((buffer) => {
      window.api.sendChunk(meetingId, new Uint8Array(buffer))
    })
    pendingChunks.add(pending)
    void pending.finally(() => pendingChunks.delete(pending))
  }

  recorder.start(5000)

  const session: RecordingSession = {
    recorder,
    ctx,
    sysStream,
    micStream,
    systemAudioOk,
    pendingChunks
  }

  if (sysTrack) {
    sysTrack.onended = () => {
      session.onSystemAudioEnded?.()
    }
  }

  return session
}

export async function stopRecording(session: RecordingSession): Promise<void> {
  await new Promise<void>((resolve) => {
    session.recorder.onstop = () => resolve()
    if (session.recorder.state !== 'inactive') {
      session.recorder.stop()
    } else {
      resolve()
    }
  })

  await Promise.allSettled(session.pendingChunks)

  for (const stream of [session.sysStream, session.micStream]) {
    for (const track of stream?.getTracks() ?? []) {
      track.stop()
    }
  }

  await session.ctx.close()
}
