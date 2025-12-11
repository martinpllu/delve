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

  return `You are a wiki page generator. Output ONLY the markdown content - no explanations, no code block wrappers, just raw markdown.

Topic: ${topic}

${contentSection}
${instructionSection}

Guidelines:
- Keep it SHORT: about 200-300 words maximum (roughly one page)
- Start with a level-1 heading (# Topic Name)
- Brief intro paragraph (2-3 sentences)
- 2-3 key sections with bullet points
- Use [[WikiLinks]] liberally for any notable entity: people, books, places, concepts, historical events, or anything wiki-page-worthy
- Example: "[[To Kill a Mockingbird]] by [[Harper Lee]]" not plain text
- Output ONLY the markdown content, nothing else`;
}
