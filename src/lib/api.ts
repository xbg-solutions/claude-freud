import Anthropic from '@anthropic-ai/sdk'
import type { CfreudConfig } from '../types.js'

let client: Anthropic | null = null

export function getClient(config: CfreudConfig): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: config.apiKey })
  }
  return client
}

export async function analyse(prompt: string, config: CfreudConfig): Promise<string> {
  const anthropic = getClient(config)
  const response = await anthropic.messages.create({
    model: config.model,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from API')
  return block.text
}

export async function analyseJson<T>(prompt: string, config: CfreudConfig): Promise<T> {
  const raw = await analyse(prompt, config)
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim()) as T
  } catch {
    throw new Error(`Failed to parse JSON response from API:\n${raw}`)
  }
}
