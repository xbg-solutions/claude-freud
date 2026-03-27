import chalk from 'chalk';
import { analyse } from '../lib/api.js';
import { buildDreamPrompt, buildComparePrompt } from '../prompts/index.js';
import { formatCompareTerminal, formatCompareMd } from '../lib/output.js';
export async function compareCommand(projectA, projectB, config, mdMode) {
    console.log(chalk.dim(`  Analysing ${projectA.name}...`));
    const analysisA = await analyse(buildDreamPrompt(projectA), config);
    console.log(chalk.dim(`  Analysing ${projectB.name}...`));
    const analysisB = await analyse(buildDreamPrompt(projectB), config);
    console.log(chalk.dim(`  Conducting comparative session...`));
    const comparison = await analyse(buildComparePrompt(projectA, projectB, analysisA, analysisB), config);
    if (mdMode) {
        const header = `# Claude Freud — Comparative Analysis\n\n> ${projectA.name} × ${projectB.name}\n> Generated: ${new Date().toISOString()}\n\n`;
        console.log(header + formatCompareMd(comparison, projectA.name, projectB.name));
    }
    else {
        console.log(formatCompareTerminal(comparison, projectA.name, projectB.name));
    }
}
