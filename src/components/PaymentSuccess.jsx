import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Coins, Sparkles, Trophy, Store, Loader2 } from "lucide-react";

export default function PaymentSuccess({ tokens, packageName, balance, onContinue }) {
  return (
    <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/5 to-card p-8 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500 grid place-items-center shadow-lg shadow-emerald-500/30 mb-5">
        <CheckCircle2 className="w-11 h-11 text-white" />
      </div>
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 mb-2">Payment Successful</p>
      <h1 className="font-display text-4xl tracking-tight">You're all set!</h1>

      <div className="my-6 inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/30 px-5 py-2.5">
        <Sparkles className="w-5 h-5 text-amber-600" />
        <span className="font-display text-2xl tabular-nums">+{tokens.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground">tokens added</span>
      </div>

      {packageName && <p className="text-sm text-muted-foreground mb-4">{packageName} package</p>}

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
        <Coins className="w-4 h-4 text-amber-500" />
        <span>New balance</span>
        <span className="font-semibold text-foreground tabular-nums">
          {balance == null ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `${balance.toLocaleString()} tokens`}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/">
          <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black font-semibold">
            <Sparkles className="w-4 h-4" /> Vote Now
          </Button>
        </Link>
        <Link to="/leaderboard">
          <Button variant="outline" className="w-full sm:w-auto">
            <Trophy className="w-4 h-4" /> View Leaderboard
          </Button>
        </Link>
        <Button variant="ghost" className="w-full sm:w-auto" onClick={onContinue}>
          <Store className="w-4 h-4" /> Buy more
        </Button>
      </div>
    </div>
  );
}