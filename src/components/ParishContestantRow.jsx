import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Crown, ChevronRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ParishContestantRow({ contestant, rank, isTopContestant, isOwner, isHighlight, leaderVotes, onVote }) {
  const pct = leaderVotes ? Math.round(((contestant.vote_count || 0) / leaderVotes) * 100) : 0;
  return (
    <div
      id={`parish-row-${contestant.id}`}
      className={`flex items-center gap-3 rounded-xl border bg-card p-3 transition scroll-mt-24 ${
        isHighlight
          ? "border-amber-500 ring-2 ring-amber-400/60 shadow-md"
          : isTopContestant
          ? "border-amber-400/50 shadow-sm"
          : "border-border hover:border-amber-400/40"
      }`}
    >
      <div className="flex items-center justify-center w-8 shrink-0">
        {rank === 1 ? (
          <Crown className="w-5 h-5 text-amber-500" />
        ) : (
          <span className="font-display text-lg text-muted-foreground tabular-nums">{rank}</span>
        )}
      </div>
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
        <Image src={contestant.image_url} alt={contestant.name} className="w-full h-full" fittingType="fill" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-lg leading-tight truncate">{contestant.name}</h3>
          <span className="text-xs uppercase tracking-widest text-amber-600 shrink-0">
            {contestant.talent_category}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="tabular-nums font-medium text-foreground">
            {(contestant.vote_count || 0).toLocaleString()}
          </span>{" "}
          votes
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isTopContestant && (
          <span className="hidden sm:inline text-xs uppercase tracking-widest text-amber-600 font-medium">
            Top Contestant
          </span>
        )}
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-black"
          onClick={() => onVote(contestant)}
        >
          Vote
        </Button>
        {isOwner && (
          <Link
            to="/contestant-portal"
            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium px-2"
            title="Manage your display photo"
          >
            <Camera className="w-3.5 h-3.5" /> Edit Photo
          </Link>
        )}
        <Link to={`/contestant/${contestant.id}`} className="text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}