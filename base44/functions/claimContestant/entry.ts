import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const contestantId = body?.contestant_id;
    if (!contestantId) return Response.json({ error: 'Contestant ID required' }, { status: 400 });

    const contestant = await base44.asServiceRole.entities.Contestant.get(contestantId);
    if (!contestant) return Response.json({ error: 'Contestant not found' }, { status: 404 });
    if (contestant.user_id) return Response.json({ error: 'This contestant has already been claimed' }, { status: 409 });

    const existing = await base44.asServiceRole.entities.Contestant.filter({ user_id: user.id });
    if (existing.length > 0) return Response.json({ error: 'You have already claimed a contestant' }, { status: 409 });

    const updated = await base44.asServiceRole.entities.Contestant.update(contestantId, { user_id: user.id });
    return Response.json({ contestant: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}