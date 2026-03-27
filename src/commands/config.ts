import { writeFile, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import chalk from 'chalk'
import Anthropic from '@anthropic-ai/sdk'

const CFREUD_DIR = join(homedir(), '.claude-freud')
const CFREUD_CONFIG = join(CFREUD_DIR, 'config.json')

interface CfreudStoredConfig {
  apiKey?: string
}

export async function setApiKey(apiKey: string): Promise<void> {
  if (!apiKey || apiKey.trim().length === 0) {
    console.error(chalk.red('  Error: API key cannot be empty\n'))
    process.exit(1)
  }

  // Ensure directory exists
  if (!existsSync(CFREUD_DIR)) {
    await mkdir(CFREUD_DIR, { recursive: true })
  }

  // Store the key
  const config: CfreudStoredConfig = { apiKey: apiKey.trim() }
  await writeFile(CFREUD_CONFIG, JSON.stringify(config, null, 2), 'utf-8')

  console.log(chalk.green('  ✓ API key saved to'), chalk.dim(`~/.claude-freud/config.json`))
  console.log(chalk.dim('  Run'), chalk.bold('cfreud config check'), chalk.dim('to validate it\n'))
}

export async function showConfig(): Promise<void> {
  console.log(chalk.bold('\n  Configuration Sources (in priority order):\n'))

  // Check env var
  if (process.env.ANTHROPIC_API_KEY) {
    console.log(chalk.green('  ✓ ANTHROPIC_API_KEY'), chalk.dim('(environment variable)'))
    console.log(chalk.dim(`    ${maskKey(process.env.ANTHROPIC_API_KEY)}`))
  } else {
    console.log(chalk.dim('  ○ ANTHROPIC_API_KEY (not set)'))
  }

  // Check claude-freud config
  if (existsSync(CFREUD_CONFIG)) {
    try {
      const raw = await readFile(CFREUD_CONFIG, 'utf-8')
      const config: CfreudStoredConfig = JSON.parse(raw)
      if (config.apiKey) {
        console.log(chalk.green('  ✓ ~/.claude-freud/config.json'))
        console.log(chalk.dim(`    ${maskKey(config.apiKey)}`))
      } else {
        console.log(chalk.dim('  ○ ~/.claude-freud/config.json (no key found)'))
      }
    } catch {
      console.log(chalk.dim('  ○ ~/.claude-freud/config.json (invalid JSON)'))
    }
  } else {
    console.log(chalk.dim('  ○ ~/.claude-freud/config.json (not found)'))
  }

  // Check Claude Code config
  const claudeDir = join(homedir(), '.claude')
  const claudePaths = [
    join(claudeDir, 'settings.json'),
    join(claudeDir, 'config.json'),
  ]

  let claudeKeyFound = false
  for (const path of claudePaths) {
    if (existsSync(path)) {
      try {
        const raw = await readFile(path, 'utf-8')
        const settings = JSON.parse(raw)
        if (settings.apiKey) {
          console.log(chalk.green(`  ✓ ${path.replace(homedir(), '~')}`))
          console.log(chalk.dim(`    ${maskKey(settings.apiKey)}`))
          claudeKeyFound = true
          break
        }
      } catch {
        // continue
      }
    }
  }
  if (!claudeKeyFound) {
    console.log(chalk.dim('  ○ ~/.claude/settings.json (not found)'))
  }

  console.log()
}

export async function checkConfig(): Promise<void> {
  try {
    // Try to load config using the same logic as the main app
    const { loadConfig } = await import('../lib/config.js')
    const config = await loadConfig()

    console.log(chalk.bold('\n  Testing API connection...\n'))
    console.log(chalk.dim('  Using key:'), maskKey(config.apiKey))
    console.log(chalk.dim('  Model:'), config.model)

    // Test the API
    const client = new Anthropic({ apiKey: config.apiKey })
    await client.messages.create({
      model: config.model,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    })

    console.log(chalk.green('\n  ✓ API key is valid and working\n'))
  } catch (err: any) {
    if (err.status === 401) {
      console.error(chalk.red('\n  ✗ API key is invalid (401 Unauthorized)\n'))
      console.log(chalk.dim('  Run'), chalk.bold('cfreud config set-key <your-key>'), chalk.dim('to update it\n'))
    } else if (err.message?.includes('No API key found')) {
      console.error(chalk.red('\n  ✗ No API key configured\n'))
      console.log(chalk.dim('  Run'), chalk.bold('cfreud config set-key <your-key>'), chalk.dim('to set one\n'))
    } else {
      console.error(chalk.red(`\n  ✗ Error: ${err.message}\n`))
    }
    process.exit(1)
  }
}

function maskKey(key: string): string {
  if (key.length < 12) return '***'
  return `${key.slice(0, 8)}...${key.slice(-4)}`
}

export { CFREUD_DIR, CFREUD_CONFIG }
