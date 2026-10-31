import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useContestants } from "@/lib/useContestants";
import ContestantCard from "@/components/ContestantCard";
import PullToRefresh from "@/components/PullToRefresh";
import MobileSelect from "@/components/MobileSelect";

const PARISHES = ["All", "Kingston", "St. Andrew", "St. Catherine", "Clarendon", "St. Ann", "Trelawny", "St. James", "Hanover", "Westmoreland", "St. Elizabeth", "Manchester", "St. Mary", "Portland", "St. Thomas"];

export default function Contestants() {
  const { contestants, loading, refresh } = useContestants();
  const [parish, setParish] = useState("All");
  const topPerParish = useMemo(() => {
    const map = {};
    contestants.forEach((c) => {
      if (c.status === "eliminated") return;
      if (!map[c.parish] || (c.vote_count || 0) > (map[c.parish].vote_count || 0)) {
        map[c.parish] = c;
      }
    });
    return Object.values(map).sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  }, [contestants]);
  const filtered = topPerParish.filter((c) => parish === "All" || c.parish === parish);

  return (
    <PullToRefresh onRefresh={refresh}>
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl tracking-tight">Contestants</h1>
        <p className="text-muted-foreground mt-2">Watch performances and vote for your favorites.</p>
      </div>

      <div className="flex flex-wrap items-center justify-center mb-8">
        <MobileSelect
          value={parish}
          onValueChange={setParish}
          placeholder="Parish"
          title="Filter by parish"
          className="w-[170px] py-1.5 rounded-full"
          options={PARISHES.map((p) => ({ value: p, label: p === "All" ? "All Parishes" : p }))}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((c, i) => (
            <ContestantCard key={c.id} contestant={c} isTopContestant={i < 3} />
          ))}
        </motion.div>
      )}
    </PullToRefresh>
  );
}