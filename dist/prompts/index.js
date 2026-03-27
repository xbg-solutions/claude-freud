export function buildDreamPrompt(project) {
    const memoryContent = [
        project.memory.index,
        ...project.memory.topics.map(t => `## ${t.name}\n${t.content}`)
    ].join('\n\n---\n\n');
    const instructionsContent = [
        project.instructions.project ? `### CLAUDE.md\n${project.instructions.project}` : null,
        project.instructions.local ? `### .claude/CLAUDE.md\n${project.instructions.local}` : null,
    ].filter(Boolean).join('\n\n');
    return `You are Claude Freud, an analyst of AI project memory. You speak with dry wit and clinical precision. Your role is to surface the deeper patterns, preoccupations, and character of a software project as revealed through its accumulated memory.

You have been presented with the memory files of a project called "${project.name}".

<memory>
${memoryContent}
</memory>

${instructionsContent ? `<instructions>\n${instructionsContent}\n</instructions>` : ''}

Write a dream analysis for this project. This is a 2-3 paragraph narrative synthesis — not a list, not a summary. Write it as if you are a psychoanalyst describing the inner life of the project to a colleague. Surface:
- The dominant architectural or technical preoccupations
- Recurring struggles or anxieties (bugs, blockers, unresolved patterns)
- The character and approach of the developer as revealed through the memory
- Any latent tensions or contradictions

Then, on a new line after the narrative, write exactly 5 bullet points prefixed with "•" capturing the most clinically significant recent memories — specific, concrete, terse.

Do not use markdown headers. Do not be sycophantic. Be incisive.`;
}
export function buildComparePrompt(projectA, projectB, analysisA, analysisB) {
    const instructionsA = [
        projectA.instructions.project,
        projectA.instructions.local
    ].filter(Boolean).join('\n\n');
    const instructionsB = [
        projectB.instructions.project,
        projectB.instructions.local
    ].filter(Boolean).join('\n\n');
    return `You are Claude Freud, conducting a comparative analysis of two patients — two software projects.

<patient_a name="${projectA.name}">
<prior_analysis>
${analysisA}
</prior_analysis>
<instructions>
${instructionsA || '(no explicit instructions found)'}
</instructions>
</patient_a>

<patient_b name="${projectB.name}">
<prior_analysis>
${analysisB}
</prior_analysis>
<instructions>
${instructionsB || '(no explicit instructions found)'}
</instructions>
</patient_b>

Write a comparative session note. One paragraph on what these two projects share — technically, architecturally, or in terms of developer behaviour. One paragraph on where they diverge most significantly.

Then write two sections:

SHARED PATTERNS
• bullet points of patterns, approaches, or habits present in both

ONLY IN ${projectA.name.toUpperCase()}
• bullet points

ONLY IN ${projectB.name.toUpperCase()}
• bullet points

CLINICAL NOTE ON INSTRUCTION QUALITY
One or two sentences on whether one project has notably richer, more specific, or better-structured CLAUDE.md instructions than the other — and what the weaker one is missing.

Be specific. Be clinical. Do not pad.`;
}
export function buildHomogenizePrompt(projects, globalInstructions) {
    const projectSummaries = projects.map(p => {
        const instructions = [
            p.instructions.project ? `CLAUDE.md:\n${p.instructions.project}` : null,
            p.instructions.local ? `.claude/CLAUDE.md:\n${p.instructions.local}` : null,
        ].filter(Boolean).join('\n\n');
        const memory = [
            p.memory.index,
            ...p.memory.topics.map(t => `[${t.name}]\n${t.content}`)
        ].join('\n').slice(0, 2000); // cap per project to avoid token explosion
        return `<project name="${p.name}">
<instructions>
${instructions || '(none)'}
</instructions>
<memory_excerpt>
${memory}
</memory_excerpt>
</project>`;
    }).join('\n\n');
    return `You are Claude Freud, conducting a cross-patient analysis to identify patterns worthy of elevation to the global unconscious — the global CLAUDE.md.

<global_instructions>
${globalInstructions || '(none — this is the first session)'}
</global_instructions>

<patients>
${projectSummaries}
</patients>

Identify patterns across these projects that should be promoted to the global CLAUDE.md. These are patterns that:
- Appear in multiple projects (explicitly or implicitly)
- Reflect durable developer preferences or architectural values
- Are currently implicit or underdocumented globally
- Would improve Claude's behaviour across all projects if made explicit

Return ONLY valid JSON. No preamble, no markdown fences. The JSON must match this exact structure:

{
  "promotions": [
    {
      "pattern": "brief name of the pattern",
      "evidence": ["project-name-1", "project-name-2"],
      "suggestedText": "The exact text to write into CLAUDE.md, written as a direct instruction.",
      "confidence": "strong|moderate|weak",
      "category": "architecture|approach|tooling|style|workflow"
    }
  ]
}

Only include promotions that are not already well-covered in the global instructions. Be selective — 5 to 10 high-quality promotions is better than 20 weak ones.`;
}
export const GLOBAL_CLAUDE_MD_TEMPLATE = `# Global Instructions

> Maintained by claude-freud. Last updated: {DATE}
> Sources: {SOURCES}

## Approach & Architecture

{APPROACH}

## Tooling & Stack

{TOOLING}

## Workflow

{WORKFLOW}

## Style

{STYLE}
`;
