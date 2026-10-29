---
type: content-scanning
title: Content Scanning
description: Scan connected prompts and responses for sensitive content and configured risk signals. Choose block, warn or log behavior.
headline: Scan content at <span class="accent">policy boundaries</span>
cta_primary:
  label: Read the Docs
  link: https://zentinelle.dev
cta_secondary:
  label: View on GitHub
  link: https://github.com/calliopeai/zentinelle
sections:
- layout: split-callout
  heading: Review sensitive content
  accent: before model requests
  cards:
  - eyebrow: The scenario
    tone: danger
    body:
    - It was an accident. An engineer pasted some test data. The AI helpfully included it in the response. Now it is in a third-party's logs.
    - Review the content and destination of model requests before enabling the workflow.
  - eyebrow: With Zentinelle
    tone: accent
    body:
    - Zentinelle AI scans prompts and responses routed through configured integrations. Detection and enforcement depend on enabled policies and scanner coverage; no detector catches every sensitive value or attack.
    chips:
    - PII Detection
    - Toxicity
    - Prompt Injection
    - Sensitive Data
- layout: card-grid
  eyebrow: What gets scanned
  heading: Scanning that
  accent: fits your workflow
  cards:
  - eyebrow: Real-Time Scanning
    title: Real-Time Scanning
    body:
    - Configure scanning on the request and response paths that need it. Measure latency and detection behavior with representative workloads.
    - Scan on input, output, or both. Configure thresholds. Define what triggers action.
    tone: neutral
  - eyebrow: Configurable Enforcement
    title: Configurable Enforcement
    body:
    - Different policies for different contexts. Stricter for production, looser for development.
    steps:
    - label: Block
      description: Stop the interaction. User sees an error.
    - label: Warn
      description: Allow but flag for review. User may not notice.
    - label: Log
      description: Record for audit. No user impact.
    tone: accent
  - eyebrow: Incident Response
    title: Incident Response
    body:
    - 'When violations occur, Zentinelle creates an incident: who, what, when, severity. Route to your existing ticketing system. Trigger Slack alerts. Feed your SIEM.'
    note: Combine scanning with model-destination policy, access controls and review.
    tone: neutral
---
