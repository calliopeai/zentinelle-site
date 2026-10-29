---
type: governance
title: Policy Management
description: Define what AI can and can't do across your organization. 18+ policy types with inheritance from org to user level.
headline: Policy-Based <span class="accent">AI Control.</span>
cta_primary:
  label: Read the Docs
  link: https://zentinelle.dev
cta_secondary:
  label: View on GitHub
  link: https://github.com/calliopeai/zentinelle
sections:
- layout: split-callout
  heading: The problem with AI governance
  accent: today
  cards:
  - eyebrow: The reality
    tone: danger
    body:
    - Teams need an approved way to connect agents to models, tools and data. Policy must be enforced at the integration points those agents use.
  - eyebrow: The Zentinelle approach
    tone: accent
    body:
    - Zentinelle policies let you say yes with guardrails. Define what is allowed, what is limited, and what is blocked. Set org-wide defaults, let teams customize within bounds, and give specific users the access they need.
- layout: card-grid
  eyebrow: Policy types
  heading: Built for how real
  accent: organisations work
  cards:
  - eyebrow: Inheritance
    title: How the inheritance model works
    body:
    - 'Policies cascade through five levels: **Organization -> Team -> Deployment -> Endpoint -> User**'
    - Set org-wide defaults. Let teams tighten or (with permission) loosen. Grant specific users elevated access. The most specific policy wins.
    - Review inherited policy and any overrides before enabling an agent.
    steps:
    - label: Organization
      description: Global defaults for all agents
    - label: Team
      description: Tighten or loosen within org bounds
    - label: Deployment
      description: Per-product overrides
    - label: Endpoint
      description: Single agent configuration
    - label: User
      description: Individual access grants
  - eyebrow: Evaluation
    title: Real-time evaluation
    body:
    - Agents call the `/evaluate` endpoint before taking action. Zentinelle resolves the effective policy for the request.
    - Configure allow, block or warn behavior at the connected enforcement point, and record policy decisions for review.
  - eyebrow: Versioning
    title: Policy versioning
    body:
    - Every policy change is versioned. See who changed what, when. Roll back if needed.
    - Git-like version control for your AI governance. Because "who approved that?" should have an answer.
    note: Open source. All policy logic is open and auditable. No black boxes.
---
