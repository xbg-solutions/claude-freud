import { readdir, readFile, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import type { Project, ProjectMemory, ProjectInstructions, TopicFile } from '../types.js'

const HOME = homedir()

/**
 * Reverses Claude Code's project ID derivation back to a filesystem path.
 * Claude Code converts the repo root path to an ID by replacing separators with underscores.
 * e.g. "/home/ben/code/navmaps" -> "_home_ben_code_navmaps"
 */
function resolveProjectPath(projectId: string): string | null {
  // Convert _home_ben_code_navmaps -> /home/ben/code/navmaps
  const candidate = projectId.replace(/_/g, '/')
  if (existsSync(candidate)) return candidate

  // Some systems use double underscores for literal underscores in paths
  // Try a few common home dir substitutions
  const withHome = candidate.replace(/^\/home\/[^/]+/, HOME)
  if (existsSync(withHome)) return withHome

  return null
}

function deriveProjectName(projectId: string, resolvedPath: string | null): string {
  if (resolvedPath) {
    return resolvedPath.split('/').filter(Boolean).pop() ?? projectId
  }
  // Fallback: last segment of the ID
  return projectId.split('_').filter(Boolean).pop() ?? projectId
}

async function readMemory(memoryDir: string): Promise<ProjectMemory | null> {
  if (!existsSync(memoryDir)) return null

  const indexPath = join(memoryDir, 'MEMORY.md')
  let index = ''
  let latestModified = new Date(0)

  if (existsSync(indexPath)) {
    index = await readFile(indexPath, 'utf-8')
    const s = await stat(indexPath)
    latestModified = s.mtime
  }

  const topics: TopicFile[] = []
  const entries = await readdir(memoryDir)

  for (const entry of entries) {
    if (entry === 'MEMORY.md' || !entry.endsWith('.md')) continue
    const topicPath = join(memoryDir, entry)
    const content = await readFile(topicPath, 'utf-8')
    const s = await stat(topicPath)
    if (s.mtime > latestModified) latestModified = s.mtime
    topics.push({
      name: entry.replace('.md', ''),
      content,
      lastModified: s.mtime,
    })
  }

  // Sort topics by most recently modified
  topics.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())

  return { index, topics, lastModified: latestModified }
}

async function readInstructions(resolvedPath: string | null): Promise<ProjectInstructions> {
  if (!resolvedPath) return { project: null, local: null }

  const projectClaudeMd = join(resolvedPath, 'CLAUDE.md')
  const localClaudeMd = join(resolvedPath, '.claude', 'CLAUDE.md')

  return {
    project: existsSync(projectClaudeMd)
      ? await readFile(projectClaudeMd, 'utf-8')
      : null,
    local: existsSync(localClaudeMd)
      ? await readFile(localClaudeMd, 'utf-8')
      : null,
  }
}

export async function loadAllProjects(claudeDir: string): Promise<Project[]> {
  const projectsDir = join(claudeDir, 'projects')
  if (!existsSync(projectsDir)) return []

  const entries = await readdir(projectsDir, { withFileTypes: true })
  const projects: Project[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const projectId = entry.name
    const memoryDir = join(projectsDir, projectId, 'memory')
    const resolvedPath = resolveProjectPath(projectId)
    const name = deriveProjectName(projectId, resolvedPath)
    const memory = await readMemory(memoryDir)
    const instructions = await readInstructions(resolvedPath)

    // Skip projects with no memory at all — nothing to analyse
    if (!memory || (!memory.index && memory.topics.length === 0)) continue

    projects.push({ id: projectId, resolvedPath, name, memory, instructions })
  }

  // Sort by most recently modified memory
  projects.sort((a, b) =>
    b.memory.lastModified.getTime() - a.memory.lastModified.getTime()
  )

  return projects
}

export async function loadProject(claudeDir: string, projectId: string): Promise<Project | null> {
  const all = await loadAllProjects(claudeDir)
  return all.find(p => p.id === projectId || p.name === projectId) ?? null
}

export async function loadGlobalInstructions(claudeDir: string): Promise<string | null> {
  const globalPath = join(claudeDir, 'CLAUDE.md')
  if (!existsSync(globalPath)) return null
  return readFile(globalPath, 'utf-8')
}
