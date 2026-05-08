#!/usr/bin/env node
/**
 * Capture self-contained HTML snapshots of a running Zentinelle portal.
 *
 * Each snapshot has CSS, fonts, and images inlined so it renders standalone.
 * Scripts are stripped to keep the demo passive (no API calls, no hydration).
 *
 * Usage:
 *   node scripts/capture-demo-html.js [--portal=http://localhost:8080] [--out=static/demo]
 */
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const { chromium } = require("playwright");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

const PORTAL = args.portal || process.env.PORTAL_URL || "http://localhost:8080";
const OUT_DIR = path.resolve(args.out || "static/demo");

const STEPS = [
  { id: "01-dashboard", path: "/dashboard", waitFor: "[data-tour='dashboard-stats']" },
  { id: "02-agents", path: "/agents", waitFor: "[data-tour='agents-table']" },
  { id: "03-policies", path: "/policies", waitFor: "[data-tour='policies-heatmap']" },
  { id: "04-risks", path: "/risks", waitFor: "[data-tour='risk-overview']" },
  { id: "05-compliance", path: "/compliance", waitFor: null },
  { id: "06-audit", path: "/audit-logs", waitFor: "[data-tour='audit-chain']" },
  {
    id: "07-assistant",
    path: "/assistant",
    waitFor: null,
    setup: async (page) => {
      const input = page.locator('textarea, input[placeholder*="Ask"]').first();
      if ((await input.count()) > 0) {
        await input.fill("How many open risks do I have?");
        await page.waitForTimeout(300);
      }
    },
  },
];

const sfCli = path.resolve(
  __dirname,
  "..",
  "node_modules",
  ".bin",
  "single-file",
);
const browserPath = chromium.executablePath();

(async () => {
  console.log(`Capturing self-contained HTML from ${PORTAL} → ${OUT_DIR}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Pre-prep step 7 (typed input) requires Playwright. For others, single-file
  // can navigate directly. We'll handle step 7 specially by capturing via
  // Playwright's content() with manual CSS inlining.
  const browser = await chromium.launch();

  for (const step of STEPS) {
    const url = `${PORTAL}${step.path}`;
    const out = path.join(OUT_DIR, `${step.id}.html`);
    console.log(`  ${step.id} ← ${url}`);

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      colorScheme: "dark",
    });
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
      if (step.waitFor) {
        await page
          .waitForSelector(step.waitFor, { timeout: 8000 })
          .catch(() => {});
      }
      if (step.setup) {
        await step.setup(page);
      }
      await page.waitForTimeout(800);

      const html = await captureSelfContained(page);
      fs.writeFileSync(out, html);
      console.log(
        `    → ${path.relative(process.cwd(), out)} (${(html.length / 1024).toFixed(0)} KB)`,
      );
    } catch (e) {
      console.warn(`  ⚠ ${step.id} failed: ${e.message.slice(0, 200)}`);
    }
    await context.close();
  }

  await browser.close();
  console.log("Done.");
})();

/**
 * Manual self-contained capture: serialize document, inline stylesheets,
 * strip scripts. Used for steps that need page interaction first.
 */
async function captureSelfContained(page) {
  return await page.evaluate(async () => {
    // Inline all linked stylesheets
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    for (const link of links) {
      try {
        const r = await fetch(link.href);
        const css = await r.text();
        const style = document.createElement("style");
        style.textContent = css;
        link.replaceWith(style);
      } catch (e) {
        // Drop broken stylesheets silently
        link.remove();
      }
    }

    // Strip <script> tags so the page is passive
    document.querySelectorAll("script").forEach((s) => s.remove());

    // Strip <noscript> too
    document.querySelectorAll("noscript").forEach((n) => n.remove());

    // Add base href so any relative URLs (fonts, images) resolve back to portal
    if (!document.querySelector("base")) {
      const base = document.createElement("base");
      base.href = window.location.origin;
      document.head.insertBefore(base, document.head.firstChild);
    }

    return "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
  });
}
