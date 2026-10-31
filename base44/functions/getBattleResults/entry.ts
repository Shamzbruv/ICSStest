import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { battle_id } = body || {};
    if (!battle_id) return Response.json({ error: "battle_id required" }, { status: 400 });

    const [votes, scores, comments, users] = await Promise.all([
      base44.asServiceRole.entities.Vote.filter({ battle_id }),
      base44.asServiceRole.entities.BattleScore.filter({ battle_id }),
      base44.asServiceRole.entities.JudgeComment.filter({ battle_id }),
      base44.asServiceRole.entities.User.list(),
    ]);

    const voteCounts = {};
    votes.forEach((v) => {
      const cid = v.contestant_id;
      voteCounts[cid] = (voteCounts[cid] || 0) + (v.tokens_used || 0);
    });

    // Aggregate each judge's scores per contestant, then average per category.
    const agg = {};
    scores.forEach((s) => {
      const cid = s.contestant_id;
      if (!agg[cid]) agg[cid] = { performance: 0, attire: 0, crowd_engagement: 0, count: 0 };
      agg[cid].performance += s.performance || 0;
      agg[cid].attire += s.attire || 0;
      agg[cid].crowd_engagement += s.crowd_engagement || 0;
      agg[cid].count += 1;
    });

    const round1 = (n) => Math.round(n * 10) / 10;
    const scoreMap = {};
    Object.entries(agg).forEach(([cid, a]) => {
      const n = a.count || 1;
      const performance = round1(a.performance / n);
      const attire = round1(a.attire / n);
      const crowd_engagement = round1(a.crowd_engagement / n);
      scoreMap[cid] = {
        performance,
        attire,
        crowd_engagement,
        total: round1(performance + attire + crowd_engagement),
        judges: a.count,
      };
    });

    // Winner is decided by total judge points (max 75), not fan votes.
    let winner_id = null;
    let topPoints = -1;
    let tie = false;
    Object.entries(scoreMap).forEach(([cid, info]) => {
      if (info.total > topPoints) { topPoints = info.total; winner_id = cid; tie = false; }
      else if (info.total === topPoints) { tie = true; }
    });

    const judgeName = Object.fromEntries(
      users.map((u) => [u.id, u.full_name || "Judge"])
    );
    const commentList = comments.map((c) => ({
      judge_id: c.judge_id,
      judge_name: judgeName[c.judge_id] || "Judge",
      text: c.text,
    }));

    return Response.json({ votes: voteCounts, scores: scoreMap, comments: commentList, winner_id: tie ? null : winner_id, tie });
  } catch (error) {
    console.error("getBattleResults error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}