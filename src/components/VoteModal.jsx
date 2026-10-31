import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Loader2 } from "lucide-react";
import { setPendingVote } from "@/lib/pendingVote";

const OPTIONS = [1, 5, 10, 25];

export default function VoteModal({ contestant, open, onOpenChange, voterId, balance, onVoted, battleId }) {
  const [selected, setSelected] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVote = async () => {
    setError("");
    if ((balance || 0) < selected) {
      setPendingVote({ contestant_id: contestant.id, contestant_name: contestant.name, tokens: selected });
      onOpenChange(false);
      navigate("/tokens");
      return;
    }
    setBusy(true);
    window.dispatchEvent(new CustomEvent("tokens-optimistic", { detail: { tokens: -selected } }));
    window.dispatchEvent(
      new CustomEvent("vote-optimistic", { detail: { contestant_id: contestant.id, votes: selected } })
    );
    let rolledBack = false;
    const rollback = () => {
      if (rolledBack) return;
      rolledBack = true;
      window.dispatchEvent(new CustomEvent("tokens-optimistic", { detail: { tokens: selected } }));
      window.dispatchEvent(
        new CustomEvent("vote-optimistic", { detail: { contestant_id: contestant.id, votes: -selected } })
      );
    };
    try {
      const res = await base44.functions.invoke("castVote", {
        voter_id: voterId,
        contestant_id: contestant.id,
        tokens: selected,
        ...(battleId ? { battle_id: battleId } : {}),
      });
      if (res.status >= 400) {
        rollback();
        setError(res.data?.error || "Vote failed.");
        return;
      }
      window.dispatchEvent(new Event("tokens-updated"));
      onVoted?.(res.data);
      onOpenChange(false);
    } catch (e) {
      rollback();
      setError(e.message || "Vote failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vote for {contestant?.name}</DialogTitle>
          <DialogDescription>
            Each token equals one vote. You have{" "}
            <span className="font-medium text-foreground">{balance ?? 0}</span> tokens.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2">
          {OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setSelected(n)}
              className={`py-3 rounded-xl border text-center transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none ${
                selected === n
                  ? "border-primary bg-primary/15"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-display text-lg">{n}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Coins className="w-3 h-3" />
                {n}
              </div>
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleVote}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : balance >= selected ? (
              `Cast ${selected} Vote${selected > 1 ? "s" : ""}`
            ) : (
              "Get Tokens"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}