import React, { useState, useEffect } from "react";
import { useContestants } from "@/lib/useContestants";
import { useBattles } from "@/lib/useBattles";
import { useVoter } from "@/lib/useVoter";
import { base44 } from "@/api/base44Client";
import BattleCard from "@/components/BattleCard";
import BattleResults from "@/components/BattleResults";
import VoteAdvisorChat from "@/components/agent/VoteAdvisorChat";
import PullToRefresh from "@/components/PullToRefresh";
import { Loader2, Trophy, Sparkles } from "lucide-react";

export default function Battles() {
  const { contestants, loading: loadingC, refresh } = useContestants();
  const { battles, loading: loadingB } = useBattles();
  const { voterId, balance } = useVoter();
  const [results, setResults] = useState({});
  const [advisorOpen, setAdvisorOpen] = useState(false);

  const byId = Object.fromEntries(contestants.map((c) => [c.id, c]));
  const active = battles.filter((b) => b.status === "active");
  const closed = battles.filter((b) => b.status === "closed");
  const allKey = battles.map((b) => b.id).join(",");

  useEffect(() => {
    if (!allKey) return;
    let cancelled = false;
    const load = async () => {
      const next = {};
      await Promise.all(
        battles.map(async (b) => {
          try {
            const res = await base44.functions.invoke("getBattleResults", { battle_id: b.id });
            if (res.status < 400) next[b.id] = res.data;
          } catch (e) {
            // ignore individual failures
          }
        })
      );
      if (!cancelled) setResults(next);
    };
    load();
    const t = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [allKey]);

  return (
    <PullToRefresh onRefresh={refresh}>
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Head to Head</p>
        <h1 className="font-display text-4xl tracking-tight">Battles</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Vote in real time and push your favourite to the next round.
        </p>
      </div>
      {loadingB || loadingC ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="space-y-8">
              {active.map((b) => (
                <BattleCard
                  key={b.id}
                  battle={b}
                  contestants={(b.contestant_ids || []).map((id) => byId[id]).filter(Boolean)}
                  voterId={voterId}
                  balance={balance}
                  result={results[b.id]}
                />
              ))}
            </section>
          )}

          {closed.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-primary" />
                <h2 className="font-display text-2xl tracking-tight">Concluded Rounds</h2>
              </div>
              <div className="space-y-8">
                {closed.map((b) => (
                  <BattleResults
                    key={b.id}
                    battle={b}
                    contestants={(b.contestant_ids || []).map((id) => byId[id]).filter(Boolean)}
                    result={results[b.id]}
                  />
                ))}
              </div>
            </section>
          )}

          {active.length === 0 && closed.length === 0 && (
            <p className="text-center text-muted-foreground py-20">No battles right now. Check back soon!</p>
          )}
        </>
      )}

      <button
        onClick={() => setAdvisorOpen(true)}
        aria-label="Ask Vote Advisor"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 text-sm font-semibold shadow-lg"
      >
        <Sparkles className="w-4 h-4" /> Ask Vote Advisor
      </button>
      <VoteAdvisorChat open={advisorOpen} onClose={() => setAdvisorOpen(false)} />
    </PullToRefresh>
  );
}