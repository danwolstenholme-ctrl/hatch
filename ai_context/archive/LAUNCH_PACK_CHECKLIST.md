# Launch Pack: Stripe + Product Checklist

- Price ID: Create one-time $199 (USD) price → set `STRIPE_LAUNCH_PACK_PRICE_ID` in env (test + prod).
- Product copy: “One-time launch bundle: brand-ready hero copy, CTA polish, launch checklist, delivered via account email.”
- Statement descriptor (optional): “HATCH LAUNCHPACK”.
- Success/cancel URLs: Success `/post-payment?launch_pack=success`, Cancel `/post-payment?launch_pack=cancelled`.
- Webhook note: On `checkout.session.completed` with `metadata.type=launch_pack`, attach deliverables to the Clerk user (`metadata.userId`).
- UI surface: Upsell on post-payment hub; access requires active subscription.
- Validation: Ensure `STRIPE_SECRET_KEY` present; keep `NEXT_PUBLIC_APP_URL` current for redirects.
