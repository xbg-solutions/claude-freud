import chalk from 'chalk'
import type { Project, CfreudConfig } from '../types.js'
import { analyse } from '../lib/api.js'
import { buildDreamPrompt } from '../prompts/index.js'
import { formatSummaryTerminal, formatSummaryMd } from '../lib/output.js'

export async function summaryCommand(
  projects: Project[],
  config: CfreudConfig,
  mdMode: boolean,
  noAi: boolean
): Promise<void> {
  if (projects.length === 0) {
    console.log(chalk.dim('No patients to analyse. The couch is empty.'))
    return
  }

  const lines: string[] = []

  if (mdMode) {
    lines.push('# Claude Freud — Session Notes\n')
    lines.push(`> Generated: ${new Date().toISOString()}\n`)
  }

  for (const project of projects) {
    if (!mdMode) {
      process.stdout.write(chalk.dim(`  Analysing ${project.name}...`))
    }

    if (noAi) {
      // Raw dump
      const raw = [
        `=== ${project.name} ===`,
        project.memory.index,
        ...project.memory.topics.map(t => `--- ${t.name} ---\n${t.content}`)
      ].join('\n\n')

      if (mdMode) {
        lines.push(`## ${project.name}\n\`\`\`\n${raw}\n\`\`\`\n`)
      } else {
        process.stdout.write('\r' + ' '.repeat(40) + '\r')
        console.log(raw)
      }
      continue
    }

    try {
      const prompt = buildDreamPrompt(project)
      const raw = await analyse(prompt, config)

      if (mdMode) {
        lines.push(formatSummaryMd(raw, project.id, project.name))
      } else {
        process.stdout.write('\r' + ' '.repeat(40) + '\r')
        console.log(formatSummaryTerminal(raw, project.id, project.name))
      }
    } catch (err) {
      process.stdout.write('\r' + ' '.repeat(40) + '\r')
      console.error(chalk.red(`  Failed to analyse ${project.name}: ${err}`))
    }
  }

  if (mdMode) {
    console.log(lines.join('\n'))
  }
}
