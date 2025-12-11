// Load .env file first (CLI env vars override these)
import { loadEnv } from './env.js';
loadEnv();

export const config = {
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  model: process.env.MODEL ?? 'anthropic/claude-sonnet-4',
  dataDir: process.env.DATA_DIR ?? 'data',
  detailLevel: process.env.DETAIL_LEVEL ?? 'comprehensive',
  port: parseInt(process.env.PORT ?? '3000'),
};

export function buildPrompt(
  topic: string,
  existingContent?: string,
  userMessage?: string
): string {
  const contentSection = existingContent
    ? `Current page content:\n${existingContent}`
    : 'This is a new page - no existing content.';

  const instructionSection = userMessage
    ? `\nUser instruction: ${userMessage}`
    : '';

  return `You are a wiki page generator. Output ONLY the markdown content for the wiki page - no explanations, no code block wrappers, just the raw markdown that will be saved directly to a .md file.

Topic: ${topic}

${contentSection}

Detail level: ${config.detailLevel}${instructionSection}

Guidelines:
- Write comprehensive, well-structured markdown
- Start with a level-1 heading (# Topic Name)
- Include [[WikiLinks]] to related subtopics that deserve their own pages
- Use headers, lists, and code blocks appropriately
- Be informative but concise
- Output ONLY the markdown content, nothing else`;
}
