import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useContestants() {
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await base44.entities.Contestant.list("order");
      setContestants(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    refresh().catch(() => {
      if (active) setLoading(false);
    });
    const unsub = base44.entities.Contestant.subscribe((event) => {
      setContestants((prev) => {
        const idx = prev.findIndex((c) => c.id === event.id);
        if (event.type === "delete") return prev.filter((c) => c.id !== event.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = event.data;
          return copy;
        }
        return [...prev, event.data];
      });
    });
    // Optimistic vote count updates (and rollbacks) from VoteModal
    const onOptimistic = (e) => {
      const { contestant_id, votes } = e.detail || {};
      setContestants((prev) =>
        prev.map((c) => (c.id === contestant_id ? { ...c, vote_count: Math.max(0, (c.vote_count || 0) + votes) } : c))
      );
    };
    window.addEventListener("vote-optimistic", onOptimistic);
    return () => {
      active = false;
      unsub();
      window.removeEventListener("vote-optimistic", onOptimistic);
    };
  }, [refresh]);

  return { contestants, loading, refresh };
}