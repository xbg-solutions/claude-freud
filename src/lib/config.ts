import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import type { CfreudConfig } from '../types.js'

const CLAUDE_DIR = join(homedir(), '.claude')
const CONFIG_PATHS = [
  join(CLAUDE_DIR, 'settings.json'),
  join(CLAUDE_DIR, 'config.json'),
]

interface ClaudeSettings {
  apiKey?: string
  oauthToken?: string
}

export async function loadConfig(): Promise<CfreudConfig> {
  // Respect explicit override
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      apiKey: process.env.ANTHROPIC_API_KEY,
      claudeDir: CLAUDE_DIR,
      model: 'claude-sonnet-4-20250514',
    }
  }

  // Try to read from Claude Code's own config
  for (const configPath of CONFIG_PATHS) {
    if (existsSync(configPath)) {
      try {
        const raw = await readFile(configPath, 'utf-8')
        const settings: ClaudeSettings = JSON.parse(raw)
        if (settings.apiKey) {
          return {
            apiKey: settings.apiKey,
            claudeDir: CLAUDE_DIR,
            model: 'claude-sonnet-4-20250514',
          }
        }
      } catch {
        // continue to next path
      }
    }
  }

  throw new Error(
    `No API key found.\n` +
    `Claude Freud requires Claude Code to be installed and configured.\n` +
    `Alternatively, set ANTHROPIC_API_KEY in your environment.`
  )
}

export { CLAUDE_DIR }
