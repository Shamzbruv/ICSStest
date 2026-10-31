import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

function csvEscape(v) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function DownloadScoresButton({ contestants }) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    try {
      const [scores, battles, users] = await Promise.all([
        base44.entities.BattleScore.list("-created_date", 1000),
        base44.entities.Battle.list(),
        base44.entities.User.list(),
      ]);
      const battleName = Object.fromEntries(battles.map((b) => [b.id, b.title]));
      const singerName = Object.fromEntries((contestants || []).map((c) => [c.id, c.name]));
      const judgeName = Object.fromEntries(
        users.map((u) => [u.id, u.full_name || u.email || u.id])
      );

      const header = [
        "Battle",
        "Singer",
        "Judge",
        "Performance",
        "Attire",
        "Crowd Engagement",
        "Total",
        "Submitted",
      ];
      const rows = scores.map((s) => [
        battleName[s.battle_id] || s.battle_id,
        singerName[s.contestant_id] || s.contestant_id,
        judgeName[s.judge_id] || s.judge_id,
        s.performance || 0,
        s.attire || 0,
        s.crowd_engagement || 0,
        (s.performance || 0) + (s.attire || 0) + (s.crowd_engagement || 0),
        s.created_date ? new Date(s.created_date).toISOString() : "",
      ]);
      const csv = [header, ...rows]
        .map((r) => r.map(csvEscape).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "battle-scores.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Could not download scores: " + (e.message || "unknown error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleDownload} disabled={busy}>
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      Download All Scores
    </Button>
  );
}