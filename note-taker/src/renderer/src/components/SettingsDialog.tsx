import { useEffect, useState } from 'react'
import { Settings } from '../../../shared/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

type SettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps): React.JSX.Element {
  const [settings, setSettings] = useState<Settings>({
    gladiaApiKey: '',
    summaryType: 'bullet_points',
    language: 'auto'
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    void window.api.getSettings().then(setSettings)
  }, [open])

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    try {
      const saved = await window.api.saveSettings(settings)
      setSettings(saved)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your Gladia API key and transcription preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gladia-api-key">Gladia API key</Label>
            <Input
              id="gladia-api-key"
              type="password"
              value={settings.gladiaApiKey}
              onChange={(event) =>
                setSettings((current) => ({ ...current, gladiaApiKey: event.target.value }))
              }
              placeholder="Paste your Gladia API key"
            />
          </div>

          <div className="space-y-2">
            <Label>Summary style</Label>
            <Select
              value={settings.summaryType}
              onValueChange={(value) =>
                setSettings((current) => ({
                  ...current,
                  summaryType: value as Settings['summaryType']
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bullet_points">Bullet points</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={settings.language}
              onValueChange={(value) => {
                if (!value) return
                setSettings((current) => ({ ...current, language: value }))
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
