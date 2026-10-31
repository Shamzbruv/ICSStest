import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const round1 = (n) => Math.round(n * 10) / 10;

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const battleId = body?.battle_id;
    if (!battleId) return Response.json({ error: 'battle_id is required' }, { status: 400 });

    const admin = base44.asServiceRole;

    const [battle, scores, votes, contestants] = await Promise.all([
      admin.entities.Battle.get(battleId),
      admin.entities.BattleScore.filter({ battle_id: battleId }),
      admin.entities.Vote.filter({ battle_id: battleId }),
      admin.entities.Contestant.list(),
    ]);

    const byId = Object.fromEntries(contestants.map((c) => [c.id, c]));

    // Aggregate judge scores per contestant.
    const agg = {};
    scores.forEach((s) => {
      const cid = s.contestant_id;
      if (!cid) return;
      if (!agg[cid]) agg[cid] = { performance: 0, attire: 0, crowd_engagement: 0, count: 0 };
      agg[cid].performance += s.performance || 0;
      agg[cid].attire += s.attire || 0;
      agg[cid].crowd_engagement += s.crowd_engagement || 0;
      agg[cid].count += 1;
    });

    // Aggregate fan votes per contestant.
    const voteAgg = {};
    votes.forEach((v) => {
      const cid = v.contestant_id;
      if (!cid) return;
      voteAgg[cid] = (voteAgg[cid] || 0) + (v.tokens_used || 1);
    });

    // Determine judge-score winner.
    let best = null;
    let top = -1;
    let tie = false;
    Object.entries(agg).forEach(([cid, a]) => {
      const n = a.count || 1;
      const performance = round1(a.performance / n);
      const attire = round1(a.attire / n);
      const crowd_engagement = round1(a.crowd_engagement / n);
      const total = round1(performance + attire + crowd_engagement);
      if (total > top) { top = total; best = { contestant_id: cid, performance, attire, crowd_engagement, total, judges: a.count }; tie = false; }
      else if (total === top) { tie = true; }
    });

    if (!best) {
      return Response.json({ error: 'No judge scores recorded for this battle yet' }, { status: 400 });
    }
    if (tie) {
      return Response.json({ error: 'Battle is tied on judge scores; resolve before concluding' }, { status: 409 });
    }

    const winner = byId[best.contestant_id] || {};

    // Close the battle.
    await admin.entities.Battle.update(battleId, { status: 'closed' });

    // Replace any existing highlight for this battle.
    await admin.entities.CompetitionHighlight.deleteMany({ battle_id: battleId });
    const highlight = await admin.entities.CompetitionHighlight.create({
      battle_id: battleId,
      battle_title: battle.title || 'Battle',
      winner_id: best.contestant_id,
      winner_name: winner.name || 'Unknown',
      winner_parish: winner.parish || null,
      winner_image_url: winner.image_url || null,
      avg_performance: best.performance,
      avg_attire: best.attire,
      avg_crowd_engagement: best.crowd_engagement,
      avg_total: best.total,
      judges: best.judges,
      fan_votes: voteAgg[best.contestant_id] || 0,
    });

    return Response.json({ ok: true, highlight });
  } catch (error) {
    console.error('finalizeBattle error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}