import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useVoter } from "@/lib/useVoter";
import { usePendingVote } from "@/lib/usePendingVote";
import { Button } from "@/components/ui/button";
import { Coins, X, Loader2, CheckCircle2 } from "lucide-react";

export default function PendingVoteBanner() {
  const { pending, clear } = usePendingVote();
  const { voterId, balance } = useVoter();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!pending) return null;
  const ready = (balance ?? 0) >= (pending.tokens || 0);

  const complete = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await base44.functions.invoke("castVote", {
        voter_id: voterId,
        contestant_id: pending.contestant_id,
        tokens: pending.tokens,
      });
      if (res.status >= 400) {
        setError(res.data?.error || "Vote failed.");
        return;
      }
      window.dispatchEvent(new Event("tokens-updated"));
      clear();
    } catch (e) {
      setError(e.message || "Vote failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-amber-400/15 border-b border-amber-400/30">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3 text-sm">
        <Coins className="w-4 h-4 text-amber-600 shrink-0" />
        <div className="flex-1 min-w-0">
          {ready ? (
            <span className="truncate">
              Finish your vote: <strong>{pending.tokens}</strong> token{pending.tokens > 1 ? "s" : ""} for{" "}
              <strong>{pending.contestant_name}</strong>
            </span>
          ) : (
            <span className="truncate">
              You started a vote for <strong>{pending.contestant_name}</strong> ({pending.tokens} tokens).{" "}
              <button className="underline font-medium" onClick={() => navigate("/tokens")}>
                Get tokens
              </button>{" "}
              to finish.
            </span>
          )}
        </div>
        {ready && (
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-black"
            onClick={complete}
            disabled={busy}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Complete vote</>}
          </Button>
        )}
        <button onClick={clear} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
        {error && <span className="text-destructive text-xs shrink-0">{error}</span>}
      </div>
    </div>
  );
}