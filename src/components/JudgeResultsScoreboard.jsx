import React from "react";
import { Link } from "react-router-dom";
import { useScoreLeaderboard } from "@/lib/useScoreLeaderboard";
import { Image } from "@/components/ui/image";
import { Loader2, Gavel } from "lucide-react";

export default function JudgeResultsScoreboard({ parish }) {
  const { leaderboard, loading } = useScoreLeaderboard();
  const rows = parish ? leaderboard.filter((r) => r.parish === parish) : leaderboard;
  const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-1">
        <Gavel className="w-5 h-5 text-amber-600" />
        <h2 className="font-display text-2xl tracking-tight">Judge Results Scoreboard</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Average judge scores across all battles (performance, attire, crowd engagement).
      </p>
      {loading ? (
        <div className="grid place-items-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : ranked.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6">
          No judge scores submitted yet{parish ? ` for ${parish}` : ""}.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Contestant</th>
                <th className="p-3 text-center">Perf</th>
                <th className="p-3 text-center">Attire</th>
                <th className="p-3 text-center">Crowd</th>
                <th className="p-3 text-center">Total</th>
                <th className="p-3 text-center">Judges</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((r) => (
                <tr key={r.contestant_id} className="border-t border-border">
                  <td className="p-3 font-medium tabular-nums">{r.rank}</td>
                  <td className="p-3">
                    <Link to={`/contestant/${r.contestant_id}`} className="flex items-center gap-2 hover:text-amber-600">
                      {r.image_url && (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
                          <Image src={r.image_url} alt={r.name} className="w-full h-full" fittingType="fill" />
                        </div>
                      )}
                      <span className="font-medium">{r.name}</span>
                    </Link>
                  </td>
                  <td className="p-3 text-center tabular-nums">{r.avg_performance}</td>
                  <td className="p-3 text-center tabular-nums">{r.avg_attire}</td>
                  <td className="p-3 text-center tabular-nums">{r.avg_crowd_engagement}</td>
                  <td className="p-3 text-center font-semibold tabular-nums">{r.avg_total}</td>
                  <td className="p-3 text-center tabular-nums text-muted-foreground">{r.judges}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}