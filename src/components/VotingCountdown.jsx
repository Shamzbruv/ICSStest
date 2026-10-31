import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Timer } from "lucide-react";

function Unit({ value, label }) {
  return (
    <div className="min-w-[64px] rounded-xl border border-border bg-card px-3 py-2">
      <div className="font-display text-3xl tabular-nums">{String(value).padStart(2, "0")}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

export default function VotingCountdown() {
  const [round, setRound] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    base44.entities.VotingRound.list("-created_date", 1).then((r) => setRound(r[0] || null));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!round) return null;
  const diff = new Date(round.ends_at).getTime() - now;
  const closed = diff <= 0;
  const s = Math.max(0, Math.floor(diff / 1000));

  return (
    <div className="mt-8 text-center">
      <p className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-primary mb-3">
        <Timer className="w-4 h-4" /> {round.label || "Voting closes in"}
      </p>
      {closed ? (
        <p className="font-display text-2xl">Voting for this round has closed</p>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <Unit value={Math.floor(s / 86400)} label="Days" />
          <Unit value={Math.floor((s % 86400) / 3600)} label="Hours" />
          <Unit value={Math.floor((s % 3600) / 60)} label="Min" />
          <Unit value={s % 60} label="Sec" />
        </div>
      )}
    </div>
  );
}