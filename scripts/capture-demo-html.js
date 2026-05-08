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
  {
    id: "02-agents",
    path: "/agents",
    waitFor: "[data-tour='agents-table']",
    variants: [
      {
        id: "02-agents--register",
        triggerLabel: "Register Agent",
        triggerAction: async (page) => {
          await page.locator('button:has-text("Register Agent")').first().click();
          await page.waitForSelector('[role="dialog"]', { timeout: 4000 });
          await page.waitForTimeout(400);
        },
      },
    ],
  },
  {
    id: "03-policies",
    path: "/policies",
    waitFor: "[data-tour='policies-heatmap']",
    variants: [
      {
        id: "03-policies--create",
        triggerLabel: "Create Policy",
        triggerAction: async (page) => {
          await page.locator('a:has-text("Create Policy"), button:has-text("Create Policy")').first().click();
          // Create Policy is a route, not a dialog
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(800);
        },
      },
    ],
  },
  {
    id: "04-risks",
    path: "/risks",
    waitFor: "[data-tour='risk-overview']",
    variants: [
      {
        id: "04-risks--create",
        triggerLabel: "Create Risk",
        triggerAction: async (page) => {
          await page.locator('button:has-text("Create Risk"), a:has-text("Create Risk")').first().click();
          await page.waitForSelector('[role="dialog"], form', { timeout: 4000 }).catch(() => {});
          await page.waitForTimeout(800);
        },
      },
    ],
  },
  { id: "05-compliance", path: "/compliance", waitFor: null },
  { id: "06-audit", path: "/audit-logs", waitFor: "[data-tour='audit-chain']" },
  {
    id: "07-assistant",
    path: "/assistant",
    waitFor: null,
    setup: async (page) => {
      // Type a real query and wait for the streaming response to settle.
      // This way the captured HTML shows a real conversation.
      const input = page.locator('textarea, input[placeholder*="Ask"]').first();
      if ((await input.count()) === 0) return;
      await input.fill("How many open risks do I have, and what is most critical?");
      await page.keyboard.press("Meta+Enter").catch(() => {});
      // Fallback: try Ctrl+Enter or click send button
      await page.locator('button[type="submit"], button[aria-label*="send" i]').first().click().catch(() => {});
      // Wait for at least some response text to appear
      await page.waitForTimeout(8000);
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

      // Capture variants (open dialog, navigate to sub-page, etc.)
      for (const v of step.variants || []) {
        const vOut = path.join(OUT_DIR, `${v.id}.html`);
        try {
          // Reload base page so each variant starts clean
          await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
          if (step.waitFor) {
            await page.waitForSelector(step.waitFor, { timeout: 8000 }).catch(() => {});
          }
          await v.triggerAction(page);
          const vHtml = await captureSelfContained(page);
          fs.writeFileSync(vOut, vHtml);
          console.log(
            `      └─ ${v.id} (${(vHtml.length / 1024).toFixed(0)} KB)`,
          );
        } catch (e) {
          console.warn(`      ⚠ ${v.id} failed: ${e.message.slice(0, 160)}`);
        }
      }
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
  // Pages we have captured for the demo — sidebar links to other pages
  // get hidden so visitors don't dead-end on a page that doesn't load.
  const CAPTURED_PATHS = [
    "/dashboard",
    "/agents",
    "/policies",
    "/risks",
    "/compliance",
    "/audit-logs",
    "/assistant",
  ];

  return await page.evaluate(async (capturedPaths) => {
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
        link.remove();
      }
    }

    // Strip scripts so the page is passive
    document.querySelectorAll("script").forEach((s) => s.remove());
    document.querySelectorAll("noscript").forEach((n) => n.remove());

    // Hide sidebar nav links to pages we haven't captured.
    // Allow each captured path AND its exact match — e.g. /policies/hierarchy
    // is a sub-page of /policies but we haven't captured it, so hide.
    const sidebarLinks = Array.from(
      document.querySelectorAll(
        'a[data-sidebar="menu-button"], [data-sidebar="menu"] a[href], [data-sidebar="content"] a[href], [data-sidebar="footer"] a[href]',
      ),
    );
    for (const a of sidebarLinks) {
      let pathname;
      try { pathname = new URL(a.href, window.location.origin).pathname; } catch { continue; }
      // External (target=_blank) or off-host: keep
      const isExternal = a.target === "_blank" ||
        (a.href.startsWith("http") && !a.href.includes(window.location.host));
      if (isExternal) continue;

      // Exact match against any captured path — hide everything else
      const matches = capturedPaths.some((p) => pathname === p);
      if (!matches) {
        const li = a.closest("li, [data-sidebar='menu-item']");
        (li || a).style.display = "none";
      }
    }

    // Hide sidebar group labels whose entire group is now empty
    document.querySelectorAll('[data-sidebar="group"]').forEach((group) => {
      const visibleItems = Array.from(
        group.querySelectorAll('[data-sidebar="menu-item"]'),
      ).filter((li) => li.style.display !== "none");
      if (visibleItems.length === 0) group.style.display = "none";
    });

    // Hide "Contact Us" / "Contact" stickies that come from the marketing
    // theme leaking into Next.js tenants. (Belt + suspenders.)
    document.querySelectorAll('[class*="contact"]').forEach((el) => {
      if (/contact/i.test(el.textContent || "")) el.remove();
    });

    // Hide search inputs (they look interactive but typing does nothing)
    document.querySelectorAll('input[type="search"], input[placeholder*="earch" i]').forEach((el) => {
      const wrapper = el.closest('[role="search"], form, label, .search') || el;
      wrapper.style.display = "none";
    });

    // Hide row-action menu (... triple-dot) buttons
    document.querySelectorAll('button[aria-label*="ction" i], button[aria-haspopup="menu"]').forEach((el) => {
      el.style.visibility = "hidden";
    });

    // Hide the sidebar collapse toggle — clicking it does nothing in passive mode
    document.querySelectorAll('[data-sidebar="trigger"], [data-slot="sidebar-trigger"]').forEach((el) => {
      el.style.display = "none";
    });

    // Hide the assistant chat bubble (floating sparkle bottom-right) — opens
    // a sheet that's just a portal to the chat, doesn't work without JS.
    // The dedicated /assistant tab covers that experience.
    document.querySelectorAll('[aria-label*="assistant" i], [data-tour="ai-assistant-bubble"]').forEach((el) => {
      el.style.display = "none";
    });

    // Normalize relative timestamps so they don't drift over time. Captures
    // would otherwise read "2h ago" forever. Replace with stable buckets.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let n; while ((n = walker.nextNode())) nodes.push(n);
    for (const node of nodes) {
      const t = node.nodeValue;
      if (!t) continue;
      let updated = t;
      // "Just now", "5m ago", "1h ago", "2h ago", "3d ago" → bucket
      updated = updated.replace(/\bjust now\b/gi, "moments ago");
      updated = updated.replace(/\b\d+\s*m\s*ago\b/gi, "minutes ago");
      updated = updated.replace(/\b\d+\s*h\s*ago\b/gi, "earlier today");
      updated = updated.replace(/\b\d+\s*d\s*ago\b/gi, "this week");
      if (updated !== t) node.nodeValue = updated;
    }

    // Disable form inputs so cursor doesn't suggest they're typeable
    document.querySelectorAll("textarea, input").forEach((el) => {
      el.setAttribute("readonly", "");
      el.style.cursor = "default";
    });

    // Add base href so font/image relative URLs resolve back to portal
    if (!document.querySelector("base")) {
      const base = document.createElement("base");
      base.href = window.location.origin;
      document.head.insertBefore(base, document.head.firstChild);
    }

    // Disable native pointer cursor on every button/link by default; make
    // explicit captured-page links keep pointer.
    const cleanupStyle = document.createElement("style");
    cleanupStyle.textContent = `
      /* Pointer events stay on links/buttons (parent intercepts).
         No visual change, but ensures hover doesn't show a wait cursor. */
      a, button { -webkit-tap-highlight-color: transparent; }
      /* Hide any leftover toast container (notifications, sonner) */
      [data-sonner-toaster], [class*="Toaster"] { display: none !important; }
    `;
    document.head.appendChild(cleanupStyle);

    return "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
  }, CAPTURED_PATHS);
}
