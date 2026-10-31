import React from "react";
import { useContestants } from "@/lib/useContestants";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import PullToRefresh from "@/components/PullToRefresh";
import { Crown, Medal, Loader2, TrendingUp, MapPin } from "lucide-react";

const medal = ["from-amber-400 to-amber-600", "from-slate-300 to-slate-500", "from-orange-400 to-orange-600"];

export default function Leaderboard() {
  const { contestants, loading, refresh } = useContestants();
  const ranked = [...contestants]
    .filter((c) => c.status === "active" || c.status === "winner")
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

  const totalVotes = ranked.reduce((sum, c) => sum + (c.vote_count || 0), 0);
  const leaderVotes = ranked[0]?.vote_count || 0;

  return (
    <PullToRefresh onRefresh={refresh}>
      <header className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-amber-600 text-sm font-medium mb-2">
          <TrendingUp className="w-4 h-4" /> Live Standings
        </div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-lg">
          Real-time vote totals across all contestants. Rankings update the moment a vote is cast.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : ranked.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No contestants to rank yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8 text-center">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-3xl font-display tabular-nums">{ranked.length}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Contestants</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-3xl font-display tabular-nums">{totalVotes.toLocaleString()}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Total Votes</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-3xl font-display tabular-nums">{leaderVotes.toLocaleString()}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Top Votes</div>
            </div>
          </div>

          <div className="space-y-2">
            {ranked.map((c, i) => {
              const top3 = i < 3;
              const pct = leaderVotes ? Math.round(((c.vote_count || 0) / leaderVotes) * 100) : 0;
              return (
                <Link
                  to={`/contestant/${c.id}`}
                  key={c.id}
                  className={`flex items-center gap-4 rounded-xl border bg-card p-3 transition hover:shadow-md ${
                    top3 ? "border-amber-400/40" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-center w-10 shrink-0">
                    {top3 ? (
                      <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${medal[i]} grid place-items-center shadow-sm`}>
                        {i === 0 ? <Crown className="w-5 h-5 text-black" /> : <Medal className="w-5 h-5 text-black" />}
                      </span>
                    ) : (
                      <span className="font-display text-xl text-muted-foreground tabular-nums">{i + 1}</span>
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    <Image src={c.image_url} alt={c.name} className="w-full h-full" fittingType="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display text-xl leading-tight truncate">{c.name}</h3>
                      <span className="text-xs uppercase tracking-widest text-amber-600 shrink-0">{c.talent_category}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {c.parish && <><MapPin className="w-3.5 h-3.5" /> {c.parish} · </>}
                      <span className="tabular-nums font-medium text-foreground">{(c.vote_count || 0).toLocaleString()}</span> votes
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  {i === 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs uppercase tracking-widest text-amber-600 font-medium shrink-0">
                      Leading
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </PullToRefresh>
  );
}