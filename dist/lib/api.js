import Anthropic from '@anthropic-ai/sdk';
let client = null;
export function getClient(config) {
    if (!client) {
        client = new Anthropic({ apiKey: config.apiKey });
    }
    return client;
}
export async function analyse(prompt, config) {
    const anthropic = getClient(config);
    const response = await anthropic.messages.create({
        model: config.model,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
    });
    const block = response.content[0];
    if (block.type !== 'text')
        throw new Error('Unexpected response type from API');
    return block.text;
}
export async function analyseJson(prompt, config) {
    const raw = await analyse(prompt, config);
    try {
        return JSON.parse(raw.replace(/```json|```/g, '').trim());
    }
    catch {
        throw new Error(`Failed to parse JSON response from API:\n${raw}`);
    }
}
