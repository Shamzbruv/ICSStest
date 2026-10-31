import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Gavel, CheckCircle2, Clock } from "lucide-react";

export default function JudgeActivityLog() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await base44.functions.invoke("getJudgeActivity", {});
        if (!cancelled && res.status < 400) setActivity(res.data.activity || []);
      } catch (e) {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Gavel className="w-5 h-5 text-amber-600" />
        <h2 className="font-display text-2xl tracking-tight">Judge Activity Log</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Which judges have submitted their scores for each active battle.
      </p>
      {loading ? (
        <div className="grid place-items-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : activity.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6">No active battles right now.</p>
      ) : (
        <div className="space-y-4">
          {activity.map((b) => (
            <div key={b.battle_id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="font-medium truncate">{b.title}</h3>
                  {b.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{b.subtitle}</p>
                  )}
                </div>
                <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-muted tabular-nums shrink-0">
                  {b.submitted_count}/{b.judge_count} submitted
                </span>
              </div>
              {b.judge_count === 0 ? (
                <p className="text-xs text-muted-foreground">No judges invited yet.</p>
              ) : (
                <ul className="grid sm:grid-cols-2 gap-2">
                  {b.judges.map((j) => (
                    <li key={j.id} className="flex items-center gap-2 text-sm">
                      {j.submitted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="truncate">{j.name}</span>
                      {j.submitted && (
                        <span className="text-xs text-muted-foreground ml-auto tabular-nums shrink-0">
                          {j.score_count} score{j.score_count === 1 ? "" : "s"}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}