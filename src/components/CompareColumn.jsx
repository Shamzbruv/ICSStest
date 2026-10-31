import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Heart, MapPin, Gavel, Star } from "lucide-react";

const CATS = [
  { key: "avg_performance", label: "Performance", max: 25 },
  { key: "avg_attire", label: "Attire", max: 25 },
  { key: "avg_crowd_engagement", label: "Crowd", max: 25 },
];

export default function CompareColumn({ contestant, scoreRow }) {
  if (!contestant) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
        Select a contestant
      </div>
    );
  }

  const total = scoreRow?.avg_total;
  return (
    <div className="min-w-0 rounded-2xl md:rounded-3xl border border-border bg-card overflow-hidden">
      <div className="aspect-video relative bg-black">
        {contestant.video_url ? (
          <video
            src={contestant.video_url}
            controls
            poster={contestant.image_url}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full">
            <Image src={contestant.image_url} alt={contestant.name} className="w-full h-full object-cover" fittingType="fill" />
            <span className="absolute bottom-2 left-2 text-xs uppercase tracking-widest bg-black/60 text-white px-2 py-1 rounded-full">
              No video submitted
            </span>
          </div>
        )}
      </div>
      <div className="p-3 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between items-start gap-1 md:gap-2">
          <Link to={`/contestant/${contestant.id}`} className="min-w-0 max-w-full break-words font-display text-base md:text-2xl leading-tight tracking-tight hover:underline">
            {contestant.name}
          </Link>
          <span className={`shrink-0 text-xs uppercase tracking-wide md:tracking-widest px-2 py-0.5 md:py-1 rounded-full ${
            contestant.status === "winner" ? "bg-primary text-primary-foreground" :
            contestant.status === "eliminated" ? "bg-muted text-muted-foreground" :
            "bg-emerald-500/15 text-emerald-700"}`}>
            {contestant.status || "active"}
          </span>
        </div>
        {contestant.parish && (
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" /> {contestant.parish}
          </div>
        )}
        <div className="mt-3 flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 fill-primary text-primary" />
          <span className="font-display text-xl md:text-2xl tabular-nums">{(contestant.vote_count || 0).toLocaleString()}</span>
          <span className="text-muted-foreground text-sm">votes</span>
        </div>
        {contestant.bio && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-4 break-words">{contestant.bio}</p>
        )}

        <div className="mt-4 md:mt-5 pt-3 md:pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Gavel className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Judge Scores</h3>
          </div>
          {!scoreRow ? (
            <p className="text-sm text-muted-foreground">No judge scores yet.</p>
          ) : (
            <div className="space-y-2">
              {CATS.map((c) => {
                const v = scoreRow[c.key] ?? 0;
                return (
                  <div key={c.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{c.label}</span>
                      <span className="tabular-nums">{v}/{c.max}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(v / c.max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3.5 h-3.5 text-primary" /> Total
                </span>
                <span className="font-display text-xl tabular-nums">{total}/75</span>
              </div>
              <p className="text-xs text-muted-foreground">From {scoreRow.judges} judge score{scoreRow.judges === 1 ? "" : "s"}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}