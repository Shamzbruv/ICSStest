import React from "react";
import { useScoreLeaderboard } from "@/lib/useScoreLeaderboard";
import { Loader2, Gavel } from "lucide-react";

const CATS = [
  { key: "avg_performance", label: "Performance" },
  { key: "avg_attire", label: "Attire" },
  { key: "avg_crowd_engagement", label: "Crowd" },
];

export default function ContestantJudgeScore({ contestantId }) {
  const { leaderboard, loading } = useScoreLeaderboard();
  const row = leaderboard.find((r) => r.contestant_id === contestantId);
  const rank = leaderboard.findIndex((r) => r.contestant_id === contestantId);

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-1">
        <Gavel className="w-5 h-5 text-amber-600" />
        <h2 className="font-display text-2xl tracking-tight">Judge Results</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Average judge scores across all battles this contestant has been scored in.
      </p>
      {loading ? (
        <div className="grid place-items-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : !row ? (
        <p className="text-sm text-muted-foreground py-6">No judge scores submitted yet.</p>
      ) : (
        <div className="rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Overall rank</span>
            <span className="font-display text-2xl tabular-nums">#{rank + 1}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATS.map((c) => (
              <div key={c.key} className="rounded-xl bg-muted/40 p-3 text-center">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="font-display text-xl tabular-nums">{row[c.key]}</div>
              </div>
            ))}
            <div className="rounded-xl bg-amber-400/15 p-3 text-center border border-amber-400/30">
              <div className="text-xs text-amber-600">Total</div>
              <div className="font-display text-xl tabular-nums">{row.avg_total}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Based on {row.judges} judge score{row.judges === 1 ? "" : "s"}.
          </div>
        </div>
      )}
    </section>
  );
}