# Demo capture pipeline

Generates the static HTML snapshots that power the Walnut-style live demo
at `/demo`. Each snapshot is a self-contained HTML file (CSS inlined,
scripts stripped) of a real Zentinelle portal page, mounted in an iframe
on the marketing site.

## When to re-run

Re-capture whenever the portal UI changes meaningfully:

- New page added to the tour (update `STEPS` in `capture-demo-html.js`)
- Layout, theme, or component changes that alter visual structure
- Seeded data updated (so screenshots reflect realistic numbers)

## Prerequisites

- A Zentinelle portal running locally (`docker compose up` from `zentinelle.git`)
- Seeded demo data — recommended: run the demo seeder so charts and
  tables aren't empty
- Anthropic API key configured so step 7 (Assistant) captures a real
  conversation

## Run

```bash
cd zentinelle-site
node scripts/capture-demo-html.js --portal=http://localhost:8080
```

Override the output directory with `--out=...`. Defaults to `static/demo/`.

## What it does

For each step in `STEPS`:

1. Open a Playwright Chromium tab at `1440x900`, dark scheme
2. Navigate to the portal page
3. Optionally run a `setup()` hook (e.g. type into the chat)
4. Inline all linked stylesheets
5. Strip `<script>` and `<noscript>` tags (page is now passive)
6. Hide sidebar nav links to pages that aren't part of the demo
7. Hide search inputs, row-action menus, sidebar collapse triggers
8. Normalize relative timestamps ("2h ago" → "earlier today") so the
   demo doesn't drift over time
9. Save as `static/demo/NN-name.html`

For pages with `variants` (e.g. modal-open states), repeat steps 1-9
after triggering the modal.

## Output

```
static/demo/
├── 01-dashboard.html
├── 02-agents.html
├── 02-agents--register.html
├── 03-policies.html
├── 03-policies--create.html
├── 04-risks.html
├── 04-risks--create.html
├── 05-compliance.html
├── 06-audit.html
└── 07-assistant.html
```

Total payload: ~3 MB. Each file is ~300-400 KB.

## Verify

```bash
hugo server
# open http://localhost:1313/demo/
```

Click each tab. Click "Register Agent" / "Create Policy" / "Create Risk"
to verify the modal variants swap in. Cancel to swap back. Use ← / → to
keyboard-navigate between tabs.

## Updating the tour

Edit `scripts/capture-demo-html.js`'s `STEPS` array to add/remove pages.
Edit `themes/zentinelle/layouts/demo/single.html`'s `PAGES` array to
match. Re-run the capture.
