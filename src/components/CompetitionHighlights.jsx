import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Crown, Loader2, Trophy, Users } from "lucide-react";

export default function CompetitionHighlights() {
  const [highlights, setHighlights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await base44.functions.invoke("getCompetitionHighlights", {});
        if (!cancelled && res.status < 400) setHighlights(res.data.highlights || []);
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-10">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl">Competition Highlights</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="py-10">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="font-display text-2xl">Competition Highlights</h2>
        <span className="text-xs text-muted-foreground ml-2">Recent battle winners</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {highlights.map((h) => (
          <Link
            key={h.battle_id}
            to={`/contestant/${h.winner.contestant_id}`}
            className="group relative rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition"
          >
            <div className="aspect-[3/4] relative bg-muted">
              <Image src={h.winner.image_url} alt={h.winner.name} className="w-full h-full" fittingType="fill" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow">
                <Crown className="w-3 h-3" /> WINNER
              </span>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-xs uppercase tracking-widest text-primary truncate">{h.battle_title}</div>
                <h3 className="font-display text-lg leading-tight truncate">{h.winner.name}</h3>
                {h.winner.parish && <p className="text-xs text-white/70 truncate">{h.winner.parish}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-xl tabular-nums">
                    {h.winner.avg_total?.toFixed(1)}
                    <span className="text-white/60 text-xs">/75</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white/70">
                    <Users className="w-3 h-3" /> {h.winner.judges}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}