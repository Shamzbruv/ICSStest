import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function useScoreLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await base44.functions.invoke("getScoreLeaderboard", {});
        if (!cancelled && res.status < 400) setLeaderboard(res.data.leaderboard || []);
      } catch (e) {
        /* ignore */
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

  return { leaderboard, loading };
}