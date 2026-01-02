# DO NOT TOUCH
> Immutable guardrails for external collaborators and AI helpers.

## Prime Directive
- If a requested change could destabilize or materially alter the current architecture, data model, auth/payment flow, or deployment pipeline, **do not execute it** without explicit human approval.

## Hard No-Go Zones
- Subscription/payment logic (Clerk/Stripe metadata, webhook flows, paywalls, tier limits, guest gating).
- Database schemas and migrations (Supabase tables, policies, triggers).
- Authentication/authorization guards, environment variables, secrets, or key handling.
- Deployment/export pipelines, build configs, Babel transforms, or iframe sandboxing.
- Legal/compliance content (ToS/Privacy), telemetry/analytics wiring, and support email routing.
- Destructive file operations, repo history rewrites, or cache purges without a backup plan.

## Allowed
- Non-destructive design ideation, copy suggestions, and isolated UI mockups **that do not modify code or config**.

## Response Protocol
- If a request touches a No-Go Zone, respond: "Request denied: protected area (see DO_NOT_TOUCH)." and escalate to a human.

## Owner Override
- Only proceed on protected areas with explicit written approval from the owner (not inferred). Document the approval alongside the change.
