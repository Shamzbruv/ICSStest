import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ResetCompetitionButton() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!mode) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("resetCompetition", { mode });
      setResult(res.data?.summary || { mode });
      setOpen(false);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <RotateCcw className="w-4 h-4" /> Reset Competition
      </Button>

      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Reset Competition
            </DialogTitle>
            <DialogDescription>
              This permanently clears competition data. Choose what to clear. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <button
              onClick={() => setMode("votes")}
              className={`w-full text-left rounded-xl border p-3 transition ${
                mode === "votes" ? "border-amber-500 bg-amber-50" : "border-border hover:bg-muted"
              }`}
            >
              <p className="font-medium text-sm">Votes only</p>
              <p className="text-xs text-muted-foreground">
                Delete all Vote records and reset each contestant's vote count to 0.
              </p>
            </button>
            <button
              onClick={() => setMode("full")}
              className={`w-full text-left rounded-xl border p-3 transition ${
                mode === "full" ? "border-destructive bg-destructive/5" : "border-border hover:bg-muted"
              }`}
            >
              <p className="font-medium text-sm">Full season reset</p>
              <p className="text-xs text-muted-foreground">
                Also clears judge scores &amp; comments, and closes all battles.
              </p>
            </button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              onClick={run}
              disabled={!mode || busy}
              variant={mode === "full" ? "destructive" : "default"}
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {result && (
        <div className="mt-3 text-sm rounded-lg bg-emerald-50 border border-emerald-200 p-3">
          <p className="font-medium text-emerald-700">Reset complete ({result.mode}).</p>
          <p className="text-emerald-600 text-xs mt-0.5">
            Votes cleared and contestant counts reset
            {result.battlesClosed ? " · battles closed · scores &amp; comments cleared" : ""}.
          </p>
        </div>
      )}
    </>
  );
}