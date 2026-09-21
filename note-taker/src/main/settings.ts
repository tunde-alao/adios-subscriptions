import { app } from 'electron'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import type { Settings, SummaryType } from '../shared/types'

const defaultSettings: Settings = {
  gladiaApiKey: process.env.MAIN_VITE_GLADIA_API_KEY ?? '',
  summaryType: 'bullet_points',
  language: 'auto'
}

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export async function getSettings(): Promise<Settings> {
  try {
    const raw = await readFile(settingsPath(), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      gladiaApiKey: parsed.gladiaApiKey ?? defaultSettings.gladiaApiKey,
      summaryType: (parsed.summaryType as SummaryType) ?? defaultSettings.summaryType,
      language: parsed.language ?? defaultSettings.language
    }
  } catch {
    return { ...defaultSettings }
  }
}

export async function saveSettings(settings: Settings): Promise<Settings> {
  await mkdir(app.getPath('userData'), { recursive: true })
  await writeFile(settingsPath(), JSON.stringify(settings, null, 2), 'utf-8')
  return settings
}
