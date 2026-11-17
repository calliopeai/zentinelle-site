#!/usr/bin/env node
// Generate the site's Calliope AI design tokens from a published
// @calliopelabs/ui: the plain CSS variables of dist/tokens/plain.css for the
// brand and grounds in CONFIG, each ground under the selector this site
// already uses for that mode.
//
// From 0.23.0 a brand with its own look ships its own plain.css
// (dist/tokens/brands/<product>/plain.css): its grounds, its accents, its faces
// and its corners. When the release has one for CONFIG.product, every value
// comes from that file.
//
// The family plain.css carries the family accents only. When the brand's accent is a
// product's own (Zentinelle teal, Workbench blue, ...), its two colours are
// read from the same release's dist/css/tokens.css and put in the tokens a
// product accent moves: primary, ring, chart-1, the sidebar primary and ring,
// their ink, and the primary tint of the sidebar accent. A product's sidebar
// colour replaces the ground's where the CSS layer lets it. Every colour in
// the output comes from the package; nothing is typed here.
//
// The header records the version, the configuration and the sha256 of the
// body. `--check` recomputes them, so a hand edit or a changed CONFIG without
// a sync fails.
//
// Usage: node scripts/sync-ui-tokens.mjs <version>   write OUT from that release
//        node scripts/sync-ui-tokens.mjs --check     verify the committed OUT
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CONFIG = {
  out: "themes/zentinelle/static/css/calliope-tokens.css",
  // The brand from @calliopelabs/ui's brand registry, for the header.
  brand: "Zentinelle AI brand",
  // The brand's id for data-product in css/tokens.css, or null for none.
  product: "zentinelle",
  // A family accent (green, copper, ice, periwinkle, amber) or the product's own.
  accent: "teal",
  // Read the brand's own plain.css (dist/tokens/brands/<product>/plain.css,
  // @calliopelabs/ui 0.23.0 and later) in place of the family one.
  own: true,
  // Each ground the site paints, the selector that paints it, and an
  // optional media query around the rule.
  grounds: [{ ground: "black", selector: ":root" }],
};

const FAMILY = ["green", "copper", "ice", "periwinkle", "amber"];
const SOURCE = CONFIG.own ? `dist/tokens/brands/${CONFIG.product}/plain.css` : "dist/tokens/plain.css";
const SHARED = /^--(radius|motion-|font-)/;
const ON_PRIMARY = ["--primary", "--ring", "--chart-1", "--sidebar-primary", "--sidebar-ring"];
const ON_INK = ["--primary-foreground", "--sidebar-primary-foreground"];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, CONFIG.out);

