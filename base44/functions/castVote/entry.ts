import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { waitUntil } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { contestant_id, tokens, battle_id } = body || {};
    // Voter identity is always the authenticated user, never a client-supplied value.
    const voter_id = user.id;
    if (!contestant_id || !Number.isInteger(tokens) || tokens < 1) {
      return Response.json({ error: "Invalid vote request" }, { status: 400 });
    }
    const voters = await base44.asServiceRole.entities.Voter.filter({ voter_id });
    const voter = voters[0];
    if (!voter || (voter.tokens_balance || 0) < tokens) {
      return Response.json({ error: "Not enough tokens" }, { status: 402 });
    }
    const contestant = await base44.asServiceRole.entities.Contestant.get(contestant_id);
    if (!contestant) return Response.json({ error: "Contestant not found" }, { status: 404 });

    const oldCount = contestant.vote_count || 0;
    const newBalance = (voter.tokens_balance || 0) - tokens;
    const newCount = oldCount + tokens;
    const voteRecord = { contestant_id, voter_id, tokens_used: tokens };
    if (battle_id) voteRecord.battle_id = battle_id;
    await base44.asServiceRole.entities.Vote.create(voteRecord);
    await base44.asServiceRole.entities.Voter.update(voter.id, { tokens_balance: newBalance });
    await base44.asServiceRole.entities.Contestant.update(contestant_id, { vote_count: newCount });

    const oldFloor = Math.floor(oldCount / 50);
    const newFloor = Math.floor(newCount / 50);
    if (newFloor > oldFloor && contestant.user_id) {
      waitUntil(sendMilestoneEmail(base44, contestant, newFloor * 50));
    }

    return Response.json({ ok: true, tokens_balance: newBalance, vote_count: newCount });
  } catch (error) {
    console.error("castVote error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function sendMilestoneEmail(base44, contestant, milestone) {
  try {
    const user = await base44.asServiceRole.entities.User.get(contestant.user_id);
    if (!user || !user.email) return;
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: `🎉 You hit ${milestone} votes!`,
      body: `Hi ${contestant.name},\n\nCongratulations! You just reached ${milestone} total votes in the REP YUH PLACE Talent Competition.\n\nKeep sharing your profile — your fans are pushing you to the crown.\n\n— REP YUH PLACE`,
    });
  } catch (e) {
    console.error("milestone email error", e);
  }
}