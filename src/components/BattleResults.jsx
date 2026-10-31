import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { MapPin, Trophy, Crown, Loader2, Heart, Users } from "lucide-react";

const CATEGORIES = [
  { key: "performance", label: "Performance" },
  { key: "attire", label: "Attire" },
  { key: "crowd_engagement", label: "Crowd" },
];

export default function BattleResults({ battle, contestants, result }) {
  const duo = contestants.slice(0, 2);
  const votes = result?.votes || {};
  const scores = result?.scores || {};
  const winnerId = result?.winner_id;
  const tie = result?.tie;
  const loading = !result;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-gradient-to-r from-amber-500/15 to-amber-600/10 border-b border-border flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-600" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-tight truncate">{battle.title}</h3>
          {battle.subtitle && <p className="text-xs text-muted-foreground truncate">{battle.subtitle}</p>}
        </div>
        <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold">Result</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="relative grid grid-cols-2">
            {duo.map((c, i) => {
              const sc = scores[c.id] || { performance: 0, attire: 0, crowd_engagement: 0, total: 0 };
              const fanVotes = votes[c.id] || 0;
              const isWinner = !tie && winnerId === c.id;
              return (
                <div
                  key={c.id}
                  className={`flex flex-col p-4 ${i === 0 ? "border-r border-border" : ""} ${
                    isWinner ? "bg-amber-400/10" : ""
                  }`}
                >
                  <Link to={`/contestant/${c.id}`} className="block relative">
                    <div
                      className={`aspect-[3/4] rounded-xl overflow-hidden bg-muted mb-3 ${
                        isWinner ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-card" : ""
                      }`}
                    >
                      <Image src={c.image_url} alt={c.name} className="w-full h-full" fittingType="fill" />
                    </div>
                    {isWinner && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow">
                        <Crown className="w-3 h-3" /> WINNER
                      </span>
                    )}
                  </Link>
                  <div className="text-xs uppercase tracking-widest text-amber-600">Singer</div>
                  <h4 className="font-display text-lg leading-tight">{c.name}</h4>
                  {c.parish && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3" /> {c.parish}
                    </div>
                  )}

                  <div className="mt-3 space-y-1.5">
                    {CATEGORIES.map((cat) => (
                      <div key={cat.key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{cat.label}</span>
                        <span className="tabular-nums font-medium">
                          {sc[cat.key] || 0}
                          <span className="text-muted-foreground text-xs">/25</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl bg-amber-400/15 px-3 py-2 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold">Total</span>
                    <span className="font-display text-xl tabular-nums">
                      {sc.total || 0}
                      <span className="text-muted-foreground text-sm">/75</span>
                    </span>
                  </div>

                  {(sc.judges || 0) > 0 && (
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" /> avg of {sc.judges} judge{sc.judges === 1 ? "" : "s"}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Heart className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="tabular-nums">{fanVotes.toLocaleString()}</span> fan votes
                  </div>
                </div>
              );
            })}

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <span className="grid place-items-center w-12 h-12 rounded-full bg-card border-2 border-amber-500 shadow-md font-display text-amber-600 text-sm font-bold">
                VS
              </span>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-border text-center text-sm">
            {tie ? (
              <span className="text-muted-foreground">It's a tie — no winner declared.</span>
            ) : winnerId ? (
              <span className="font-medium">
                {duo.find((c) => c.id === winnerId)?.name} won this round.
              </span>
            ) : (
              <span className="text-muted-foreground">Scores not yet entered for this match.</span>
            )}
          </div>

          {result?.comments?.length > 0 && (
            <div className="px-5 py-4 border-t border-border bg-muted/30">
              <div className="text-xs uppercase tracking-widest text-amber-600 font-semibold mb-2">
                Judge Notes
              </div>
              <div className="space-y-2">
                {result.comments.map((cmt, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium">{cmt.judge_name}:</span>{" "}
                    <span className="text-muted-foreground">{cmt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}