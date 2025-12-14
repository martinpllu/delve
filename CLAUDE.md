# Delve

## Development

The dev server runs with hot-reload. Check `.env` for the PORT (default: 3171).

**DO NOT restart the server after making changes.** The `pnpm dev` command uses:
- `tsx watch` for server-side TypeScript (auto-restarts on changes to `src/`)
- Client watcher that rebuilds `bundle.js` on changes to `src/client/`

Just edit files and refresh the browser. Server restarts are only needed if:
- The server crashed
- You changed environment variables in `.env`
- You installed new dependencies

**If the server isn't running**, start it with: `pnpm dev`

## Data Storage

Page data is stored in `.delve/data/{project}/`. Settings are in `.delve/settings.json`.

Routes starting with `/_` are reserved for system routes.

## Recording Demo Video

To record a new demo video for the README:

1. Ensure dev server is running: `pnpm dev`
2. Ensure ffmpeg is installed: `brew install ffmpeg`
3. Run the recording script: `npx tsx scripts/record-demo.ts`
4. Convert to MP4: `ffmpeg -i videos/demo.webm -c:v libx264 -crf 20 -preset slow -y demo.mp4`
5. Upload to GitHub: drag `demo.mp4` into a new issue at https://github.com/martinpllu/delve/issues/new
6. Copy the generated `https://github.com/user-attachments/assets/...` URL
7. Update README.md with the new URL

The script uses Playwright to automate a browser session showing:
- Page generation with streaming
- Wiki link navigation
- Page-level editing
- Inline comments

See `scripts/README.md` for full documentation. The script deletes all pages in the target project before recording, so use a dedicated project (default: `data-structures`).
