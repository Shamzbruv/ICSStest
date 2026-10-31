import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role === 'admin') {
      return Response.json({ error: 'Admin accounts cannot be deleted from the app.' }, { status: 403 });
    }

    const claimed = await base44.asServiceRole.entities.Contestant.filter({ user_id: user.id });
    for (const c of claimed) {
      await base44.asServiceRole.entities.Contestant.update(c.id, { user_id: '' });
    }

    const profiles = await base44.asServiceRole.entities.JudgeProfile.filter({ user_id: user.id });
    for (const p of profiles) {
      await base44.asServiceRole.entities.JudgeProfile.delete(p.id);
    }

    // Only the caller's own voter record (voter_id === user.id) is ever deleted.
    const voters = await base44.asServiceRole.entities.Voter.filter({ voter_id: user.id });
    for (const v of voters) {
      await base44.asServiceRole.entities.Voter.delete(v.id);
    }

    await base44.asServiceRole.entities.User.delete(user.id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('deleteAccount failed', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}