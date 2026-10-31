import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const toLocalInput = (iso) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function VotingRoundEditor() {
  const [round, setRound] = useState(null);
  const [label, setLabel] = useState("Voting closes in");
  const [endsAt, setEndsAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    base44.entities.VotingRound.list("-created_date", 1).then((r) => {
      if (r[0]) {
        setRound(r[0]);
        setLabel(r[0].label || "");
        setEndsAt(toLocalInput(r[0].ends_at));
      }
    });
  }, []);

  const save = async () => {
    if (!endsAt) return;
    setSaving(true);
    const data = { label, ends_at: new Date(endsAt).toISOString() };
    if (round) await base44.entities.VotingRound.update(round.id, data);
    else setRound(await base44.entities.VotingRound.create(data));
    setSaving(false);
    setMsg("Saved — countdown updated on the home page.");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 mb-5">
      <h2 className="font-display text-lg mb-3">Voting Countdown</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-muted-foreground">Label</label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Voting closes at</label>
          <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </div>
        <Button onClick={save} disabled={saving || !endsAt}>{saving ? "Saving…" : "Save"}</Button>
      </div>
      {msg && <p className="text-sm text-primary mt-2">{msg}</p>}
    </div>
  );
}