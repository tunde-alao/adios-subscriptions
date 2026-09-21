import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

// macOS assigns TCC decisions to the "responsible process", which is inherited through
// fork/exec. When electron-vite spawns Electron, the IDE or terminal stays responsible, so the
// "System Audio Recording Only" prompt is attributed to it and is silently suppressed because it
// has no NSAudioCaptureUsageDescription. Launching through LaunchServices with `open` makes
// Electron responsible for itself, so the prompt appears and the grant sticks.

const root = resolve(import.meta.dirname, '..')
const electronApp = join(root, 'node_modules', 'electron', 'dist', 'Electron.app')

if (process.platform !== 'darwin') {
  console.error('[run-dev-app] macOS only; use `npm run dev` elsewhere')
  process.exit(1)
}

if (!existsSync(electronApp)) {
  console.error('[run-dev-app] Electron.app not found; run `npm install` first')
  process.exit(1)
}

if (process.argv.includes('--reset-permission')) {
  spawnSync('tccutil', ['reset', 'AudioCapture', 'com.github.Electron'], { stdio: 'inherit' })
}

execFileSync('node', [join('scripts', 'patch-dev-plist.mjs')], { cwd: root, stdio: 'inherit' })
execFileSync('npx', ['electron-vite', 'build'], { cwd: root, stdio: 'inherit' })

const args = ['-n', electronApp, '--args', root]

if (process.argv.includes('--verbose')) {
  const logFile = join(root, 'chromium.log')
  args.push('--enable-logging=file', `--log-file=${logFile}`, '--v=1')
  console.log(`[run-dev-app] Chromium logging to ${logFile}`)
}

execFileSync('open', args, { stdio: 'inherit' })

console.log('[run-dev-app] Launched Electron.app via LaunchServices')
