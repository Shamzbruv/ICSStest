import React, { useState, useMemo } from "react";
import { useContestants } from "@/lib/useContestants";
import { useScoreLeaderboard } from "@/lib/useScoreLeaderboard";
import CompareColumn from "@/components/CompareColumn";
import PullToRefresh from "@/components/PullToRefresh";
import { Loader2, GitCompare } from "lucide-react";
import MobileSelect from "@/components/MobileSelect";

export default function ContestantCompare() {
  const { contestants, loading, refresh } = useContestants();
  const { leaderboard } = useScoreLeaderboard();
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");

  React.useEffect(() => {
    if (!loading && contestants.length > 0 && !aId) {
      setAId(contestants[0].id);
      setBId(contestants[1]?.id || contestants[0].id);
    }
  }, [loading, contestants, aId]);

  const scoreMap = useMemo(
    () => Object.fromEntries(leaderboard.map((r) => [r.contestant_id, r])),
    [leaderboard]
  );

  const a = contestants.find((c) => c.id === aId);
  const b = contestants.find((c) => c.id === bId);

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={refresh}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <GitCompare className="w-5 h-5 text-primary" />
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Head to Head</p>
        </div>
        <h1 className="font-display text-4xl tracking-tight">Compare Contestants</h1>
        <p className="text-muted-foreground mt-2">
          Pick any two performers to compare stats, video clips, and average judge scores side by side.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-6 [&>*]:min-w-0">
        <MobileSelect
          value={aId}
          onValueChange={setAId}
          aria-label="First contestant"
          placeholder="Select contestant"
          className="h-11"
          options={contestants.map((c) => ({ value: c.id, label: c.name }))}
        />
        <MobileSelect
          value={bId}
          onValueChange={setBId}
          aria-label="Second contestant"
          placeholder="Select contestant"
          className="h-11"
          options={contestants.map((c) => ({ value: c.id, label: c.name }))}
        />
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
        <CompareColumn key={`a-${aId}`} contestant={a} scoreRow={scoreMap[aId]} />
        <div className="hidden md:grid place-items-center absolute left-1/2 md:top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <span className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground font-display text-sm grid place-items-center shadow-lg">VS</span>
        </div>
        <CompareColumn key={`b-${bId}`} contestant={b} scoreRow={scoreMap[bId]} />
      </div>
    </PullToRefresh>
  );
}