---
title: "Observability"
description: "Full audit trail for every AI interaction. Every prompt, response, and policy decision logged, retained, and queryable."
headline: "Every Action. <span class=\"accent\">Logged.</span>"
cta_primary:
  label: "Read the Docs"
  link: "https://zentinelle.dev"
cta_secondary:
  label: "View on GitHub"
  link: "https://github.com/calliopeai/zentinelle"
---

## When something goes wrong, "I don't know" is not acceptable

AI made a decision. Data was accessed. A response was generated. Now you need to explain what happened.

Without an audit trail, you are guessing. With Zentinelle, you have the answer.

Every prompt. Every response. Every policy evaluation. Every data access. Timestamped, attributed, and queryable. Retained as long as your compliance requirements demand.

---

## What gets logged

<div class="cards">
<div class="card"><div class="card-title">Interactions</div><div class="card-desc">Every prompt and response, with user attribution and model information.</div></div>
<div class="card"><div class="card-title">Policy Decisions</div><div class="card-desc">Every allow, block, and warning with the reason and policy that triggered it.</div></div>
<div class="card"><div class="card-title">Data Access</div><div class="card-desc">Every database query, API call, and file read made by an agent.</div></div>
<div class="card"><div class="card-title">Secrets Access</div><div class="card-desc">Every credential request with full request context.</div></div>
<div class="card"><div class="card-title">Configuration Changes</div><div class="card-desc">Every policy update with author, timestamp, and diff.</div></div>
<div class="card"><div class="card-title">Content Violations</div><div class="card-desc">Every PII detection, toxicity flag, and injection attempt.</div></div>
</div>

---

## How it works

### Structured Event Pipeline

Events flow through a structured pipeline: telemetry (high-volume, aggregated), audit (durable, ordered), and alerts (priority, violations).

Different retention policies for different event types. Cold storage for long-term compliance. Hot storage for real-time queries.

### SIEM Integration

Feed events to your existing security stack. Splunk. Datadog. Elastic. Your SOC sees AI events alongside everything else.

Standard formats. Webhook delivery. Real-time streaming.

### Dashboards and Alerts

Real-time dashboards show usage patterns, policy violations, and anomalies.

Alert on thresholds. Catch unusual behavior. Respond before incidents escalate.

<div class="callout"><p><strong>Observability is not optional.</strong> Zentinelle gives you the audit infrastructure your compliance team requires and the visibility your security team demands.</p></div>
