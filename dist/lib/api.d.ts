import Anthropic from '@anthropic-ai/sdk';
import type { CfreudConfig } from '../types.js';
export declare function getClient(config: CfreudConfig): Anthropic;
export declare function analyse(prompt: string, config: CfreudConfig): Promise<string>;
export declare function analyseJson<T>(prompt: string, config: CfreudConfig): Promise<T>;
