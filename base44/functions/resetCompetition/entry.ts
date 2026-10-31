import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const mode = body?.mode === 'full' ? 'full' : 'votes';

    const admin = base44.asServiceRole;

    // Snapshot the current finalized highlights into a season archive before clearing.
    const [highlights, votes] = await Promise.all([
      admin.entities.CompetitionHighlight.list("-created_date", 200),
      admin.entities.Vote.list("-created_date", 5000),
    ]);
    const totalVotes = votes.reduce((s, v) => s + (v.tokens_used || 1), 0);
    const snapshot = highlights.map((h) => ({
      battle_id: h.battle_id,
      battle_title: h.battle_title,
      winner_id: h.winner_id,
      winner_name: h.winner_name,
      winner_parish: h.winner_parish,
      winner_image_url: h.winner_image_url,
      avg_performance: h.avg_performance,
      avg_attire: h.avg_attire,
      avg_crowd_engagement: h.avg_crowd_engagement,
      avg_total: h.avg_total,
      judges: h.judges,
      fan_votes: h.fan_votes,
    }));
    const seasonLabel = body?.season_label || `Season ${new Date().getFullYear()}`;
    let archivedId = null;
    if (snapshot.length > 0) {
      const archive = await admin.entities.SeasonArchive.create({
        season_label: seasonLabel,
        archived_date: new Date().toISOString(),
        archived_by_id: user.id,
        highlights: snapshot,
        battle_count: snapshot.length,
        total_votes: totalVotes,
      });
      archivedId = archive.id;
    }

    // Always: clear fan votes and reset contestant vote counts.
    await admin.entities.Vote.deleteMany({});
    await admin.entities.Contestant.updateMany({}, { $set: { vote_count: 0 } });

    const summary = {
      mode,
      votesDeleted: true,
      contestantCountsReset: true,
      battleScoresCleared: false,
      judgeCommentsCleared: false,
      battlesClosed: false,
      archivedWinners: snapshot.length,
      archiveId: archivedId,
      seasonLabel,
    };

    if (mode === 'full') {
      await admin.entities.BattleScore.deleteMany({});
      await admin.entities.JudgeComment.deleteMany({});
      await admin.entities.Battle.updateMany({}, { $set: { status: 'closed' } });
      summary.battleScoresCleared = true;
      summary.judgeCommentsCleared = true;
      summary.battlesClosed = true;
    }

    return Response.json({ ok: true, summary });
  } catch (error) {
    console.error('resetCompetition error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}