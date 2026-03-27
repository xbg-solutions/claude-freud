export interface Project {
  id: string
  resolvedPath: string | null
  name: string
  memory: ProjectMemory
  instructions: ProjectInstructions
}

export interface ProjectMemory {
  index: string
  topics: TopicFile[]
  lastModified: Date
}

export interface TopicFile {
  name: string
  content: string
  lastModified: Date
}

export interface ProjectInstructions {
  project: string | null   // <repo-root>/CLAUDE.md
  local: string | null     // <repo-root>/.claude/CLAUDE.md
}

export interface ProjectAnalysis {
  projectId: string
  projectName: string
  dream: DreamSummary
  memories: MemoryDigest
  instructions: InstructionAudit
}

export interface DreamSummary {
  narrative: string
  generatedAt: Date
}

export interface MemoryDigest {
  points: string[]
}

export interface InstructionAudit {
  present: string[]
  gaps: string[]
}

export interface ComparisonAnalysis {
  projectA: string
  projectB: string
  dream: {
    similarities: string[]
    differences: string[]
    narrative: string
  }
  instructions: {
    sharedPatterns: string[]
    onlyInA: string[]
    onlyInB: string[]
    qualityDelta: string
  }
}

export type PromotionCategory = 'architecture' | 'approach' | 'tooling' | 'style' | 'workflow'
export type PromotionConfidence = 'strong' | 'moderate' | 'weak'

export interface Promotion {
  pattern: string
  evidence: string[]
  suggestedText: string
  confidence: PromotionConfidence
  category: PromotionCategory
}

export interface HomogenizeProposal {
  sourceProjects: string[]
  promotions: Promotion[]
}

export interface CfreudConfig {
  apiKey: string
  claudeDir: string
  model: string
}
