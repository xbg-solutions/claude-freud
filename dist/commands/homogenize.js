import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';
import chalk from 'chalk';
import { analyseJson } from '../lib/api.js';
import { buildHomogenizePrompt, GLOBAL_CLAUDE_MD_TEMPLATE } from '../prompts/index.js';
import { formatHomogenizeTerminal, formatHomogenizeMd } from '../lib/output.js';
import { loadGlobalInstructions } from '../lib/reader.js';
function confirm(question) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim().toLowerCase() === 'y');
        });
    });
}
function buildGlobalClaudeMd(promotions, sourceProjects, existing) {
    const byCategory = (cat) => promotions
        .filter(p => p.category === cat)
        .map(p => `- ${p.suggestedText}`)
        .join('\n');
    const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!existing) {
        // Fresh file from template
        return GLOBAL_CLAUDE_MD_TEMPLATE
            .replace('{DATE}', date)
            .replace('{SOURCES}', sourceProjects.join(', '))
            .replace('{APPROACH}', byCategory('approach') || byCategory('architecture') || '_(none promoted)_')
            .replace('{TOOLING}', byCategory('tooling') || '_(none promoted)_')
            .replace('{WORKFLOW}', byCategory('workflow') || '_(none promoted)_')
            .replace('{STYLE}', byCategory('style') || '_(none promoted)_');
    }
    // Merge into existing — append a new section rather than clobber
    const additions = promotions.map(p => `- ${p.suggestedText}`).join('\n');
    const note = `\n\n---\n\n## Promoted by claude-freud (${date})\n\n> Sources: ${sourceProjects.join(', ')}\n\n${additions}\n`;
    return existing + note;
}
export async function homogenizeCommand(projects, config, applyMode, mdMode) {
    const globalInstructions = await loadGlobalInstructions(config.claudeDir);
    const globalPath = join(config.claudeDir, 'CLAUDE.md');
    console.log(chalk.dim(`  Scanning ${projects.length} projects for promotable patterns...`));
    const prompt = buildHomogenizePrompt(projects, globalInstructions);
    const result = await analyseJson(prompt, config);
    const proposal = {
        sourceProjects: projects.map(p => p.name),
        promotions: result.promotions,
    };
    if (proposal.promotions.length === 0) {
        console.log(chalk.dim('\n  The unconscious offers nothing new. Global CLAUDE.md appears sufficient.\n'));
        return;
    }
    // Show the proposal
    if (mdMode) {
        console.log(formatHomogenizeMd(proposal));
    }
    else {
        console.log(formatHomogenizeTerminal(proposal));
    }
    if (!applyMode) {
        console.log(chalk.dim('  Dry run complete. Pass --apply to write these to your global CLAUDE.md.\n'));
        return;
    }
    // Confirmation
    const isNew = !existsSync(globalPath);
    const confirmMessage = isNew
        ? chalk.yellow(`\n  No global CLAUDE.md found.\n  The unconscious has never been examined.\n  Open a new case file at ${globalPath}? [y/N] `)
        : chalk.yellow(`\n  Promote ${proposal.promotions.length} pattern(s) to ${globalPath}? [y/N] `);
    const confirmed = await confirm(confirmMessage);
    if (!confirmed) {
        console.log(chalk.dim('\n  The session ends here. No changes made.\n'));
        return;
    }
    const newContent = buildGlobalClaudeMd(proposal.promotions, proposal.sourceProjects, globalInstructions);
    await writeFile(globalPath, newContent, 'utf-8');
    console.log(chalk.green(`\n  ✓ ${isNew ? 'Case file opened' : 'Patterns promoted'}: ${globalPath}`));
    console.log(chalk.dim(`    ${proposal.promotions.length} pattern(s) written.\n`));
}
