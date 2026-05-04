---
type: "risk"
title: "Risk Management"
description: "Identify AI-specific threats, detect anomalies, manage incidents, and mitigate risks before they become breaches."
headline: "AI Risk <span class=\"accent\">Under Control.</span>"
cta_primary:
  label: "Read the Docs"
  link: "https://zentinelle.dev"
cta_secondary:
  label: "View on GitHub"
  link: "https://github.com/calliopeai/zentinelle"
sections:
  - layout: split-callout
    heading: "AI systems fail in ways you have"
    accent: "not imagined yet"
    cards:
      - eyebrow: "Known threats"
        tone: danger
        chips:
          - "Prompt injection"
          - "Data exfiltration"
          - "Hallucination cascades"
          - "Model drift"
          - "Cost explosions"
          - "Credential leaks"
        body:
          - "Traditional risk frameworks were not built for AI. They do not account for autonomous systems that learn, adapt, and sometimes do things nobody expected."
      - eyebrow: "Control theory for AI"
        tone: accent
        body:
          - "Zentinelle brings control theory to AI risk. Treat your AI systems like the dynamic systems they are, with observability, controllability, and feedback loops that catch problems before they cascade."
        items:
          - "**Observability** — You cannot control what you cannot see. Full telemetry on every interaction, every decision, every data access."
          - "**Controllability** — Policy gates that enforce boundaries. Rate limits. Budget caps. Model restrictions. Tool permissions."
          - "**Feedback loops** — Anomaly detection that spots drift. Alerts that trigger before thresholds breach. Auto-remediation where safe."
        note: "This is not bolted-on security. It is systems engineering applied to AI."
  - layout: card-grid
    eyebrow: "Risk capabilities"
    heading: "AI-specific risks"
    accent: "to manage"
    cards:
      - eyebrow: "Risk Register"
        title: "Risk Register"
        body:
          - "Catalog AI-specific risks. Assign owners. Track mitigation status. Map to controls. Know your exposure at all times."
      - eyebrow: "Anomaly Detection"
        title: "Anomaly Detection"
        body:
          - "Baseline normal behavior. Detect deviations."
        items:
          - "Usage spikes (token consumption, API calls)"
          - "Cost anomalies (unexpected spend patterns)"
          - "Latency changes (model performance shifts)"
          - "Error rate increases (failure patterns)"
          - "Behavioral drift (output characteristic changes)"
      - eyebrow: "Incident Management"
        title: "Incident Management"
        body:
          - "When policies are violated, Zentinelle creates incidents with full context: what happened, root cause analysis, remediation actions, SLA tracking, and post-incident review."
        note: "When things go wrong: real-time alerts fire on policy violations. Automatic responses block or quarantine. Full forensic records capture everything."
---
