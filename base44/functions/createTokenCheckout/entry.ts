import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from "base44:runtime";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { package_id } = body || {};
    const voter_id = user.id;
    if (!package_id) {
      return Response.json({ error: "Missing package_id" }, { status: 400 });
    }
    const pkg = await base44.asServiceRole.entities.TokenPackage.get(package_id);
    if (!pkg) return Response.json({ error: "Package not found" }, { status: 404 });

    const totalTokens = (pkg.tokens || 0) + (pkg.bonus_tokens || 0);
    const amount = Math.round((pkg.price_usd || 0) * 100);
    // Only redirect back to Base44-hosted app origins; never trust an arbitrary Origin header.
    const fallbackOrigin = new URL(req.url).origin;
    let origin = fallbackOrigin;
    try {
      const o = new URL(req.headers.get("origin") || "");
      if (o.protocol === "https:" && (o.hostname === "base44.app" || o.hostname.endsWith(".base44.app"))) {
        origin = o.origin;
      }
    } catch (_) { /* use fallback */ }

    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("payment_method_types[0]", "card");
    params.append("line_items[0][quantity]", "1");
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][unit_amount]", String(amount));
    params.append("line_items[0][price_data][product_data][name]", `${pkg.name} — ${totalTokens} tokens`);
    if (pkg.description) params.append("line_items[0][price_data][product_data][description]", pkg.description);
    const successUrl = new URL(`${origin}/tokens`);
    successUrl.searchParams.set("status", "success");
    successUrl.searchParams.set("tokens", String(totalTokens));
    successUrl.searchParams.set("name", pkg.name || "");
    params.append("success_url", successUrl.toString());
    params.append("cancel_url", `${origin}/tokens?status=cancel`);
    params.append("metadata[base44_app_id]", Deno.env.get("BASE44_APP_ID"));
    params.append("metadata[voter_id]", voter_id);
    params.append("metadata[package_id]", package_id);
    params.append("metadata[tokens]", String(totalTokens));

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secrets.get("STRIPE_SECRET_KEY")}`,
        "Stripe-Version": "2025-10-29.clover",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: params,
    });
    const session = await res.json();
    if (!res.ok) {
      console.error("Stripe checkout error", session);
      return Response.json({ error: session?.error?.message || "Stripe error" }, { status: 400 });
    }
    return Response.json({ checkout_url: session.url, session_id: session.id });
  } catch (error) {
    console.error("createTokenCheckout error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}