import { useState, useEffect, useCallback } from "react";
import { base44, isBackendPreview } from "@/api/base44Client";

const STORAGE_KEY = "spotlight_voter_id";

function getOrCreateVoterId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function useVoter() {
  const [voterId, setVoterId] = useState(null);
  const [balance, setBalance] = useState(null);

  const refresh = useCallback(async () => {
    if (isBackendPreview) {
      setVoterId(null);
      setBalance(0);
      return;
    }
    const vid = getOrCreateVoterId();
    setVoterId(vid);
    try {
      const res = await base44.functions.invoke("getVoterState", { voter_id: vid });
      setBalance(res.data?.tokens_balance ?? 0);
    } catch (e) {
      setBalance(0);
    }
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("tokens-updated", handler);
    // Optimistic balance changes (and rollbacks) from VoteModal
    const onOptimistic = (e) =>
      setBalance((b) => (b == null ? b : Math.max(0, b + (e.detail?.tokens || 0))));
    window.addEventListener("tokens-optimistic", onOptimistic);
    return () => {
      window.removeEventListener("tokens-updated", handler);
      window.removeEventListener("tokens-optimistic", onOptimistic);
    };
  }, [refresh]);

  return { voterId, balance, refresh };
}