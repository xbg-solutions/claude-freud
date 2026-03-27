#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { loadConfig } from './lib/config.js'
import { loadAllProjects, loadProject } from './lib/reader.js'
import { listProjects } from './commands/list.js'
import { summaryCommand } from './commands/summary.js'
import { compareCommand } from './commands/compare.js'
import { homogenizeCommand } from './commands/homogenize.js'
import { header } from './lib/output.js'

const program = new Command()

program
  .name('cfreud')
  .description('Your projects have been talking. Claude Freud listened.')
  .version('0.1.0')

program
  .command('list', { isDefault: false })
  .alias('ls')
  .description('List all projects on record')
  .option('--md', 'Output as markdown')
  .action(async (opts) => {
    console.log(header())
    try {
      const config = await loadConfig()
      const projects = await loadAllProjects(config.claudeDir)
      listProjects(projects, opts.md ?? false)
    } catch (err) {
      console.error(chalk.red(`\n  ${err}\n`))
      process.exit(1)
    }
  })

program
  .command('compare <project-a> <project-b>')
  .description('Comparative analysis of two projects')
  .option('--md', 'Output as markdown')
  .option('--no-ai', 'Skip AI analysis, dump raw content')
  .action(async (projA, projB, opts) => {
    console.log(header())
    try {
      const config = await loadConfig()
      const a = await loadProject(config.claudeDir, projA)
      const b = await loadProject(config.claudeDir, projB)

      if (!a) { console.error(chalk.red(`  Patient not found: ${projA}`)); process.exit(1) }
      if (!b) { console.error(chalk.red(`  Patient not found: ${projB}`)); process.exit(1) }

      await compareCommand(a, b, config, opts.md ?? false)
    } catch (err) {
      console.error(chalk.red(`\n  ${err}\n`))
      process.exit(1)
    }
  })

program
  .command('homogenize [project]')
  .description('Identify patterns for promotion to global CLAUDE.md')
  .option('--apply', 'Write promoted patterns (with confirmation)')
  .option('--md', 'Output proposal as markdown')
  .action(async (project, opts) => {
    console.log(header())
    try {
      const config = await loadConfig()
      const projects = project
        ? [await loadProject(config.claudeDir, project)].filter(Boolean) as Awaited<ReturnType<typeof loadProject>>[]
        : await loadAllProjects(config.claudeDir)

      if (projects.length === 0) {
        console.log(chalk.dim('  No patients found to analyse.\n'))
        process.exit(0)
      }

      await homogenizeCommand(
        projects as NonNullable<Awaited<ReturnType<typeof loadProject>>>[],
        config,
        opts.apply ?? false,
        opts.md ?? false
      )
    } catch (err) {
      console.error(chalk.red(`\n  ${err}\n`))
      process.exit(1)
    }
  })

// Default command: summary
// If first arg looks like a known flag, run all; otherwise treat as project id
program
  .argument('[project]', 'Project name or ID to analyse (omit for all)')
  .option('--md', 'Output as markdown')
  .option('--no-ai', 'Skip AI analysis, dump raw memory content')
  .action(async (project, opts) => {
    console.log(header())
    try {
      const config = await loadConfig()

      let projects
      if (project) {
        const p = await loadProject(config.claudeDir, project)
        if (!p) {
          console.error(chalk.red(`  Patient not found: ${project}`))
          console.error(chalk.dim(`  Run \`cfreud list\` to see all patients on record.\n`))
          process.exit(1)
        }
        projects = [p]
      } else {
        projects = await loadAllProjects(config.claudeDir)
      }

      await summaryCommand(projects, config, opts.md ?? false, opts.noAi ?? false)
    } catch (err) {
      console.error(chalk.red(`\n  ${err}\n`))
      process.exit(1)
    }
  })

program.parse()
