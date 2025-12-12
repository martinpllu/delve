# WikAI Architecture

## Overview

WikAI is a TypeScript/Hono web app that generates wiki pages using OpenRouter's streaming API. Pages are stored as markdown files and rendered with wiki-style `[[links]]`.

## Project Structure

```
src/
├── index.ts      # Hono routes & server
├── config.ts     # Config from .env (loads env.ts first)
├── env.ts        # Simple .env parser (no dotenv dependency)
├── claude.ts     # OpenRouter API client (streaming + non-streaming)
├── wiki.ts       # Page CRUD, markdown rendering, [[WikiLink]] processing
└── views/
    ├── layout.ts # Base HTML template
    ├── home.ts   # Home page with form + streaming JS
    └── page.ts   # Wiki page view, error page, streaming generation page
public/
└── style.css     # All styles including streaming cursor animation
data/             # Generated .md files (gitignored)
```

## Key Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Home page with topic input |
| `/generate` | POST | SSE stream - generates page, returns chunks |
| `/generate-page/:topic` | GET | Streaming generation UI (for wiki link clicks) |
| `/wiki/:slug` | GET | View page (redirects to generate-page if not exists) |
| `/wiki/:slug/chat` | POST | Edit page via chat |

## Streaming Flow

1. User submits topic (form or wiki link click)
2. Client JS fetches `/generate` and reads SSE stream
3. Server calls `generatePageStreaming()` which yields chunks from OpenRouter
4. Client uses `streaming-markdown` library to render chunks progressively
5. A pulsing cursor follows the last character during generation
6. On completion, redirects to `/wiki/:slug`

## Key Files

- **claude.ts**: `invokeClaudeStreaming()` is an async generator that yields content deltas from OpenRouter's streaming API
- **wiki.ts**: `generatePageStreaming()` wraps the Claude call, saves file on completion
- **home.ts / page.ts**: Client-side JS handles SSE parsing and streaming-markdown rendering

## Dependencies

- `hono` + `@hono/node-server` - Web framework
- `marked` - Markdown to HTML (for final page render)
- `streaming-markdown` (CDN) - Progressive markdown rendering during generation
