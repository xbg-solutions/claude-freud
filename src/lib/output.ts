import chalk from 'chalk'
import type { ProjectAnalysis, ComparisonAnalysis, HomogenizeProposal } from '../types.js'

const DIVIDER = '─'.repeat(60)

function parseAnalysisResponse(raw: string, projectId: string, projectName: string): ProjectAnalysis {
  const lines = raw.split('\n')
  const bulletStart = lines.findIndex(l => l.trim().startsWith('•'))

  const narrative = bulletStart > -1
    ? lines.slice(0, bulletStart).join('\n').trim()
    : raw.trim()

  const points = bulletStart > -1
    ? lines.slice(bulletStart).filter(l => l.trim().startsWith('•')).map(l => l.trim().replace(/^•\s*/, ''))
    : []

  return {
    projectId,
    projectName,
    dream: { narrative, generatedAt: new Date() },
    memories: { points },
    instructions: { present: [], gaps: [] }, // populated separately if needed
  }
}

export function formatSummaryTerminal(raw: string, projectId: string, projectName: string): string {
  const analysis = parseAnalysisResponse(raw, projectId, projectName)
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold.cyan(`▸ ${projectName}`))
  lines.push(chalk.dim(`  ${projectId}`))
  lines.push(chalk.dim(DIVIDER))
  lines.push('')
  lines.push(chalk.white(analysis.dream.narrative))
  lines.push('')

  if (analysis.memories.points.length > 0) {
    lines.push(chalk.bold.dim('Recent memories:'))
    for (const point of analysis.memories.points) {
      lines.push(chalk.dim(`  • ${point}`))
    }
  }

  lines.push('')
  return lines.join('\n')
}

export function formatSummaryMd(raw: string, projectId: string, projectName: string): string {
  const analysis = parseAnalysisResponse(raw, projectId, projectName)
  const lines: string[] = []

  lines.push(`## ${projectName}`)
  lines.push(`> \`${projectId}\``)
  lines.push('')
  lines.push(analysis.dream.narrative)
  lines.push('')

  if (analysis.memories.points.length > 0) {
    lines.push('**Recent memories:**')
    for (const point of analysis.memories.points) {
      lines.push(`- ${point}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

export function formatCompareTerminal(raw: string, nameA: string, nameB: string): string {
  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.magenta(`▸ Comparative Analysis: ${nameA} × ${nameB}`))
  lines.push(chalk.dim(DIVIDER))
  lines.push('')
  lines.push(chalk.white(raw))
  lines.push('')
  return lines.join('\n')
}

export function formatCompareMd(raw: string, nameA: string, nameB: string): string {
  return `## Comparative Analysis: ${nameA} × ${nameB}\n\n${raw}\n`
}

export function formatHomogenizeTerminal(proposal: HomogenizeProposal): string {
  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.yellow('▸ Patterns ready for promotion'))
  lines.push(chalk.dim(`  Derived from: ${proposal.sourceProjects.join(', ')}`))
  lines.push(chalk.dim(DIVIDER))
  lines.push('')

  for (const p of proposal.promotions) {
    const confidenceColor = p.confidence === 'strong' ? chalk.green : p.confidence === 'moderate' ? chalk.yellow : chalk.dim
    lines.push(chalk.bold(`${p.pattern}`))
    lines.push(`  ${chalk.dim('category:')} ${p.category}  ${chalk.dim('confidence:')} ${confidenceColor(p.confidence)}`)
    lines.push(`  ${chalk.dim('evidence:')} ${p.evidence.join(', ')}`)
    lines.push(`  ${chalk.dim('→')} ${p.suggestedText}`)
    lines.push('')
  }

  return lines.join('\n')
}

export function formatHomogenizeMd(proposal: HomogenizeProposal): string {
  const lines: string[] = []
  lines.push('## Homogenize Proposal')
  lines.push(`> Sources: ${proposal.sourceProjects.join(', ')}`)
  lines.push('')

  for (const p of proposal.promotions) {
    lines.push(`### ${p.pattern}`)
    lines.push(`- **Category:** ${p.category}`)
    lines.push(`- **Confidence:** ${p.confidence}`)
    lines.push(`- **Evidence:** ${p.evidence.join(', ')}`)
    lines.push(`- **Suggested text:** ${p.suggestedText}`)
    lines.push('')
  }

  return lines.join('\n')
}

export function header(): string {
  return [
    '',
    chalk.bold.white('Claude Freud'),
    chalk.dim('Your projects have been talking. Claude Freud listened.'),
    '',
  ].join('\n')
}

export { parseAnalysisResponse }
