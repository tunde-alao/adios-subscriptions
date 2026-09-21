import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const plist = join('node_modules', 'electron', 'dist', 'Electron.app', 'Contents', 'Info.plist')

if (!existsSync(plist)) {
  console.warn('[patch-dev-plist] Electron.app not found, skipping plist patch')
  process.exit(0)
}

const keys = {
  NSMicrophoneUsageDescription: 'Note Taker records your microphone during meetings.',
  NSAudioCaptureUsageDescription: 'Note Taker records system audio during meetings.'
}

for (const [key, value] of Object.entries(keys)) {
  try {
    execFileSync('/usr/libexec/PlistBuddy', ['-c', `Add :${key} string ${value}`, plist])
  } catch {
    try {
      execFileSync('/usr/libexec/PlistBuddy', ['-c', `Set :${key} ${value}`, plist])
    } catch (error) {
      console.warn(`[patch-dev-plist] Failed to set ${key}:`, error)
    }
  }
}

console.log('[patch-dev-plist] Updated Electron.app Info.plist')
