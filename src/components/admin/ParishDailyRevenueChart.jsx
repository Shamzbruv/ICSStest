import React, { useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import MobileSelect from "@/components/MobileSelect";

const PARISHES = [
  "Kingston", "St. Andrew", "St. Catherine", "Clarendon", "St. Ann", "Trelawny",
  "St. James", "Hanover", "Westmoreland", "St. Elizabeth", "Manchester", "St. Mary",
  "Portland", "St. Thomas",
];

export default function ParishDailyRevenueChart({ contestants, votes, pricePerToken }) {
  const [parish, setParish] = useState(PARISHES[0]);

  const data = useMemo(() => {
    const parishContestants = new Set(
      contestants.filter((c) => c.parish === parish).map((c) => c.id)
    );
    const map = {};
    votes.forEach((v) => {
      if (!parishContestants.has(v.contestant_id)) return;
      const d = new Date(v.created_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + (v.tokens_used || 1);
    });
    return Object.entries(map)
      .map(([key, tokens]) => {
        const d = new Date(key);
        return {
          day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          sort: d.getTime(),
          revenue: Math.round(tokens * pricePerToken * 100) / 100,
        };
      })
      .sort((a, b) => a.sort - b.sort);
  }, [contestants, votes, parish, pricePerToken]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div>
          <h3 className="font-display text-lg">Daily Revenue by Parish</h3>
          <p className="text-xs text-muted-foreground">
            Token revenue attributed to votes cast for {parish} contestants
          </p>
        </div>
        <MobileSelect
          value={parish}
          onValueChange={setParish}
          title="Select Parish"
          className="w-[170px] rounded-full"
          options={PARISHES.map((p) => ({ value: p, label: p }))}
        />
      </div>
      <div className="h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="parishRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(v) => [`$${Number(v).toFixed(2)}`, "Revenue"]}
              contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#parishRev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}