import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useContestants } from "@/lib/useContestants";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Loader2, Save, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  { key: "performance", label: "Performance" },
  { key: "attire", label: "Attire" },
  { key: "crowd_engagement", label: "Crowd Engagement" },
];

export default function JudgeBattleCard({ battle, judgeId, onSaved }) {
  const { contestants } = useContestants();
  const byId = Object.fromEntries(contestants.map((c) => [c.id, c]));
  const duo = (battle.contestant_ids || [])
    .map((id) => byId[id])
    .filter(Boolean)
    .slice(0, 2);

  const [scores, setScores] = useState({});
  const [comment, setComment] = useState("");
  const [commentId, setCommentId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    setScores({});
    setComment("");
    setCommentId(null);
    (async () => {
      try {
        const existing = await base44.entities.BattleScore.filter({
          battle_id: battle.id,
          judge_id: judgeId,
        });
        if (cancelled) return;
        const map = {};
        existing.forEach((s) => {
          map[s.contestant_id] = {
            performance: s.performance || 0,
            attire: s.attire || 0,
            crowd_engagement: s.crowd_engagement || 0,
            score_id: s.id,
          };
        });
        setScores(map);
        const existingComments = await base44.entities.JudgeComment.filter({
          battle_id: battle.id,
          judge_id: judgeId,
        });
        if (cancelled) return;
        const ec = existingComments[0];
        setComment(ec?.text || "");
        setCommentId(ec?.id || null);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [battle.id, judgeId]);

  const setVal = (cid, key, val) => {
    let n = parseInt(val, 10);
    if (isNaN(n)) n = 0;
    n = Math.max(0, Math.min(25, n));
    setScores((prev) => ({
      ...prev,
      [cid]: {
        ...(prev[cid] || { performance: 0, attire: 0, crowd_engagement: 0 }),
        [key]: n,
      },
    }));
  };

  const save = async () => {
    setBusy(true);
    setMsg("");
    try {
      const saved = await Promise.all(
        duo.map(async (c) => {
          const sc = scores[c.id] || { performance: 0, attire: 0, crowd_engagement: 0 };
          if (sc.score_id) {
            await base44.entities.BattleScore.update(sc.score_id, {
              performance: sc.performance,
              attire: sc.attire,
              crowd_engagement: sc.crowd_engagement,
            });
            return { cid: c.id, score_id: sc.score_id };
          }
          const created = await base44.entities.BattleScore.create({
            battle_id: battle.id,
            contestant_id: c.id,
            judge_id: judgeId,
            performance: sc.performance,
            attire: sc.attire,
            crowd_engagement: sc.crowd_engagement,
          });
          return { cid: c.id, score_id: created.id };
        })
      );
      setScores((prev) => {
        const next = { ...prev };
        saved.forEach(({ cid, score_id }) => {
          next[cid] = { ...(next[cid] || {}), score_id };
        });
        return next;
      });
      const text = comment.trim();
      if (text) {
        if (commentId) {
          await base44.entities.JudgeComment.update(commentId, { text });
        } else {
          const created = await base44.entities.JudgeComment.create({
            battle_id: battle.id,
            judge_id: judgeId,
            text,
          });
          if (created?.id) setCommentId(created.id);
        }
      } else if (commentId) {
        await base44.entities.JudgeComment.delete(commentId);
        setCommentId(null);
      }
      setMsg("Scores saved.");
      if (onSaved) onSaved();
    } catch (e) {
      setMsg(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-display text-lg">{battle.title}</h3>
        {battle.subtitle && <p className="text-xs text-muted-foreground">{battle.subtitle}</p>}
      </div>
      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {duo.map((c) => {
          const sc = scores[c.id] || { performance: 0, attire: 0, crowd_engagement: 0 };
          return (
            <div key={c.id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  <Image src={c.image_url} alt={c.name} className="w-full h-full" fittingType="fill" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display text-base leading-tight truncate">{c.name}</h4>
                  <p className="text-xs text-muted-foreground">{c.parish}</p>
                </div>
              </div>
              <div className="space-y-3">
                {CATEGORIES.map((cat) => (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{cat.label}</span>
                      <span className="tabular-nums text-xs text-muted-foreground">
                        {sc[cat.key] || 0}/25
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={sc[cat.key] || 0}
                      onChange={(e) => setVal(c.id, cat.key, e.target.value)}
                      className="w-full accent-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-4 border-t border-border">
        <label className="text-xs uppercase tracking-wide text-muted-foreground">Judge Note</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          maxLength={300}
          placeholder="Leave a short note about this battle…"
          className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
        />
      </div>
      <div className="px-5 py-3 border-t border-border flex items-center gap-3">
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-black"
          onClick={save}
          disabled={busy}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Submit
          Scores
        </Button>
        {msg && (
          <span
            className={`text-sm flex items-center gap-1 ${
              msg === "Scores saved." ? "text-green-600" : "text-destructive"
            }`}
          >
            {msg === "Scores saved." && <CheckCircle2 className="w-4 h-4" />} {msg}
          </span>
        )}
      </div>
    </div>
  );
}