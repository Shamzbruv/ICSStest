import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useContestants } from "@/lib/useContestants";
import { useVoter } from "@/lib/useVoter";
import { Image } from "@/components/ui/image";
import PullToRefresh from "@/components/PullToRefresh";
import { Crown, MapPin, Loader2, Trophy } from "lucide-react";
import ParishContestantRow from "@/components/ParishContestantRow";
import VoteModal from "@/components/VoteModal";
import JudgeResultsScoreboard from "@/components/JudgeResultsScoreboard";

const PARISHES = [
  "Kingston",
  "St. Andrew",
  "St. Catherine",
  "Clarendon",
  "St. Ann",
  "Trelawny",
  "St. James",
  "Hanover",
  "Westmoreland",
  "St. Elizabeth",
  "Manchester",
  "St. Mary",
  "Portland",
  "St. Thomas",
];

export default function Parishes() {
  const { contestants, loading, refresh } = useContestants();
  const { voterId, balance } = useVoter();
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("c");
  const [active, setActive] = useState("Kingston");
  const [voteTarget, setVoteTarget] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (ok) => {
      if (!ok) return;
      try {
        setCurrentUser(await base44.auth.me());
      } catch (e) {
        // not logged in — ignore
      }
    });
  }, []);

  const byParish = useMemo(() => {
    const map = {};
    PARISHES.forEach((p) => (map[p] = []));
    contestants.forEach((c) => {
      if (map[c.parish]) map[c.parish].push(c);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    );
    return map;
  }, [contestants]);

  const list = byParish[active] || [];
  const leader = list[0];
  const leaderVotes = leader?.vote_count || 0;

  useEffect(() => {
    if (!focusId || loading) return;
    const target = contestants.find((c) => c.id === focusId);
    if (target && target.parish !== active) setActive(target.parish);
  }, [focusId, loading, contestants]);

  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`parish-row-${focusId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId, active, list]);

  return (
    <PullToRefresh onRefresh={refresh}>
      <header className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-amber-600 text-sm font-medium mb-2">
          <Trophy className="w-4 h-4" /> Parish Showdown
        </div>
        <h1 className="font-display text-4xl tracking-tight">Road to the Grand Finale</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          14 parishes. 10 contestants each. Only the top vote-getter from each parish advances to
          represent their home at the grand finale.
        </p>
      </header>

      <div role="tablist" aria-label="Parishes" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-8">
        {PARISHES.map((p) => {
          const ldr = byParish[p]?.[0];
          const count = byParish[p]?.length || 0;
          const isActive = active === p;
          return (
            <button
              key={p}
              onClick={() => setActive(p)}
              role="tab"
              aria-selected={isActive}
              className={`text-left rounded-xl border p-3 transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none ${
                isActive
                  ? "border-amber-500 bg-amber-400/10"
                  : "border-border hover:border-amber-400/50 bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{p}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </div>
              {ldr && (
                <div className="text-xs text-muted-foreground truncate mt-1">
                  <Crown className="w-3 h-3 inline text-amber-500" /> {ldr.name}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : list.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">
          No contestants from {active} yet.
        </p>
      ) : (
        <>
          {leader && (
            <div className="rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-400/10 to-amber-600/5 p-5 mb-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                <Image
                  src={leader.image_url}
                  alt={leader.name}
                  className="w-full h-full"
                  fittingType="fill"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-amber-600 font-medium mb-1">
                  <Crown className="w-3.5 h-3.5" /> Parish Representative
                </div>
                <h2 className="font-display text-2xl leading-tight truncate">{leader.name}</h2>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> {leader.parish} · {leader.talent_category}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-display tabular-nums">
                  {(leader.vote_count || 0).toLocaleString()}
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Votes</div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {list.map((c, i) => (
              <ParishContestantRow
                key={c.id}
                contestant={c}
                rank={i + 1}
                isTopContestant={i < 3}
                isOwner={!!currentUser && c.user_id === currentUser.id}
                isHighlight={c.id === focusId}
                leaderVotes={leaderVotes}
                onVote={setVoteTarget}
              />
            ))}
          </div>
        </>
      )}

      <JudgeResultsScoreboard parish={active} />

      <VoteModal
        contestant={voteTarget}
        open={!!voteTarget}
        onOpenChange={(o) => !o && setVoteTarget(null)}
        voterId={voterId}
        balance={balance}
        onVoted={() => {}}
      />
    </PullToRefresh>
  );
}