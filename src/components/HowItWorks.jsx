import React from "react";
import { Link } from "react-router-dom";
import { Search, Store, Heart, Trophy } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Browse Contestants",
    body: "Explore the top singers representing each parish. Tap any performer to watch their video and read their story.",
  },
  {
    icon: Store,
    title: "Get Tokens",
    body: "Head to the token store and pick a package. Each token equals one vote — the more you grab, the more power you hold.",
  },
  {
    icon: Heart,
    title: "Cast Your Vote",
    body: "Open a contestant's profile, hit Vote Now, choose how many tokens to spend, and confirm. Tokens are deducted instantly.",
  },
  {
    icon: Trophy,
    title: "Watch the Leaderboard",
    body: "See your favourite climb the standings in real time and push them toward the crown.",
  },
];

export default function HowItWorks() {
  return (
    <section className="my-12">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">How It Works</p>
        <h2 className="font-display text-3xl tracking-tight">Buy Tokens & Vote in 4 Easy Steps</h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          New here? Here's everything you need to back your favourite singing talent.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="relative rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <span className="absolute top-4 right-4 font-display text-3xl text-primary/30 tabular-nums">
                {i + 1}
              </span>
              <span className="w-11 h-11 rounded-full bg-primary/15 grid place-items-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </span>
              <h3 className="font-display text-lg leading-tight">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          to="/tokens"
          className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 text-sm font-semibold transition"
        >
          <Store className="w-4 h-4" /> Get Tokens
        </Link>
        <Link
          to="/leaderboard"
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent transition"
        >
          <Trophy className="w-4 h-4" /> View Leaderboard
        </Link>
      </div>
    </section>
  );
}