import chalk from 'chalk';
export function listProjects(projects, mdMode) {
    if (projects.length === 0) {
        console.log(chalk.dim('No patients found. ~/.claude/projects/ appears empty.'));
        return;
    }
    if (mdMode) {
        console.log('# Projects\n');
        for (const p of projects) {
            const path = p.resolvedPath ?? chalk.dim('(path unresolved)');
            const topicCount = p.memory.topics.length;
            console.log(`- **${p.name}** \`${p.id}\``);
            console.log(`  - Path: \`${path}\``);
            console.log(`  - Memory topics: ${topicCount}`);
            console.log(`  - Last session: ${p.memory.lastModified.toLocaleDateString()}`);
            console.log();
        }
        return;
    }
    console.log(chalk.bold.dim(`${'NAME'.padEnd(24)} ${'ID'.padEnd(40)} LAST SESSION`));
    console.log(chalk.dim('─'.repeat(80)));
    for (const p of projects) {
        const name = chalk.cyan(p.name.padEnd(24));
        const id = chalk.dim(p.id.padEnd(40));
        const date = chalk.dim(p.memory.lastModified.toLocaleDateString());
        const resolved = p.resolvedPath ? '' : chalk.yellow(' ⚠ path unresolved');
        console.log(`${name} ${id} ${date}${resolved}`);
    }
    console.log();
    console.log(chalk.dim(`${projects.length} patient(s) on record.`));
    console.log(chalk.dim(`Pass a project name or ID to \`cfreud\` for analysis.`));
    console.log();
}
