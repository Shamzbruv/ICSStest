import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useBattles } from "@/lib/useBattles";
import { useContestants } from "@/lib/useContestants";
import JudgeBattleCard from "@/components/judge/JudgeBattleCard";
import JudgeLogin from "@/components/judge/JudgeLogin";
import BattleScoreboard from "@/components/BattleScoreboard";
import JudgeScorecard from "@/components/judge/JudgeScorecard";
import JudgeProfileEditor from "@/components/judge/JudgeProfileEditor";
import { Loader2, ShieldAlert } from "lucide-react";
import MobileSelect from "@/components/MobileSelect";

export default function JudgePortal() {
  const { battles, loading } = useBattles();
  const { contestants } = useContestants();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [battleId, setBattleId] = useState("");
  const [result, setResult] = useState(null);
  const [scoreRefreshKey, setScoreRefreshKey] = useState(0);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (ok) => {
      if (ok) {
        try {
          const me = await base44.auth.me();
          setUser(me);
        } catch (e) {
          setUser(null);
        }
      }
      setAuthChecked(true);
    });
  }, []);

  const active = battles.filter((b) => b.status === "active");
  const battle = battles.find((b) => b.id === battleId);
  const byId = Object.fromEntries(contestants.map((c) => [c.id, c]));
  const duo = battle ? (battle.contestant_ids || []).map((id) => byId[id]).filter(Boolean) : [];

  const fetchResults = async (id) => {
    if (!id) {
      setResult(null);
      return;
    }
    try {
      const res = await base44.functions.invoke("getBattleResults", { battle_id: id });
      if (res.status < 400) setResult(res.data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchResults(battleId);
  }, [battleId]);

  if (!authChecked)
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (!user) return <JudgeLogin />;

  if (user.role !== "judge" && user.role !== "admin")
    return (
      <div className="text-center py-20">
        <ShieldAlert className="w-10 h-10 mx-auto text-destructive mb-4" />
        <h1 className="font-display text-2xl mb-2">Not authorized</h1>
        <p className="text-muted-foreground">This portal is for invited judges only.</p>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-600 mb-2">Judges</p>
        <h1 className="font-display text-4xl tracking-tight">Judge Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Select a battle, then score each singer on performance, attire, and crowd engagement
          (0–25 per category). Results update automatically.
        </p>
      </div>

      <div className="mb-8">
        <JudgeProfileEditor user={user} />
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : active.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">
          No active battles to score right now.
        </p>
      ) : (
        <>
          <div className="mb-6">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Select Battle</label>
            <MobileSelect
              value={battleId}
              onValueChange={setBattleId}
              placeholder="Choose a battle…"
              title="Select Battle"
              className="w-full sm:w-80 mt-1 h-11"
              options={active.map((b) => ({ value: b.id, label: b.title }))}
            />
          </div>

          {battle && (
            <>
              <JudgeBattleCard
                battle={battle}
                judgeId={user.id}
                onSaved={() => {
                  fetchResults(battleId);
                  setScoreRefreshKey((k) => k + 1);
                }}
              />
              <div className="mt-6">
                <h2 className="font-display text-xl mb-3">Current Results</h2>
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                  <BattleScoreboard contestants={duo} result={result} />
                </div>
              </div>
              <JudgeScorecard battle={battle} contestants={duo} refreshKey={scoreRefreshKey} />
            </>
          )}
        </>
      )}
    </div>
  );
}