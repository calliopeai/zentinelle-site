---
type: "observability"
title: "Observability"
description: "Full audit trail for every AI interaction. Every prompt, response, and policy decision logged, retained, and queryable."
headline: "Every Action. <span class=\"accent\">Logged.</span>"
cta_primary:
  label: "Read the Docs"
  link: "https://zentinelle.dev"
cta_secondary:
  label: "View on GitHub"
  link: "https://github.com/calliopeai/zentinelle"
sections:
  - layout: split-callout
    heading: "When something goes wrong,"
    accent: "\"I don't know\" is not acceptable"
    cards:
      - eyebrow: "Without observability"
        tone: danger
        body:
          - "AI made a decision. Data was accessed. A response was generated. Now you need to explain what happened."
          - "Without an audit trail, you are guessing."
      - eyebrow: "With Zentinelle"
        tone: accent
        body:
          - "With Zentinelle, you have the answer."
          - "Timestamped, attributed, and queryable. Retained as long as your compliance requirements demand."
        chips:
          - "Every prompt"
          - "Every response"
          - "Every policy evaluation"
          - "Every data access"
  - layout: card-grid
    eyebrow: "What gets logged"
    heading: "How it"
    accent: "works"
    cards:
      - eyebrow: "Pipeline"
        title: "Structured Event Pipeline"
        body:
          - "Events flow through a structured pipeline: telemetry (high-volume, aggregated), audit (durable, ordered), and alerts (priority, violations)."
          - "Different retention policies for different event types. Cold storage for long-term compliance. Hot storage for real-time queries."
        steps:
          - label: "Telemetry"
            description: "High-volume, aggregated"
          - label: "Audit"
            description: "Durable, ordered"
          - label: "Alerts"
            description: "Priority violations"
      - eyebrow: "SIEM Integration"
        title: "SIEM Integration"
        body:
          - "Feed events to your existing security stack. Splunk. Datadog. Elastic. Your SOC sees AI events alongside everything else."
          - "Standard formats. Webhook delivery. Real-time streaming."
      - eyebrow: "Dashboards"
        title: "Dashboards and Alerts"
        body:
          - "Real-time dashboards show usage patterns, policy violations, and anomalies."
          - "Alert on thresholds. Catch unusual behavior. Respond before incidents escalate."
        note: "Observability is not optional."
---
