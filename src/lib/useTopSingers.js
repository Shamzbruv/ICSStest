import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function useTopSingers() {
  const [topMap, setTopMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await base44.functions.invoke("getScoreLeaderboard", {});
        if (!cancelled && res.status < 400) {
          const rows = res.data.leaderboard || [];
          const map = {};
          rows.slice(0, 3).forEach((r, i) => {
            map[r.contestant_id] = i + 1;
          });
          setTopMap(map);
        }
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

  return { topMap, loading };
}