import React from "react";
import { Crown, Medal } from "lucide-react";

const STYLES = {
  1: { bg: "bg-primary", text: "text-primary-foreground", icon: Crown, label: "1st Place" },
  2: { bg: "bg-slate-300", text: "text-slate-800", icon: Medal, label: "2nd Place" },
  3: { bg: "bg-amber-700/80", text: "text-white", icon: Medal, label: "3rd Place" },
};

export default function TopRankBadge({ rank }) {
  const s = STYLES[rank];
  if (!s) return null;
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${s.bg} ${s.text} px-3 py-1 text-xs font-semibold shadow-sm`}
    >
      <Icon className="w-3.5 h-3.5" /> {s.label}
    </span>
  );
}