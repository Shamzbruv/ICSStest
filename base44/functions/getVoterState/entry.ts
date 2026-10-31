import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    // Voter record is bound to the authenticated user.
    const voter_id = user.id;
    const existing = await base44.asServiceRole.entities.Voter.filter({ voter_id });
    let voter = existing[0];
    if (!voter) {
      voter = await base44.asServiceRole.entities.Voter.create({ voter_id, tokens_balance: 0 });
    }
    return Response.json({ voter_id: voter.voter_id, tokens_balance: voter.tokens_balance || 0 });
  } catch (error) {
    console.error("getVoterState error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}