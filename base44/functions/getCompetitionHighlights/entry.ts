import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const [highlights, contestants] = await Promise.all([
      base44.asServiceRole.entities.CompetitionHighlight.list("-created_date", 50),
      base44.asServiceRole.entities.Contestant.list(),
    ]);

    const byId = Object.fromEntries(contestants.map((c) => [c.id, c]));

    const out = highlights.map((h) => {
      // Refresh contestant fields from the live record when available.
      const c = byId[h.winner_id] || {};
      return {
        battle_id: h.battle_id,
        battle_title: h.battle_title,
        battle_status: 'closed',
        created_date: h.created_date,
        winner: {
          contestant_id: h.winner_id,
          name: c.name || h.winner_name || 'Unknown',
          parish: c.parish || h.winner_parish || null,
          image_url: c.image_url || h.winner_image_url || null,
          avg_performance: h.avg_performance,
          avg_attire: h.avg_attire,
          avg_crowd_engagement: h.avg_crowd_engagement,
          avg_total: h.avg_total,
          judges: h.judges,
          fan_votes: h.fan_votes,
        },
      };
    });

    return Response.json({ highlights: out });
  } catch (error) {
    console.error("getCompetitionHighlights error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}