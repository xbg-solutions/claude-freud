import type { Project } from '../types.js';
export declare function buildDreamPrompt(project: Project): string;
export declare function buildComparePrompt(projectA: Project, projectB: Project, analysisA: string, analysisB: string): string;
export declare function buildHomogenizePrompt(projects: Project[], globalInstructions: string | null): string;
export declare const GLOBAL_CLAUDE_MD_TEMPLATE = "# Global Instructions\n\n> Maintained by claude-freud. Last updated: {DATE}\n> Sources: {SOURCES}\n\n## Approach & Architecture\n\n{APPROACH}\n\n## Tooling & Stack\n\n{TOOLING}\n\n## Workflow\n\n{WORKFLOW}\n\n## Style\n\n{STYLE}\n";
