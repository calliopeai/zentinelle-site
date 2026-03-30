---
title: "Policy Management"
description: "Define what AI can and can't do across your organization. 18+ policy types with inheritance from org to user level."
headline: "Policy-Based <span class=\"accent\">AI Control.</span>"
cta_primary:
  label: "Read the Docs"
  link: "https://zentinelle.dev"
cta_secondary:
  label: "View on GitHub"
  link: "https://github.com/calliopeai/zentinelle"
---

## The problem with AI governance today

Your security team says no to AI. Your engineers say they need it. The result is shadow AI that nobody controls.

**Zentinelle policies let you say yes with guardrails.** Define what is allowed, what is limited, and what is blocked. Set org-wide defaults, let teams customize within bounds, and give specific users the access they need.

---

## Policy types

<div class="cards">
<div class="card"><div class="card-title">Rate Limits</div><div class="card-desc">Requests per minute, hour, day — per user, team, or org.</div></div>
<div class="card"><div class="card-title">Budget Caps</div><div class="card-desc">Monthly spend limits with alerts and hard stops.</div></div>
<div class="card"><div class="card-title">Model Restrictions</div><div class="card-desc">Allowlist or blocklist specific models per team or role.</div></div>
<div class="card"><div class="card-title">Tool Permissions</div><div class="card-desc">Which agents can access which APIs, databases, filesystems.</div></div>
<div class="card"><div class="card-title">Content Filters</div><div class="card-desc">Block PII, toxicity, and prompt injection attempts.</div></div>
<div class="card"><div class="card-title">Data Access Controls</div><div class="card-desc">Row-level, column-level, and database-level restrictions.</div></div>
</div>

---

## How the inheritance model works

Policies cascade through five levels: **Organization → Team → Deployment → Endpoint → User**

Set org-wide defaults. Let teams tighten or (with permission) loosen. Grant specific users elevated access. The most specific policy wins.

No manual per-user configuration. No policy sprawl. No gaps.

## Real-time evaluation

Agents call the `/evaluate` endpoint before taking action. Zentinelle resolves the effective policy in milliseconds.

Allow, block, or warn — you choose the enforcement model. Blocked actions are logged. Warnings are surfaced. Everything is auditable.

## Policy versioning

Every policy change is versioned. See who changed what, when. Roll back if needed.

Git-like version control for your AI governance. Because "who approved that?" should have an answer.

<div class="callout"><p><strong>Open source.</strong> All policy logic is open and auditable. No black boxes. <a href="https://github.com/calliopeai/zentinelle">Read the source on GitHub.</a></p></div>
