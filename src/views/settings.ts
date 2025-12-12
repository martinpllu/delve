import { layout } from './layout.js';
import type { PageInfo, UserSettings } from '../wiki.js';
import { config } from '../config.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function settingsPage(
  settings: UserSettings,
  pages: PageInfo[] = [],
  project: string = 'default',
  projects: string[] = ['default']
): string {
  return layout({
    title: 'Settings',
    pages,
    project,
    projects,
    content: `
    <section class="settings-page">
      <h1>Settings</h1>

      <form action="/settings" method="POST" class="settings-form" id="settings-form">
        <div class="settings-section">
          <h2>OpenRouter</h2>
          <label for="model">Model</label>
          <p class="settings-description">
            Specify the model to use for generation.
            <br><br>
            Find model names at <a href="https://openrouter.ai/models" target="_blank" rel="noopener">openrouter.ai/models</a>.
            <br><br>
            Examples: <code>anthropic/claude-opus-4.5</code>, <code>openai/gpt-5.2</code>, <code>google/gemini-3-pro-preview</code>, <code>google/gemini-2.5-flash</code>, <code>x-ai/grok-4-fast</code>
          </p>
          <input
            type="text"
            id="model"
            name="model"
            value="${escapeHtml(settings.model || config.model)}"
          />
        </div>

        <div class="settings-section">
          <h2>Prompts</h2>
          <label for="system-prompt">Custom System Prompt</label>
          <p class="settings-description">
            Add custom instructions that will be included with every LLM request.
            Leave blank to use default behavior.
          </p>
          <textarea
            id="system-prompt"
            name="systemPrompt"
            placeholder="e.g., Always write in a formal academic tone. Focus on historical accuracy. Include citations where possible."
            rows="6"
          >${escapeHtml(settings.systemPrompt)}</textarea>
        </div>

        <div class="form-footer">
          <button type="submit" id="save-btn">Save Settings</button>
          <span class="save-status" id="save-status"></span>
        </div>
      </form>
    </section>

    <script>
      (function() {
        const form = document.getElementById('settings-form');
        const saveBtn = document.getElementById('save-btn');
        const saveStatus = document.getElementById('save-status');
        const textarea = document.getElementById('system-prompt');

        // Cmd/Ctrl+Enter to submit
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        textarea.addEventListener('keydown', (e) => {
          const modKey = isMac ? e.metaKey : e.ctrlKey;
          if (modKey && e.key === 'Enter') {
            e.preventDefault();
            form.requestSubmit();
          }
        });

        form.addEventListener('submit', async (e) => {
          e.preventDefault();

          saveBtn.disabled = true;
          saveBtn.innerHTML = '<span class="spinner"></span> Saving...';
          saveStatus.textContent = '';

          try {
            const formData = new FormData(form);
            const response = await fetch('/settings', {
              method: 'POST',
              body: formData,
            });

            const result = await response.json();
            if (result.success) {
              saveStatus.textContent = 'Saved!';
              saveStatus.className = 'save-status success';
            } else {
              saveStatus.textContent = 'Error: ' + (result.error || 'Failed to save');
              saveStatus.className = 'save-status error';
            }
          } catch (error) {
            saveStatus.textContent = 'Error: ' + error.message;
            saveStatus.className = 'save-status error';
          } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Settings';
          }
        });
      })();
    </script>
  `,
  });
}
