import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
const CLAUDE_DIR = join(homedir(), '.claude');
const CFREUD_DIR = join(homedir(), '.claude-freud');
const CFREUD_CONFIG = join(CFREUD_DIR, 'config.json');
const CLAUDE_CONFIG_PATHS = [
    join(CLAUDE_DIR, 'settings.json'),
    join(CLAUDE_DIR, 'config.json'),
];
export async function loadConfig() {
    // 1. Respect explicit override
    if (process.env.ANTHROPIC_API_KEY) {
        return {
            apiKey: process.env.ANTHROPIC_API_KEY,
            claudeDir: CLAUDE_DIR,
            model: 'claude-sonnet-4-20250514',
        };
    }
    // 2. Check claude-freud's own config
    if (existsSync(CFREUD_CONFIG)) {
        try {
            const raw = await readFile(CFREUD_CONFIG, 'utf-8');
            const config = JSON.parse(raw);
            if (config.apiKey) {
                return {
                    apiKey: config.apiKey,
                    claudeDir: CLAUDE_DIR,
                    model: 'claude-sonnet-4-20250514',
                };
            }
        }
        catch {
            // continue to next option
        }
    }
    // 3. Try to read from Claude Code's config
    for (const configPath of CLAUDE_CONFIG_PATHS) {
        if (existsSync(configPath)) {
            try {
                const raw = await readFile(configPath, 'utf-8');
                const settings = JSON.parse(raw);
                if (settings.apiKey) {
                    return {
                        apiKey: settings.apiKey,
                        claudeDir: CLAUDE_DIR,
                        model: 'claude-sonnet-4-20250514',
                    };
                }
            }
            catch {
                // continue to next path
            }
        }
    }
    // No API key found - provide helpful error
    throw new Error(chalk.bold('No API key found.\n\n') +
        'Claude Freud uses the Anthropic API to analyze your project memories.\n' +
        'This requires an API key (separate from your Claude subscription).\n\n' +
        chalk.bold('To get started:\n') +
        chalk.dim('  1. Visit ') + chalk.cyan('https://console.anthropic.com/settings/keys\n') +
        chalk.dim('  2. Generate a new API key\n') +
        chalk.dim('  3. Run: ') + chalk.bold('cfreud config set-key <your-api-key>\n\n') +
        chalk.dim('Alternatively, set ANTHROPIC_API_KEY in your environment.\n\n') +
        chalk.dim('Note: API usage has separate pricing. See ') + chalk.cyan('https://anthropic.com/pricing'));
}
export { CLAUDE_DIR };
