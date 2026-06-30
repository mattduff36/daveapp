<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Dev server — manual only

Do **not** start or restart `npm run dev` / `next dev`. The user controls the dev server manually.

- Verify changes with `npm run build` or `npm run test` instead.
- If a live server is needed, ask the user to run `npm run dev` (port 4000) themselves.
