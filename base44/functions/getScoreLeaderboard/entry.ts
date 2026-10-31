import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const [scores, contestants] = await Promise.all([
      base44.asServiceRole.entities.BattleScore.list("-created_date", 1000),
      base44.asServiceRole.entities.Contestant.list(),
    ]);

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

    const round1 = (n) => Math.round(n * 10) / 10;
    const byId = Object.fromEntries(contestants.map((c) => [c.id, c]));

    const leaderboard = Object.entries(agg)
      .map(([cid, a]) => {
        const n = a.count || 1;
        const performance = round1(a.performance / n);
        const attire = round1(a.attire / n);
        const crowd_engagement = round1(a.crowd_engagement / n);
        const c = byId[cid] || {};
        return {
          contestant_id: cid,
          name: c.name || "Unknown",
          parish: c.parish || null,
          image_url: c.image_url || null,
          status: c.status || null,
          avg_performance: performance,
          avg_attire: attire,
          avg_crowd_engagement: crowd_engagement,
          avg_total: round1(performance + attire + crowd_engagement),
          judges: a.count,
        };
      })
      .sort((a, b) => b.avg_total - a.avg_total);

    return Response.json({ leaderboard });
  } catch (error) {
    console.error("getScoreLeaderboard error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}