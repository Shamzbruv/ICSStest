import React from "react";
import { ClipboardList, Users } from "lucide-react";

const CATEGORIES = [
  { key: "performance", label: "Performance" },
  { key: "attire", label: "Attire" },
  { key: "crowd_engagement", label: "Crowd" },
];

export default function BattleScoreboard({ contestants, result }) {
  const duo = contestants.slice(0, 2);
  const scores = result?.scores || {};
  const hasScores = duo.some((c) => scores[c.id]);

  return (
    <div className="border-t border-border px-4 py-4 bg-muted/30">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-4 h-4 text-amber-600" />
        <h4 className="text-xs uppercase tracking-widest text-amber-600 font-semibold">Judge Scoreboard</h4>
      </div>
      {!hasScores ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          Scores not yet entered for this match.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {duo.map((c, i) => {
            const sc = scores[c.id] || {
              performance: 0,
              attire: 0,
              crowd_engagement: 0,
              total: 0,
              judges: 0,
            };
            return (
              <div key={c.id} className={i === 0 ? "border-r border-border pr-4" : "pl-4"}>
                <div className="font-medium text-sm truncate mb-2">{c.name}</div>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.key} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{cat.label}</span>
                      <span className="tabular-nums font-medium">
                        {sc[cat.key] ?? 0}
                        <span className="text-muted-foreground">/25</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 rounded-lg bg-amber-400/15 px-2 py-1.5 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold">
                    Total
                  </span>
                  <span className="font-display text-sm tabular-nums">{sc.total ?? 0}/75</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" /> {sc.judges || 0} judge
                  {(sc.judges || 0) === 1 ? "" : "s"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {result?.comments?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="text-xs uppercase tracking-widest text-amber-600 font-semibold mb-2">
            Judge Notes
          </div>
          <div className="space-y-2">
            {result.comments.map((cmt, i) => (
              <div key={i} className="text-xs">
                <span className="font-medium">{cmt.judge_name}:</span>{" "}
                <span className="text-muted-foreground">{cmt.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}