---
type: risk
title: Risk Management
description: Identify AI-specific threats, detect anomalies, manage incidents, and mitigate risks before they become breaches.
headline: AI risk <span class="accent">management</span>
cta_primary:
  label: Read the Docs
  link: https://zentinelle.dev
cta_secondary:
  label: View on GitHub
  link: https://github.com/calliopeai/zentinelle
sections:
- layout: split-callout
  heading: Identify and track
  accent: agent risks
  cards:
  - eyebrow: Known threats
    tone: danger
    chips:
    - Prompt injection
    - Data exfiltration
    - Hallucination cascades
    - Model drift
    - Cost explosions
    - Credential leaks
    body:
    - Agent workflows introduce risks around model output, tool permissions, data access and cost. Include them in your existing risk assessment.
  - eyebrow: Control theory for AI
    tone: accent
    body:
    - Zentinelle brings control theory to AI risk. Treat your AI systems like the dynamic systems they are, with observability, controllability, and feedback loops that catch problems before they cascade.
    items:
    - '**Observability** — You cannot control what you cannot see. Telemetry from connected agents and configured event sources.'
    - '**Controllability** — Policy gates that enforce boundaries. Rate limits. Budget caps. Model restrictions. Tool permissions.'
    - '**Feedback loops** — Anomaly detection that spots drift. Alerts that trigger before thresholds breach. Auto-remediation where safe.'
    note: Review observation, enforcement and response together for each agent workflow.
- layout: card-grid
  eyebrow: Risk capabilities
  heading: AI-specific risks
  accent: to manage
  cards:
  - eyebrow: Risk Register
    title: Risk Register
    body:
    - Catalog AI-specific risks. Assign owners. Track mitigation status. Map to controls. Review ownership, evidence and open mitigations.
  - eyebrow: Anomaly Detection
    title: Anomaly Detection
    body:
    - Baseline normal behavior. Detect deviations.
    items:
    - Usage spikes (token consumption, API calls)
    - Cost anomalies (unexpected spend patterns)
    - Latency changes (model performance shifts)
    - Error rate increases (failure patterns)
    - Behavioral drift (output characteristic changes)
  - eyebrow: Incident Management
    title: Incident Management
    body:
    - 'When policies are violated, Zentinelle creates incidents with full context: what happened, root cause analysis, remediation actions, SLA tracking, and post-incident review.'
    note: Configure policy alerts and supported responses. Verify that retained events cover the activity needed for incident review.
---
