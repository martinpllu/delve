import * as fs from 'fs/promises';
import * as path from 'path';
import { marked } from 'marked';
import { config, buildPrompt } from './config.js';
import { invokeClaude } from './claude.js';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getPagePath(slug: string): string {
  return path.join(config.dataDir, `${slug}.md`);
}

export async function pageExists(slug: string): Promise<boolean> {
  try {
    await fs.access(getPagePath(slug));
    return true;
  } catch {
    return false;
  }
}

export async function readPage(slug: string): Promise<string | null> {
  try {
    return await fs.readFile(getPagePath(slug), 'utf-8');
  } catch {
    return null;
  }
}

export async function writePage(slug: string, content: string): Promise<void> {
  await fs.mkdir(config.dataDir, { recursive: true });
  await fs.writeFile(getPagePath(slug), content, 'utf-8');
}

export async function listPages(): Promise<Array<{ slug: string; title: string }>> {
  try {
    const files = await fs.readdir(config.dataDir);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const slug = f.replace('.md', '');
        return { slug, title: unslugify(slug) };
      });
  } catch {
    return [];
  }
}

// Convert [[WikiLinks]] to HTML links
function processWikiLinks(html: string): string {
  return html.replace(/\[\[([^\]]+)\]\]/g, (_, linkText: string) => {
    const slug = slugify(linkText);
    return `<a href="/wiki/${slug}" class="wiki-link">${linkText}</a>`;
  });
}

export async function renderMarkdown(content: string): Promise<string> {
  const html = await marked(content);
  return processWikiLinks(html);
}

export async function generatePage(
  topic: string,
  userMessage?: string
): Promise<{ slug: string; content: string }> {
  const slug = slugify(topic);
  const existingContent = await readPage(slug);

  const prompt = buildPrompt(topic, existingContent ?? undefined, userMessage);
  const markdownContent = await invokeClaude(prompt);

  await writePage(slug, markdownContent);

  return { slug, content: markdownContent };
}
