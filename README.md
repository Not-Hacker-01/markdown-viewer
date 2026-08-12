# Markdown Viewer

A small, production-minded web app that renders an uploaded Markdown file as a clean, readable document, entirely in the browser.

**Live app:** https://assignment-rho-puce-76.vercel.app
**Repo:** https://github.com/Not-Hacker-01/markdown-viewer

## Project overview

Upload a single `.md` file and it's rendered as GitHub-Flavored Markdown — headings, tables, nested lists, code blocks with syntax coloring, blockquotes, task-list checkboxes, and more. A single **Copy** button places the rendered content on the clipboard as HTML, plain text, and (where the browser allows it) the original Markdown, so pasting into Word, Google Docs, or a plain-text field each gets the best format that destination understands.

## Features

- Upload via click-to-browse or drag-and-drop, one file at a time
- Full GitHub-Flavored Markdown: headings, paragraphs, ordered/unordered/nested lists, tables, blockquotes, inline code, code blocks, bold, italic, strikethrough, links, task-list checkboxes
- Syntax-colored code blocks with horizontal scroll for long lines, instead of breaking the page layout
- Wide tables scroll inside their own container
- Single Copy button — one payload containing `text/html`, `text/plain`, and (when supported) `text/markdown`, so the paste target picks the richest format it understands
- Sanitized rendering — untrusted Markdown/HTML can't inject scripts or event handlers
- Graceful handling of invalid file type, empty file, oversized file, unreadable file, and pathologically malformed Markdown — the app never crashes and previously loaded content is never wiped out by a failed upload attempt
- Fully responsive from 375px mobile up to desktop; keyboard-accessible upload and copy controls with visible focus states

## Tech stack

- **React 19 + Vite** — fast dev server, small production build, no framework features (SSR/routing) this single-view app needs
- **Tailwind CSS v4** (CSS-first config via `@tailwindcss/vite`) — utility styling
- **@tailwindcss/typography** — the `prose` plugin, for polished heading/list/table/blockquote/code typography instead of hand-rolled CSS for every element
- **react-markdown + remark-gfm** — Markdown → React rendering with GFM extensions (tables, strikethrough, task lists, autolinks)
- **rehype-raw + rehype-sanitize** — parse embedded raw HTML, then strip anything unsafe
- **rehype-highlight** — code block syntax highlighting

