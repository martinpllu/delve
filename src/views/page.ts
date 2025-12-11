import { layout } from './layout.js';

export function wikiPage(slug: string, title: string, htmlContent: string): string {
  return layout(title, `
    <article class="wiki-page">
      <div class="wiki-content">
        ${htmlContent}
      </div>
    </article>

    <section class="chat-section">
      <h3>Ask or Edit</h3>
      <form action="/wiki/${slug}/chat" method="POST" class="chat-form">
        <textarea
          name="message"
          placeholder="Ask a question about this topic, or give instructions to edit the page..."
          rows="3"
          required
        ></textarea>
        <button type="submit">Send</button>
      </form>
    </section>
  `);
}

export function generatingPage(topic: string): string {
  return layout('Generating...', `
    <section class="generating">
      <h1>Generating page for "${topic}"</h1>
      <p>Please wait while Claude creates your wiki page...</p>
      <div class="spinner"></div>
    </section>
  `);
}

export function errorPage(message: string): string {
  return layout('Error', `
    <section class="error-page">
      <h1>Something went wrong</h1>
      <p>${message}</p>
      <a href="/" class="btn">Go Home</a>
    </section>
  `);
}
