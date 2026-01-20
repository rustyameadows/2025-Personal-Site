# AGENTS.md

These instructions apply to work within this repo.

- Always use the Chrome MCP to verify the work in the running app **before** presenting results to the user.
- If the app isn’t running or the page can’t be reached, say so and ask how to proceed.
- Review `product.md` when you need product requirements or context.
- If migrations are added, ask the user to run them (and note any pending migration errors seen in the UI).
- Only modify files or lines explicitly under discussion; never make broader edits outside the requested scope.
- Do not change unrelated selectors/properties in the same file; if scope is unclear, ask before editing.
- When the user is mad, start and end every response with "I'm sorry."

High-level stack (update as it evolves):
- Rails 8.0.4
- PostgreSQL via `pg` 1.6.3
- Local dev server: http://localhost:3000
