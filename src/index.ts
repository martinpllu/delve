import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { config } from './config.js';
import {
  listPages,
  readPage,
  pageExists,
  generatePage,
  renderMarkdown,
  unslugify,
} from './wiki.js';
import { homePage } from './views/home.js';
import { wikiPage, errorPage } from './views/page.js';

const app = new Hono();

// Serve static files
app.use('/style.css', serveStatic({ root: './public' }));

// Home page
app.get('/', async (c) => {
  const pages = await listPages();
  return c.html(homePage(pages));
});

// Generate page from topic
app.post('/generate', async (c) => {
  try {
    const body = await c.req.parseBody();
    const topic = body['topic'];

    if (!topic || typeof topic !== 'string') {
      return c.html(errorPage('Please provide a topic'), 400);
    }

    const { slug } = await generatePage(topic.trim());
    return c.redirect(`/wiki/${slug}`);
  } catch (error) {
    console.error('Generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.html(errorPage(`Failed to generate page: ${message}`), 500);
  }
});

// View wiki page
app.get('/wiki/:slug', async (c) => {
  const slug = c.req.param('slug');
  const exists = await pageExists(slug);

  if (!exists) {
    // Auto-generate page for the topic
    try {
      const topic = unslugify(slug);
      await generatePage(topic);
    } catch (error) {
      console.error('Auto-generation error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return c.html(errorPage(`Failed to generate page: ${message}`), 500);
    }
  }

  const content = await readPage(slug);
  if (!content) {
    return c.html(errorPage('Page not found'), 404);
  }

  const htmlContent = await renderMarkdown(content);
  const title = unslugify(slug);
  return c.html(wikiPage(slug, title, htmlContent));
});

// Chat/edit page
app.post('/wiki/:slug/chat', async (c) => {
  const slug = c.req.param('slug');

  try {
    const body = await c.req.parseBody();
    const message = body['message'];

    if (!message || typeof message !== 'string') {
      return c.html(errorPage('Please provide a message'), 400);
    }

    const topic = unslugify(slug);
    await generatePage(topic, message.trim());
    return c.redirect(`/wiki/${slug}`);
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.html(errorPage(`Failed to update page: ${message}`), 500);
  }
});

// Start server
console.log(`Starting WikAI on http://localhost:${config.port}`);
serve({
  fetch: app.fetch,
  port: config.port,
});
