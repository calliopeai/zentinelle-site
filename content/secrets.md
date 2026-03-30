---
title: "Secrets Management"
description: "Centralized API key management for AI providers. No keys in code, automatic rotation, scoped access, full audit trail."
headline: "No API Keys <span class=\"accent\">In Code. Ever.</span>"
cta_primary:
  label: "Read the Docs"
  link: "https://zentinelle.dev"
cta_secondary:
  label: "View on GitHub"
  link: "https://github.com/calliopeai/zentinelle"
---

## Right now, your OpenAI key is in 47 places

Environment variables. Config files. Slack messages. That one engineer's `.bashrc`. Maybe even committed to git.

When that key leaks — and it will — you have no idea what accessed it, what data it touched, or how to rotate it without breaking everything.

Zentinelle centralizes secrets management for AI. Store keys once. Grant scoped access. Rotate automatically. Know exactly who used what, when.

---

## Secrets Zentinelle manages

<div class="cards">
<div class="card"><div class="card-title">AI Provider Keys</div><div class="card-desc">OpenAI, Anthropic, Google, Cohere, Mistral, and more.</div></div>
<div class="card"><div class="card-title">Database Credentials</div><div class="card-desc">Connection strings for SQL, NoSQL, and vector stores.</div></div>
<div class="card"><div class="card-title">API Tokens</div><div class="card-desc">Internal and external API authentication tokens.</div></div>
<div class="card"><div class="card-title">Service Accounts</div><div class="card-desc">Cloud provider credentials for AWS, GCP, and Azure.</div></div>
<div class="card"><div class="card-title">Custom Secrets</div><div class="card-desc">Any key-value pair your agents need at runtime.</div></div>
</div>

---

## How it works

### Centralized Storage

Secrets stored in AWS Secrets Manager or your vault of choice. Encrypted at rest and in transit.

Agents request secrets through Zentinelle. Keys are never exposed in logs, environment variables, or code. Access is scoped by policy.

### Automatic Rotation

Schedule rotation. Get notified before expiry. Rotate on-demand when keys are compromised.

Rotation happens without breaking running agents. No manual updates. No downtime.

### Full Audit Trail

Every secret access is logged. Who requested it. When. From where. For what purpose.

When your security team asks "who has access to production credentials?" — you have the answer.

<div class="callout"><p><strong>Credentials should be managed, not scattered.</strong> Zentinelle gives you the secrets management your AI infrastructure needs, without building it yourself.</p></div>
