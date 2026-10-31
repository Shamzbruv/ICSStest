import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Play, Heart, MapPin, Crown } from "lucide-react";

export default function ContestantCard({ contestant, isTopContestant }) {
  return (
    <Link to={`/contestant/${contestant.id}`} className="group block">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
        <Image
          src={contestant.image_url}
          alt={contestant.name}
          className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
          fittingType="fill"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {isTopContestant && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-lg">
            <Crown className="w-3.5 h-3.5" /> Top Contestant
          </div>
        )}
        {contestant.video_url && (
          <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 grid place-items-center shadow">
            <Play className="w-4 h-4 text-black ml-0.5" />
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 p-4 text-white">
          <span className="inline-block text-xs uppercase tracking-widest bg-white/15 backdrop-blur px-2 py-0.5 rounded-full mb-2">
            {contestant.talent_category}
          </span>
          <h3 className="font-display text-xl leading-tight">{contestant.name}</h3>
          <div className="mt-2 flex items-center gap-1.5 text-primary">
            <Heart className="w-4 h-4 fill-primary" />
            <span className="text-sm font-medium tabular-nums">
              {(contestant.vote_count || 0).toLocaleString()}
            </span>
            <span className="text-white/50 text-xs">votes</span>
          </div>
          {contestant.parish && (
            <div className="mt-1 flex items-center gap-1 text-white/70 text-xs">
              <MapPin className="w-3 h-3" /> {contestant.parish}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}