/** The declarations of the rule whose selector is exactly `selector`. */
function block(css, selector) {
  const start = css.indexOf(`\n${selector} {`);
  if (start < 0) throw new Error(`no rule for ${selector}`);
  const open = css.indexOf("{", start);
  const body = css.slice(open + 1, css.indexOf("}", open));
  const vars = new Map();
  for (const m of body.matchAll(/([\w-]+):\s*([^;]+);/g)) vars.set(m[1], m[2].trim());
  return vars;
}

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** One ground with the brand's accent, as concrete values. */
function ground(plain, tokens, { ground: name }) {
  const vars = new Map([...block(plain, `[data-ground="${name}"]`)]);
  const mode = vars.get("color-scheme") === "light" ? "light" : "dark";
  let primary;
  if (CONFIG.own || FAMILY.includes(CONFIG.accent)) {
    for (const [k, v] of block(plain, `[data-ground="${name}"][data-accent="${CONFIG.accent}"]`)) vars.set(k, v);
    primary = vars.get("--primary");
  } else {
    const brand = block(tokens, `[data-mode="${mode}"][data-accent="${CONFIG.accent}"]`);
    primary = brand.get("--brand-primary");
    const ink = brand.get("--brand-on-primary");
    if (!primary || !ink) throw new Error(`no colours for the ${CONFIG.accent} accent`);
    const [r, g, b] = rgb(vars.get("--primary"));
    const tint = new RegExp(`^rgba\\(${r}, ${g}, ${b}, ([\\d.]+)\\)$`);
    for (const k of ON_PRIMARY) vars.set(k, primary);
    for (const k of ON_INK) vars.set(k, ink);
    const alpha = tint.exec(vars.get("--sidebar-accent"))?.[1];
    if (alpha) vars.set("--sidebar-accent", `rgba(${rgb(primary).join(", ")}, ${alpha})`);
  }
  if (CONFIG.product && !CONFIG.own) {
    const layer = block(tokens, `[data-mode="${mode}"][data-ground="${name}"]`).get("--sidebar") ?? "";
    const slot = /^var\((--brand-sidebar(?:-light)?),/.exec(layer)?.[1];
    const own = slot && block(tokens, `[data-product="${CONFIG.product}"]`).get(slot);
    if (own) vars.set("--sidebar", own);
  }
  for (const [k, v] of vars) {
    if (k.startsWith("--") && !/^(#[0-9a-f]{6}|rgba\(\d+, \d+, \d+, [\d.]+\))$/i.test(v)) {
      throw new Error(`${name}: ${k} is not a concrete colour: ${v}`);
    }
  }
  return { mode, primary, vars };
}

function rule(selector, vars, media) {
  const lines = [...vars].map(([k, v]) => `  ${k}: ${v};`);
  if (!media) return `${selector} {\n${lines.join("\n")}\n}\n`;
  return `@media ${media} {\n  ${selector} {\n${lines.map((l) => `  ${l}`).join("\n")}\n  }\n}\n`;
}

function header(version, sha) {
  const grounds = CONFIG.grounds
    .map((g) => `${g.ground} on ${g.selector}${g.media ? ` in @media ${g.media}` : ""}`)
    .join("; ");
  return (
    `/* Generated from @calliopelabs/ui@${version} ${CONFIG.own ? `(${SOURCE})\n *` : `(${SOURCE},\n * dist/css/tokens.css)`}` +
    ` by scripts/sync-ui-tokens.mjs.\n` +
    ` * ${CONFIG.brand}, ${CONFIG.accent} accent.\n` +
    ` * Grounds: ${grounds}.\n` +
    ` * sha256:${sha}\n` +
    " * Do not edit. Run `node scripts/sync-ui-tokens.mjs <version>` to update. */\n"
  );
}

if (process.argv[2] === "--check") {
  const text = readFileSync(dest, "utf8");
  const end = text.indexOf("*/\n") + 3;
  const version = /@calliopelabs\/ui@([\w.-]+)/.exec(text)?.[1];
  const sha = createHash("sha256").update(text.slice(end)).digest("hex");
  if (!version || text.slice(0, end) !== header(version, sha)) {
    console.error(`${CONFIG.out} does not match scripts/sync-ui-tokens.mjs: run the sync, do not edit it`);
    process.exit(1);
  }
  console.log(`${CONFIG.out}: @calliopelabs/ui@${version}, sha256:${sha}`);
  process.exit(0);
}

const version = process.argv[2];
if (!version) {
  console.error("usage: node scripts/sync-ui-tokens.mjs <@calliopelabs/ui version> | --check");
  process.exit(1);
}
const tmp = mkdtempSync(join(tmpdir(), "calliope-ui-"));
try {
  execFileSync("npm", ["pack", `@calliopelabs/ui@${version}`, "--silent"], {
    cwd: tmp,
    stdio: ["ignore", "ignore", "inherit"],
  });
  execFileSync("tar", [
    "-xzf",
    join(tmp, `calliopelabs-ui-${version}.tgz`),
    "-C",
    tmp,
    `package/${SOURCE}`,
    "package/dist/css/tokens.css",
  ]);
  const plain = readFileSync(join(tmp, `package/${SOURCE}`), "utf8");
  const tokens = readFileSync(join(tmp, "package/dist/css/tokens.css"), "utf8");
  const shared = new Map([...block(plain, ":root")].filter(([k]) => SHARED.test(k)));
  const parts = ["/* Corners, motion and type, on every ground */\n" + rule(":root", shared)];
  for (const g of CONFIG.grounds) {
    const { mode, primary, vars } = ground(plain, tokens, g);
    const label = `${mode[0].toUpperCase()}${mode.slice(1)}`;
    parts.push(`/* ${label}: ${g.ground} ground, ${CONFIG.accent} accent (${primary}) */\n` + rule(g.selector, vars, g.media));
  }
  const body = parts.join("\n");
  const sha = createHash("sha256").update(body).digest("hex");
  writeFileSync(dest, header(version, sha) + body);
  console.log(`wrote ${CONFIG.out} (@calliopelabs/ui@${version}, sha256:${sha})`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
