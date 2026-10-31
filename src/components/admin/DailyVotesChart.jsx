import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export default function DailyVotesChart({ votes }) {
  const data = useMemo(() => {
    const map = {};
    votes.forEach((v) => {
      const d = new Date(v.created_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + (v.tokens_used || 1);
    });
    return Object.entries(map)
      .map(([key, count]) => {
        const d = new Date(key);
        return {
          day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          sort: d.getTime(),
          votes: count,
        };
      })
      .sort((a, b) => a.sort - b.sort);
  }, [votes]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg mb-1">Daily Vote Activity</h3>
      <p className="text-xs text-muted-foreground mb-4">Votes cast per day across the competition</p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v) => [Number(v).toLocaleString(), "Votes"]}
              contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
            />
            <Line type="monotone" dataKey="votes" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}