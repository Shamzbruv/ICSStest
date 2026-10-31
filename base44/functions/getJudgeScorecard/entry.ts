import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'judge' && user.role !== 'admin') {
      return Response.json({ error: 'Judges and admins only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const battle_id = (body.battle_id || '').toString().trim();
    if (!battle_id) return Response.json({ error: 'battle_id is required' }, { status: 400 });

    const [scores, comments, users] = await Promise.all([
      base44.asServiceRole.entities.BattleScore.filter({ battle_id }),
      base44.asServiceRole.entities.JudgeComment.filter({ battle_id }),
      base44.asServiceRole.entities.User.list(),
    ]);

    const userById = {};
    for (const u of users || []) userById[u.id] = u;
    const judgeName = (id) => userById[id]?.full_name || userById[id]?.email || 'Judge';

    return Response.json({
      battle_id,
      scores: (scores || []).map((s) => ({
        id: s.id,
        judge_id: s.judge_id,
        judge_name: judgeName(s.judge_id),
        contestant_id: s.contestant_id,
        performance: s.performance || 0,
        attire: s.attire || 0,
        crowd_engagement: s.crowd_engagement || 0,
      })),
      comments: (comments || []).map((c) => ({
        id: c.id,
        judge_id: c.judge_id,
        judge_name: judgeName(c.judge_id),
        text: c.text,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}