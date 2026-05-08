#!/usr/bin/env node
/**
 * Generate the /images/og-demo.png Open Graph card for the live demo page.
 * 1200x630, the standard for Twitter / OpenGraph.
 *
 * Re-run when the brand or copy changes.
 */
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const OUT = path.resolve(__dirname, "..", "static", "images", "og-demo.png");

const HTML = `<!DOCTYPE html>
<html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Sora', system-ui, sans-serif; }
  html, body { width: 1200px; height: 630px; background: #0b0b19; color: #fff; }
  body { padding: 60px 70px; display: flex; flex-direction: column; justify-content: space-between;
    background:
      radial-gradient(800px 500px at 80% -10%, rgba(55,239,237,0.18), transparent 60%),
      radial-gradient(600px 400px at 0% 110%, rgba(123,93,255,0.12), transparent 60%),
      #0b0b19;
  }
  .header { display: flex; align-items: center; gap: 14px; }
  .header-text { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; }
  .accent { color: #37efed; }
  .pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px;
    border: 1px solid rgba(55,239,237,0.4); background: rgba(55,239,237,0.05); color: #37efed;
    font-size: 13px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
    font-family: 'SF Mono', ui-monospace, monospace; margin-bottom: 24px;
  }
  .pill-dot { width: 8px; height: 8px; border-radius: 50%; background: #37efed; box-shadow: 0 0 12px #37efed; }
  h1 { font-size: 76px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.05; max-width: 1000px; }
  .sub { font-size: 26px; line-height: 1.4; color: #a8acba; max-width: 900px; margin-top: 24px; }
  .footer { display: flex; align-items: center; justify-content: space-between; }
  .url { font-size: 22px; color: #37efed; font-weight: 600; font-family: 'SF Mono', ui-monospace, monospace; }
  .meta { font-size: 18px; color: #6b7280; }
  .stripe { width: 80px; height: 4px; background: linear-gradient(90deg, #37efed, transparent); border-radius: 2px; margin-bottom: 28px; }
</style></head><body>
  <div>
    <div class="pill"><span class="pill-dot"></span>Live Interactive Demo</div>
    <div class="stripe"></div>
    <h1>Click around the <span class="accent">actual portal</span>.</h1>
    <div class="sub">Captured from a real Zentinelle GRC instance with seeded data.<br>No signup, no install.</div>
  </div>
  <div class="footer">
    <div>
      <div class="header-text">Zentinelle <span class="accent">AI</span></div>
      <div class="meta" style="margin-top:8px">Governance · Risk · Compliance for AI agents</div>
    </div>
    <div class="url">zentinelle.ai/demo</div>
  </div>
</body></html>`;

(async () => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
  await page.setContent(HTML, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT, type: "png", fullPage: false });
  await browser.close();
  console.log("Wrote " + path.relative(process.cwd(), OUT));
})();
