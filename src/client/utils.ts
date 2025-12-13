// Platform detection
export const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
export const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Debounce helper
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Escape HTML to prevent XSS
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Simple markdown rendering for AI responses
export function renderSimpleMarkdown(text: string): string {
  let s = escapeHtml(text);
  // Bold: **text** or __text__
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // Italic: *text* or _text_
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  s = s.replace(/_(.+?)_/g, '<em>$1</em>');
  // Code: backticks
  s = s.replace(/`(.+?)`/g, '<code>$1</code>');
  // Line breaks
  s = s.replace(/\n/g, '<br>');
  return s;
}

// Get element by ID with type assertion
export function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// Get element by ID, throw if not found
export function requireElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null;
  if (!el) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return el;
}

// Initialize shortcut hints based on platform
export function initShortcutHints(): void {
  const hints = document.querySelectorAll<HTMLElement>('.shortcut-hint');
  hints.forEach(hint => {
    if (isTouchDevice) {
      hint.style.display = 'none';
    } else {
      const text = isMac ? hint.dataset.mac : hint.dataset.other;
      hint.textContent = text || '';
    }
  });
}

// Cmd/Ctrl+Enter handler for textareas
export function handleCmdEnter(textarea: HTMLTextAreaElement, submitFn: () => void): void {
  textarea.addEventListener('keydown', (e) => {
    const modKey = isMac ? e.metaKey : e.ctrlKey;
    if (modKey && e.key === 'Enter') {
      e.preventDefault();
      submitFn();
    }
  });
}
