import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBattles } from "@/lib/useBattles";
import { useContestants } from "@/lib/useContestants";
import { Button } from "@/components/ui/button";
import MobileSelect from "@/components/MobileSelect";
import { Loader2, Save, ClipboardList, Trophy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = [
  { key: "performance", label: "Performance" },
  { key: "attire", label: "Attire" },
  { key: "crowd_engagement", label: "Crowd Engagement" },
];

export default function BattleScoring({ judgeId }) {
  const { battles, loading: loadingB } = useBattles();
  const { contestants, loading: loadingC } = useContestants();
  const [battleId, setBattleId] = useState("");
  const [scores, setScores] = useState({});
  const [busy, setBusy] = useState(false);
  const [concluding, setConcluding] = useState(false);
  const [msg, setMsg] = useState("");
  const { toast } = useToast();

  const byId = Object.fromEntries(contestants.map((c) => [c.id, c]));
  const battle = battles.find((b) => b.id === battleId);
  const duo = battle ? (battle.contestant_ids || []).map((id) => byId[id]).filter(Boolean) : [];

  useEffect(() => {
    if (!battleId) return;
    let cancelled = false;
    setScores({});
    (async () => {
      try {
        const existing = await base44.entities.BattleScore.filter({
          battle_id: battleId,
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
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [battleId]);

  const setVal = (cid, key, val) => {
    let n = parseInt(val, 10);
    if (isNaN(n)) n = 0;
    n = Math.max(0, Math.min(25, n));
    setScores((prev) => ({
      ...prev,
      [cid]: { ...(prev[cid] || { performance: 0, attire: 0, crowd_engagement: 0 }), [key]: n },
    }));
  };

  const save = async () => {
    if (!battle) return;
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
      setMsg("Scores saved.");
    } catch (e) {
      setMsg(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const conclude = async () => {
    if (!battle) return;
    if (!window.confirm(`Conclude "${battle.title}"? This closes the battle and publishes the winner to Competition Highlights.`)) return;
    setConcluding(true);
    setMsg("");
    try {
      const res = await base44.functions.invoke("finalizeBattle", { battle_id: battle.id });
      if (res.status >= 400) {
        setMsg(res.data?.error || "Conclude failed");
      } else {
        const w = res.data?.highlight?.winner_name || "Winner";
        setMsg(`Battle concluded — ${w} published to highlights.`);
        toast({ title: "Battle concluded", description: `${w} was published to Competition Highlights.` });
      }
    } catch (e) {
      setMsg(e?.response?.data?.error || e.message || "Conclude failed");
    } finally {
      setConcluding(false);
    }
  };

  if (loadingB || loadingC) {
    return (
      <div className="grid place-items-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (battles.length === 0) {
    return <p className="text-sm text-muted-foreground">No battles available to score.</p>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl">Battle Scoring</h2>
      </div>

      <label className="text-xs uppercase tracking-wide text-muted-foreground">Select Battle</label>
      <MobileSelect
        value={battleId}
        onValueChange={setBattleId}
        placeholder="Choose a battle…"
        title="Select Battle"
        className="w-full mt-1 mb-4 h-11"
        options={battles.map((b) => ({ value: b.id, label: b.title }))}
      />

      {battle && duo.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {duo.map((c) => {
              const sc = scores[c.id] || { performance: 0, attire: 0, crowd_engagement: 0 };
              const total = (sc.performance || 0) + (sc.attire || 0) + (sc.crowd_engagement || 0);
              return (
                <div key={c.id} className="rounded-xl border border-border p-4">
                  <h4 className="font-display text-lg">{c.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{c.parish}</p>
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
                          className="w-full accent-primary"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-lg bg-primary/15 px-3 py-2 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-primary font-semibold">Total</span>
                    <span className="font-display text-lg tabular-nums">{total}/75</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={save} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Scores
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-primary text-primary hover:bg-primary/10"
              onClick={conclude}
              disabled={concluding || busy}
            >
              {concluding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />} Conclude Battle
            </Button>
            {msg && <span className="text-sm text-primary">{msg}</span>}
          </div>
        </>
      )}
    </div>
  );
}