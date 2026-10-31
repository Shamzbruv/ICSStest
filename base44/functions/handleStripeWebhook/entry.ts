import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from "base44:runtime";

async function verifyStripeSignature(body, sigHeader, secret) {
  const parts = sigHeader.split(",").map((p) => p.trim());
  const t = parts.find((p) => p.startsWith("t="))?.slice(2);
  const v1 = parts.find((p) => p.startsWith("v1="))?.slice(3);
  if (!t || !v1) return null;
  const payload = `${t}.${body}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const hex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === v1 ? parseInt(t, 10) : null;
}

export default async function(req) {
  try {
    const body = await req.text();
    const sig = req.headers.get("Stripe-Signature");
    const secret = secrets.get("STRIPE_WEBHOOK_SECRET");
    if (!sig || !secret) {
      return Response.json({ error: "missing signature or secret" }, { status: 400 });
    }
    const ts = await verifyStripeSignature(body, sig, secret);
    if (!ts) return Response.json({ error: "invalid signature" }, { status: 400 });

    const event = JSON.parse(body);
    const base44 = createClientFromRequest(req);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const voter_id = session.metadata?.voter_id;
      const tokens = parseInt(session.metadata?.tokens || "0", 10);
      const package_id = session.metadata?.package_id || "";
      if (voter_id && tokens > 0) {
        const voters = await base44.asServiceRole.entities.Voter.filter({ voter_id });
        const voter = voters[0];
        if (voter) {
          await base44.asServiceRole.entities.Voter.update(voter.id, {
            tokens_balance: (voter.tokens_balance || 0) + tokens,
          });
        }
        await base44.asServiceRole.entities.TokenPurchase.create({
          voter_id,
          package_id,
          tokens,
          amount_usd: (session.amount_total || 0) / 100,
          stripe_session_id: session.id,
          status: "completed",
        });
      }
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error("handleStripeWebhook error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}