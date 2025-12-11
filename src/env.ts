import * as fs from 'fs';
import * as path from 'path';

/**
 * Simple .env parser - no external dependencies
 * CLI environment variables override .env file values
 */
export function loadEnv(envPath: string = '.env'): void {
  const fullPath = path.resolve(envPath);

  let content: string;
  try {
    content = fs.readFileSync(fullPath, 'utf-8');
  } catch {
    // .env file doesn't exist, that's fine
    return;
  }

  const lines = content.split('\n');

  for (const line of lines) {
    // Skip empty lines and comments
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Find first = sign
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Only set if not already set (CLI overrides .env)
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
