#!/usr/bin/env node
/**
 * Capture screenshots of a running Zentinelle portal for the static demo.
 *
 * Usage:
 *   node scripts/capture-demo.js [--portal=http://localhost:8080] [--out=static/images/demo]
 *
 * The marketing site ships the captured PNGs and renders an interactive
 * tour over them — no live portal needed for visitors.
 *
 * Re-run this script whenever the portal UI changes meaningfully.
 */
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

const PORTAL = args.portal || process.env.PORTAL_URL || "http://localhost:8080";
const OUT_DIR = path.resolve(args.out || "static/images/demo");
const VIEWPORT = { width: 1440, height: 900 };

// Each step captures a specific page. The viewer overlays tour popovers
// in the marketing site, so we only need the bare page screenshot here.
const STEPS = [
  { id: "01-dashboard", path: "/dashboard", waitFor: "[data-tour='dashboard-stats']" },
  { id: "02-agents", path: "/agents", waitFor: "[data-tour='agents-table']" },
  { id: "03-policies", path: "/policies", waitFor: "[data-tour='policies-heatmap']" },
  { id: "04-risks", path: "/risks", waitFor: "[data-tour='risk-overview']" },
  { id: "05-compliance", path: "/compliance", waitFor: "[data-tour='compliance-frameworks']" },
  { id: "06-audit", path: "/audit-logs", waitFor: "[data-tour='audit-chain']" },
  { id: "07-assistant", path: "/assistant", waitFor: null,
    setup: async (page) => {
      // Send a sample query so the chat panel shows real content
      const input = await page.locator('textarea, input[placeholder*="Ask"]').first();
      if (await input.count() > 0) {
        await input.fill("How many open risks do I have?");
        await page.waitForTimeout(300);
      }
    } },
];

(async () => {
  console.log(`Capturing demo screenshots from ${PORTAL} → ${OUT_DIR}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2, // retina
    colorScheme: "dark",
  });
  const page = await context.newPage();

  // Make sure no demo tour state is set so screenshots are clean
  await page.addInitScript(() => {
    sessionStorage.clear();
    document.body?.classList.remove("zentinelle-embed");
  });

  for (const step of STEPS) {
    const url = `${PORTAL}${step.path}`;
    console.log(`  ${step.id} ← ${url}`);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
      if (step.waitFor) {
        await page
          .waitForSelector(step.waitFor, { timeout: 8000 })
          .catch(() => console.warn(`    (no selector match — capturing anyway)`));
      }
      if (step.setup) {
        try {
          await step.setup(page);
        } catch (e) {
          console.warn(`    setup failed: ${e.message}`);
        }
      }
      // Settle: let charts/animations finish
      await page.waitForTimeout(1200);
      const out = path.join(OUT_DIR, `${step.id}.png`);
      await page.screenshot({ path: out, fullPage: false });
      console.log(`    → ${path.relative(process.cwd(), out)}`);
    } catch (e) {
      console.warn(`  ⚠ ${step.id} failed: ${e.message}`);
    }
  }

  await browser.close();
  console.log("Done.");
})();
