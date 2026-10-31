import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import PullToRefresh from "@/components/PullToRefresh";
import { Loader2, Crown, Award, Users } from "lucide-react";

const CATEGORIES = [
  { key: "avg_performance", label: "Performance" },
  { key: "avg_attire", label: "Attire" },
  { key: "avg_crowd_engagement", label: "Crowd" },
];

export default function BattleLeaderboard() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await base44.functions.invoke("getScoreLeaderboard", {});
        if (!cancelled && res.status < 400) setRows(res.data.leaderboard || []);
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-20">
        <Award className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl mb-2">No scores yet</h1>
        <p className="text-muted-foreground">Judge scores will appear here once battles are scored.</p>
      </div>
    );
  }

  const reload = async () => {
    const res = await base44.functions.invoke("getScoreLeaderboard", {});
    if (res.status < 400) setRows(res.data.leaderboard || []);
  };

  return (
    <PullToRefresh onRefresh={reload}>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-600 mb-2">Battle Mode</p>
        <h1 className="font-display text-4xl tracking-tight">Judge Scoreboard</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Singers ranked by averaged judge points across Performance, Attire & Crowd Engagement (out of 75).
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((r, i) => {
          const rank = i + 1;
          return (
            <div
              key={r.contestant_id}
              className={`rounded-2xl border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
                rank === 1 ? "border-amber-500/60 bg-amber-400/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full grid place-items-center font-display text-lg shrink-0 ${
                    rank === 1
                      ? "bg-amber-500 text-black"
                      : rank === 2
                      ? "bg-slate-300 text-slate-800"
                      : rank === 3
                      ? "bg-amber-700/30 text-amber-800"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {rank === 1 ? <Crown className="w-5 h-5" /> : rank}
                </div>
                <Link to={`/contestant/${r.contestant_id}`} className="block shrink-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted">
                    <Image src={r.image_url} alt={r.name} className="w-full h-full" fittingType="fill" />
                  </div>
                </Link>
                <div className="min-w-0">
                  <Link
                    to={`/contestant/${r.contestant_id}`}
                    className="font-display text-lg leading-tight hover:underline truncate block"
                  >
                    {r.name}
                  </Link>
                  {r.parish && <p className="text-xs text-muted-foreground">{r.parish}</p>}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Users className="w-3 h-3" /> {r.judges} judge{r.judges === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-6 flex-1">
                {CATEGORIES.map((cat) => (
                  <div key={cat.key} className="text-center sm:text-right">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {cat.label}
                    </div>
                    <div className="font-medium tabular-nums text-sm">
                      {r[cat.key]?.toFixed(1)}
                      <span className="text-muted-foreground text-xs">/25</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between sm:justify-end sm:w-36 sm:pl-6 sm:border-l border-border">
                <div className="sm:text-right">
                  <div className="text-xs uppercase tracking-widest text-amber-600 font-semibold">
                    Total
                  </div>
                  <div className="font-display text-2xl tabular-nums">
                    {r.avg_total?.toFixed(1)}
                    <span className="text-muted-foreground text-base">/75</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PullToRefresh>
  );
}