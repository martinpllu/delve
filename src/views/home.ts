import { layout } from './layout.js';

interface Page {
  slug: string;
  title: string;
}

export function homePage(pages: Page[]): string {
  const pagesList = pages.length > 0
    ? `<ul class="page-list">
        ${pages.map(p => `<li><a href="/wiki/${p.slug}">${p.title}</a></li>`).join('\n        ')}
      </ul>`
    : '<p class="empty-state">No pages yet. Create your first one below!</p>';

  return layout('Home', `
    <section class="hero">
      <h1>Welcome to WikAI</h1>
      <p>Your personal AI-powered wiki. Enter a topic to generate a knowledge page.</p>
    </section>

    <section class="generate-section">
      <form action="/generate" method="POST" class="generate-form">
        <label for="topic">Topic or Question</label>
        <textarea
          id="topic"
          name="topic"
          placeholder="e.g., PostgreSQL, How does DNS work?, Machine Learning basics..."
          rows="3"
          required
        ></textarea>
        <button type="submit">Generate Page</button>
      </form>
    </section>

    <section class="pages-section">
      <h2>Existing Pages</h2>
      ${pagesList}
    </section>
  `);
}
