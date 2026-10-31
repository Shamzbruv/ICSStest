import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import VoteModal from "@/components/VoteModal";
import BattleScoreboard from "@/components/BattleScoreboard";
import { MapPin, Heart } from "lucide-react";

export default function BattleCard({ battle, contestants, voterId, balance, result }) {
  const [modalContestant, setModalContestant] = useState(null);
  const duo = contestants.slice(0, 2);
  const left = duo[0];
  const right = duo[1];

  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="relative grid grid-cols-2">
        {duo.map((c, i) => (
          <div key={c.id} className={`flex flex-col p-5 ${i === 0 ? "border-r border-border" : ""}`}>
            <Link to={`/contestant/${c.id}`} className="block group">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted mb-3">
                <Image
                  src={c.image_url}
                  alt={c.name}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                  fittingType="fill"
                />
              </div>
            </Link>
            <h4 className="font-display text-lg leading-tight text-center">{c.name}</h4>
            {c.parish && (
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" /> {c.parish}
              </div>
            )}
            <div className="mt-1 flex items-center justify-center gap-1 text-sm">
              <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
              <span className="tabular-nums">{(c.vote_count || 0).toLocaleString()}</span>
            </div>
            <Button
              className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide"
              onClick={() => setModalContestant(c)}
            >
              VOTE NOW
            </Button>
          </div>
        ))}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <span className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-display text-sm grid place-items-center shadow-lg ring-4 ring-background">
            VS
          </span>
        </div>
      </div>

      <BattleScoreboard contestants={duo} result={result} />

      <VoteModal
        contestant={modalContestant}
        open={!!modalContestant}
        onOpenChange={(o) => !o && setModalContestant(null)}
        voterId={voterId}
        balance={balance}
        battleId={battle.id}
      />
    </div>
  );
}