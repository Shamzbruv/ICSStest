import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function useBattles() {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await base44.entities.Battle.list("order", 50);
        if (mounted) setBattles(data);
      } catch (e) {
        console.error("Failed to load battles", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const unsub = base44.entities.Battle.subscribe((event) => {
      setBattles((prev) => {
        if (event.type === "create") return [...prev, event.data];
        if (event.type === "update") return prev.map((b) => (b.id === event.data.id ? event.data : b));
        if (event.type === "delete") return prev.filter((b) => b.id !== event.id);
        return prev;
      });
    });
    return () => {
      mounted = false;
      unsub?.();
    };
  }, []);

  return { battles, loading };
}