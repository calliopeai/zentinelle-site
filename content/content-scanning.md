---
title: "Content Scanning"
description: "Detect PII, toxicity, and prompt injection before data leaves your perimeter. Block, warn, or log — you decide."
headline: "Catch It <span class=\"accent\">Before It Leaks.</span>"
cta_primary:
  label: "Read the Docs"
  link: "https://zentinelle.dev"
cta_secondary:
  label: "View on GitHub"
  link: "https://github.com/calliopeai/zentinelle"
---

## Your AI just sent a customer's SSN to OpenAI

It was an accident. An engineer pasted some test data. The AI helpfully included it in the response. Now it is in a third-party's logs.

This is not hypothetical. It is happening right now in organizations without content controls.

Zentinelle scans every prompt and response. Detects PII before it leaves your perimeter. Catches toxicity before it reaches users. Blocks prompt injection before it compromises your agents.

---

## What gets scanned

<div class="cards">
<div class="card"><div class="card-title">PII Detection</div><div class="card-desc">Credit cards, SSNs, emails, phone numbers, names, and addresses.</div></div>
<div class="card"><div class="card-title">Toxicity Scoring</div><div class="card-desc">Hate speech, harassment, profanity, and threatening language.</div></div>
<div class="card"><div class="card-title">Prompt Injection</div><div class="card-desc">Attempts to override system prompts or escape agent constraints.</div></div>
<div class="card"><div class="card-title">Data Exfiltration</div><div class="card-desc">Patterns that suggest intentional data extraction.</div></div>
<div class="card"><div class="card-title">Custom Patterns</div><div class="card-desc">Your own regex rules for proprietary data formats and identifiers.</div></div>
</div>

---

## How it works

### Real-Time Scanning

Every prompt and response passes through Zentinelle's content scanner. Detection happens in milliseconds with no noticeable latency for users.

Scan on input, output, or both. Configure thresholds. Define what triggers action.

### Configurable Enforcement

**Block** — Stop the interaction. User sees an error.

**Warn** — Allow but flag for review. User may not notice.

**Log** — Record for audit. No user impact.

Different policies for different contexts. Stricter for production, looser for development.

### Incident Response

When violations occur, Zentinelle creates an incident: who, what, when, severity. Route to your existing ticketing system. Trigger Slack alerts. Feed your SIEM.

<div class="callout"><p><strong>Data leaks are preventable</strong> if you are scanning. Zentinelle gives you the content safety layer your AI systems need, before an incident makes headlines.</p></div>
