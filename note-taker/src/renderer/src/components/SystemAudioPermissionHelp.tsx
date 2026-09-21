import { useEffect, useState } from 'react'
import type { AppInfo } from '../../../shared/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ExternalLink, Volume2 } from 'lucide-react'

export function SystemAudioPermissionHelp(): React.JSX.Element {
  const [appInfo, setAppInfo] = useState<AppInfo>({ name: 'Note Taker', isDev: false })

  useEffect(() => {
    void window.api.getAppInfo().then(setAppInfo)
  }, [])

  const appLabel = appInfo.isDev ? 'Electron' : appInfo.name

  const openSettings = (): void => {
    void window.api.openScreenRecordingSettings()
  }

  return (
    <Alert variant="destructive">
      <Volume2 className="size-4" />
      <AlertTitle>System audio not captured</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Only your microphone is being recorded. To capture other participants and meeting audio,
          grant system audio permission to <strong>{appLabel}</strong>:
        </p>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm">
          <li>
            Open{' '}
            <strong>
              System Settings → Privacy &amp; Security → Screen &amp; System Audio Recording
            </strong>
            .
          </li>
          <li>
            Turn on the toggle for <strong>{appLabel}</strong>.
            {appInfo.isDev && (
              <span className="block pt-1 text-muted-foreground">
                In development mode the app runs as Electron, not Note Taker. macOS only offers
                this permission when it launches the app itself, so start it with{' '}
                <code>npm run dev:app</code> rather than <code>npm run dev</code>.
              </span>
            )}
          </li>
          <li>
            Stop this meeting and start a new one — the System audio badge should stay green.
          </li>
        </ol>
        <Button variant="outline" size="sm" onClick={openSettings}>
          <ExternalLink className="size-3.5" />
          Open System Audio Settings
        </Button>
      </AlertDescription>
    </Alert>
  )
}
