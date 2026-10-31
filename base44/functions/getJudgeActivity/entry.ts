import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

    const [battles, scores, judges] = await Promise.all([
      base44.asServiceRole.entities.Battle.list(),
      base44.asServiceRole.entities.BattleScore.list("-updated_date", 1000),
      base44.asServiceRole.entities.User.filter({ role: 'judge' }),
    ]);

    const activeBattles = (battles || []).filter((b) => b.status === 'active');

    const byBattle = {};
    (scores || []).forEach((s) => {
      if (!s.battle_id || !s.judge_id) return;
      if (!byBattle[s.battle_id]) byBattle[s.battle_id] = {};
      const entry = byBattle[s.battle_id][s.judge_id] || { count: 0, last: null };
      entry.count += 1;
      if (!entry.last || new Date(s.updated_date) > new Date(entry.last)) entry.last = s.updated_date;
      byBattle[s.battle_id][s.judge_id] = entry;
    });

    const judgeList = (judges || []).map((j) => ({
      id: j.id,
      name: j.full_name || j.email || 'Judge',
      email: j.email || null,
    }));

    const activity = activeBattles.map((b) => {
      const submittedMap = byBattle[b.id] || {};
      const judgeStates = judgeList.map((j) => {
        const e = submittedMap[j.id];
        return {
          id: j.id,
          name: j.name,
          email: j.email,
          submitted: !!e,
          score_count: e ? e.count : 0,
          last_updated: e ? e.last : null,
        };
      });
      const submittedCount = judgeStates.filter((j) => j.submitted).length;
      return {
        battle_id: b.id,
        title: b.title,
        subtitle: b.subtitle || null,
        contestant_count: (b.contestant_ids || []).length,
        submitted_count: submittedCount,
        judge_count: judgeList.length,
        judges: judgeStates,
      };
    });

    return Response.json({ activity });
  } catch (error) {
    console.error('getJudgeActivity error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}