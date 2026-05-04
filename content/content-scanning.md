---
type: "content-scanning"
title: "Content Scanning"
description: "Detect PII, toxicity, and prompt injection before data leaves your perimeter. Block, warn, or log — you decide."
headline: "Catch It <span class=\"accent\">Before It Leaks.</span>"
cta_primary:
  label: "Read the Docs"
  link: "https://zentinelle.dev"
cta_secondary:
  label: "View on GitHub"
  link: "https://github.com/calliopeai/zentinelle"
sections:
  - layout: split-callout
    heading: "Your AI just sent a customer's"
    accent: "SSN to OpenAI"
    cards:
      - eyebrow: "The scenario"
        tone: danger
        body:
          - "It was an accident. An engineer pasted some test data. The AI helpfully included it in the response. Now it is in a third-party's logs."
          - "This is not hypothetical. It is happening right now in organizations without content controls."
      - eyebrow: "With Zentinelle"
        tone: accent
        body:
          - "Zentinelle scans every prompt and response. Detects PII before it leaves your perimeter. Catches toxicity before it reaches users. Blocks prompt injection before it compromises your agents."
        chips:
          - "PII Detection"
          - "Toxicity"
          - "Prompt Injection"
          - "Sensitive Data"
  - layout: card-grid
    eyebrow: "What gets scanned"
    heading: "Scanning that"
    accent: "fits your workflow"
    cards:
      - eyebrow: "Real-Time Scanning"
        title: "Real-Time Scanning"
        body:
          - "Every prompt and response passes through Zentinelle's content scanner. Detection happens in milliseconds with no noticeable latency for users."
          - "Scan on input, output, or both. Configure thresholds. Define what triggers action."
        tone: neutral
      - eyebrow: "Configurable Enforcement"
        title: "Configurable Enforcement"
        body:
          - "Different policies for different contexts. Stricter for production, looser for development."
        steps:
          - label: "Block"
            description: "Stop the interaction. User sees an error."
          - label: "Warn"
            description: "Allow but flag for review. User may not notice."
          - label: "Log"
            description: "Record for audit. No user impact."
        tone: accent
      - eyebrow: "Incident Response"
        title: "Incident Response"
        body:
          - "When violations occur, Zentinelle creates an incident: who, what, when, severity. Route to your existing ticketing system. Trigger Slack alerts. Feed your SIEM."
        note: "Data leaks are preventable if you are scanning."
        tone: neutral
---
