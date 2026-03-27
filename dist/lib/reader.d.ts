import type { Project } from '../types.js';
export declare function loadAllProjects(claudeDir: string): Promise<Project[]>;
export declare function loadProject(claudeDir: string, projectId: string): Promise<Project | null>;
export declare function loadGlobalInstructions(claudeDir: string): Promise<string | null>;
