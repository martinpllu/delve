import { isMac, getElement } from './utils.js';

const MODEL_HELP: Record<string, string> = {
  openrouter: 'Find model names at <a href="https://openrouter.ai/models" target="_blank" rel="noopener">openrouter.ai/models</a>. Examples: <code>anthropic/claude-opus-4.5</code>, <code>openai/gpt-5.2</code>',
  openai: 'Examples: <code>gpt-4.1</code>, <code>gpt-5</code>, <code>o4-mini</code>',
  anthropic: 'Examples: <code>claude-opus-4-5-20251101</code>, <code>claude-sonnet-4-5-20250929</code>',
};

const SEARCH_HELP: Record<string, string> = {
  openrouter: 'When enabled, appends <code>:online</code> to the model ID for web search via OpenRouter.',
  openai: 'Uses OpenAI search-enabled models for real-time information.',
  anthropic: 'Uses Anthropic\'s web search tool for real-time information.',
};

const DEFAULT_MODELS: Record<string, string> = {
  openrouter: 'anthropic/claude-sonnet-4.5',
  openai: 'gpt-5.2',
  anthropic: 'claude-sonnet-4-5-20250929',
};

export function initSettings(): void {
  const form = getElement<HTMLFormElement>('settings-form');
  if (!form) return; // Not on settings page

  const saveBtn = getElement<HTMLButtonElement>('save-btn');
  const saveStatus = getElement<HTMLSpanElement>('save-status');
  const textarea = getElement<HTMLTextAreaElement>('system-prompt');
  const providerSelect = document.getElementById('provider') as HTMLSelectElement | null;
  const modelInput = document.getElementById('model') as HTMLInputElement | null;
  const modelHelp = document.getElementById('model-help');
  const searchToggle = document.getElementById('search-toggle');
  const searchCheckbox = document.getElementById('search-enabled') as HTMLInputElement | null;
  const searchDescription = document.getElementById('search-description');

  if (!saveBtn || !saveStatus || !textarea) return;

  // Update UI based on selected provider
  function updateProviderUI() {
    const provider = providerSelect?.value || 'openrouter';

    // Show/hide API key fields
    document.querySelectorAll('.api-key-field').forEach(el => {
      (el as HTMLElement).classList.add('hidden');
    });
    document.getElementById(`api-key-${provider}`)?.classList.remove('hidden');

    // Update model help text
    if (modelHelp) {
      modelHelp.innerHTML = MODEL_HELP[provider] || MODEL_HELP.openrouter;
    }

    // Update model placeholder
    if (modelInput) {
      modelInput.placeholder = DEFAULT_MODELS[provider] || '';
    }

    // Update search toggle
    if (searchToggle && searchCheckbox && searchDescription) {
      searchDescription.innerHTML = SEARCH_HELP[provider] || SEARCH_HELP.openrouter;
    }
  }

  // Set initial state
  updateProviderUI();

  // Listen for provider changes
  providerSelect?.addEventListener('change', updateProviderUI);

  // Cmd/Ctrl+Enter to submit
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
      const response = await fetch('/_settings', {
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
      saveStatus.textContent = 'Error: ' + (error as Error).message;
      saveStatus.className = 'save-status error';
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Settings';
    }
  });
}