No backend, no state library, no TypeScript (per the assignment's constraints) — plain JavaScript throughout.

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

A sample file is included at `sample/open_test_case.md` for a quick manual test.

## Architecture

```
src/
  components/
    FileUploader.jsx        # click-to-browse + drag-and-drop; compact variant reused as "replace file"
    MarkdownViewer.jsx       # the remark/rehype rendering pipeline
    CopyButton.jsx            # single copy action + status feedback
    EmptyState.jsx            # first-run view
    ErrorState.jsx            # dismissible banner for file-load errors
    RenderErrorBoundary.jsx   # class component; catches render-time exceptions
    RenderFailureState.jsx    # fallback UI shown by the boundary
  utils/
    fileReader.js              # file validation + reading, throws typed MarkdownFileError
    clipboard.js                # builds the multi-format clipboard payload, cascading fallback
    sanitizeSchema.js           # rehype-sanitize schema (extends the default to allow task-list checkboxes)
    constants.js
  App.jsx                       # owns { fileName, source } and file-error state; wires everything together
```

**Data flow:** `FileUploader` reads and validates the file (`utils/fileReader.js`) and hands the raw Markdown string up to `App`. `App` holds the only two pieces of state that matter — the loaded document and any file-load error — and passes the source down to `MarkdownViewer` (lazy-loaded, see below) and to `CopyButton`. `CopyButton` reads the *rendered DOM* via a ref (not a second parse pass) to build the HTML/plain-text clipboard payloads, plus the original Markdown string already held in state.

`MarkdownViewer` is lazy-loaded (`React.lazy`) because `rehype-highlight`'s bundled language grammars are the bulk of the JS bundle and are only needed once a file is actually loaded — the empty-state first paint stays light.

## Technical decisions

- **React + Vite over Next.js**: the app is a single view with no routing, SSR, or server code — Vite gives a smaller, simpler build for that shape, and the assignment explicitly allows either.
- **react-markdown + remark-gfm + rehype-raw + rehype-sanitize** over a custom parser: Markdown parsing/edge cases (link reference definitions, unclosed fences, nested emphasis, GFM tables) are exactly what a hand-rolled parser gets subtly wrong. These are the standard, actively maintained unified/remark/rehype ecosystem packages.
- **Sanitization strategy**: the rehype pipeline runs `rehype-raw` (turn embedded raw HTML into inspectable nodes) → `rehype-sanitize` (strip disallowed tags/attributes/URL schemes — `<script>`, `on*` handlers, `javascript:` links are all removed) → `rehype-highlight` (adds its own trusted classNames *after* sanitization, so they aren't stripped). The sanitize schema extends rehype-sanitize's default GitHub-style allowlist by one entry (`<input type=checkbox>`) so GFM task lists render. External links get `target="_blank" rel="noopener noreferrer"` via a component override.
- **Malformed Markdown handling**: CommonMark itself defines recovery behavior for most "broken" input (e.g. an unclosed code fence absorbs the rest of the document as literal text instead of failing) — remark implements this correctly, so most malformed input degrades gracefully with no special-casing needed. A `RenderErrorBoundary` (React error boundary, necessarily a class component) wraps the viewer as a defense-in-depth fallback for the rare case a plugin throws; it shows a friendly message and lets the user load a different file without losing the rest of the app.
- **Clipboard implementation** (`utils/clipboard.js`): a single `ClipboardItem` is written with `text/html`, `text/plain`, and `text/markdown` together, so the paste target picks its preferred format. The HTML is built by cloning the *already-rendered, already-sanitized* DOM node (not re-running the Markdown pipeline) and inlining a small set of styles (table borders, blockquote rule, code background) onto it — Tailwind's utility classes don't travel with copied HTML into Word/Docs, so without this the pasted table/blockquote/code would look unstyled. If the browser rejects the three-type payload (Chromium currently does — custom `text/markdown` isn't on its allowed list), the code retries with just `text/html` + `text/plain`, and finally falls back to `writeText()`. The UI only ever shows "Copied" when a write actually succeeded.
- **File validation** (`utils/fileReader.js`): extension check (`.md`/`.markdown`) is the primary type check, since `File.type` for Markdown is unreliable across OS/browser combinations. A 5 MB size cap and empty-content check are included as reasonable production guardrails.

## AI assistance

Built with Claude Code (Claude Sonnet 5) as an AI pair programmer. AI generated the initial component/utility scaffolding and CSS from an explicit implementation plan; every file was then reviewed against the assignment requirements, and issues found during manual verification were fixed directly (for example: the hidden file `<input>` was receiving keyboard focus first with no visible focus ring since it's visually hidden — fixed with Tailwind's `peer-focus-visible` pattern so the ring shows on the visible label instead). The clipboard fallback cascade, sanitize schema, and rendering pipeline order were verified against real Chromium behavior with a scripted Playwright pass (screenshots + DOM assertions), not just read from library docs — see "Known limitations" for what that testing surfaced.

## Known limitations

- GitHub-style alert callouts (`> [!NOTE]`, `> [!WARNING]`) render as plain blockquotes rather than colored callout boxes — not part of core GFM, and out of scope for the time budget.
- `text/markdown` as a clipboard MIME type is written when the browser accepts it, but Chromium currently rejects custom clipboard types via this API, so pasting into a plain-text target there yields the plain-text fallback, not the original Markdown source. This is a browser platform limitation, not an app bug — the app's fallback cascade handles it correctly.
- LaTeX/math (`$$...$$`) is not rendered specially (not in the required feature list); it displays as plain text.
- No automated test suite — validation was manual/scripted (build, lint, and a Playwright-driven pass covering upload, all required Markdown features, clipboard formats, error states, responsive breakpoints, keyboard focus, and an XSS/malformed-input probe), matching the assignment's own "manually verify" testing guidance rather than adding a test framework to a 4–6 hour scope.

## Future improvements

- GitHub-style alert callout styling
- Toggleable raw-Markdown / rendered-view side-by-side
- Persisting the last-loaded file in `sessionStorage` so a reload doesn't lose it
