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

export function generatePageView(topic: string): string {
  return layout(`Generating: ${topic}`, `
    <section class="streaming-section" id="streaming-section">
      <div class="streaming-header">
        <div class="spinner"></div>
      </div>
      <div class="streaming-content" id="streaming-content"></div>
    </section>

    <script type="module">
      import * as smd from 'https://cdn.jsdelivr.net/npm/streaming-markdown/smd.min.js';

      const streamingContent = document.getElementById('streaming-content');
      const topic = ${JSON.stringify(topic)};

      // Set up streaming markdown renderer
      const renderer = smd.default_renderer(streamingContent);
      const parser = smd.parser(renderer);

      async function generate() {
        try {
          const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ topic }),
          });

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.content) {
                    smd.parser_write(parser, data.content);
                  }
                  if (data.url) {
                    // Complete - redirect (replace so generate page isn't in history)
                    smd.parser_end(parser);
                    setTimeout(() => {
                      window.location.replace(data.url);
                    }, 500);
                  }
                  if (data.message) {
                    // Error
                    streamingContent.innerHTML = '<p class="error">Error: ' + data.message + '</p>';
                  }
                } catch {}
              }
            }
          }
        } catch (error) {
          streamingContent.innerHTML = '<p class="error">Connection error: ' + error.message + '</p>';
        }
      }

      generate();
    </script>
  `);
}
