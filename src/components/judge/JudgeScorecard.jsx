import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ClipboardList, Lock } from "lucide-react";

export default function JudgeScorecard({ battle, contestants, refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!battle?.id) {
      setData(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await base44.functions.invoke("getJudgeScorecard", { battle_id: battle.id });
        if (res.status < 400 && !cancelled) setData(res.data);
      } catch (e) {
        /* ignore */
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [battle?.id, refreshKey]);

  if (!battle) return null;

  const duo = contestants;
  const scores = data?.scores || [];
  const comments = data?.comments || [];
  const judgeIds = [...new Set(scores.map((s) => s.judge_id))];
  const scoreFor = (judgeId, contestantId) =>
    scores.find((s) => s.judge_id === judgeId && s.contestant_id === contestantId);
  const total = (s) =>
    s ? (s.performance || 0) + (s.attire || 0) + (s.crowd_engagement || 0) : null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList className="w-5 h-5 text-amber-600" />
        <h2 className="font-display text-xl">Judge Scorecard</h2>
      </div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
        <Lock className="w-3 h-3" /> Visible to judges & admin only
      </p>

      {loading ? (
        <div className="grid place-items-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : scores.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6">No scores submitted yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th rowSpan={2} className="p-3 align-bottom font-medium">
                    Judge
                  </th>
                  {duo.map((c) => (
                    <th
                      key={c.id}
                      colSpan={4}
                      className="p-3 text-center font-display border-l border-border"
                    >
                      {c.name}
                    </th>
                  ))}
                </tr>
                <tr className="text-xs text-muted-foreground">
                  {duo.map((c) => (
                    <React.Fragment key={c.id}>
                      <th className="p-2 text-center border-l border-border">Perf</th>
                      <th className="p-2 text-center">Attire</th>
                      <th className="p-2 text-center">Crowd</th>
                      <th className="p-2 text-center font-semibold text-foreground">Total</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {judgeIds.map((jid) => {
                  const sample = scores.find((s) => s.judge_id === jid);
                  return (
                    <tr key={jid} className="border-t border-border">
                      <td className="p-3 font-medium">{sample?.judge_name || "Judge"}</td>
                      {duo.map((c) => {
                        const s = scoreFor(jid, c.id);
                        return s ? (
                          <React.Fragment key={c.id}>
                            <td className="p-2 text-center border-l border-border tabular-nums">
                              {s.performance ?? 0}
                            </td>
                            <td className="p-2 text-center tabular-nums">{s.attire ?? 0}</td>
                            <td className="p-2 text-center tabular-nums">{s.crowd_engagement ?? 0}</td>
                            <td className="p-2 text-center font-semibold tabular-nums">{total(s)}</td>
                          </React.Fragment>
                        ) : (
                          <td
                            key={c.id}
                            colSpan={4}
                            className="p-2 text-center text-muted-foreground border-l border-border"
                          >
                            —
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {comments.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Judge Notes</h3>
              {comments.map((cmt, i) => (
                <div key={i} className="rounded-lg bg-muted/40 p-3 text-sm">
                  <span className="font-medium">{cmt.judge_name || "Judge"}:</span>{" "}
                  <span className="text-muted-foreground">{cmt.text}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}