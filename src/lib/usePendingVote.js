import { useState, useEffect } from "react";
import { getPendingVote, clearPendingVote, PENDING_VOTE_EVENT } from "@/lib/pendingVote";

export function usePendingVote() {
  const [pending, setPending] = useState(getPendingVote);

  useEffect(() => {
    const handler = () => setPending(getPendingVote());
    window.addEventListener(PENDING_VOTE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(PENDING_VOTE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { pending, clear: clearPendingVote };
}