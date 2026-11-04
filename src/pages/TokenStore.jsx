import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44, isBackendPreview } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles, Loader2, Check, PartyPopper } from "lucide-react";
import { useVoter } from "@/lib/useVoter";
import PaymentSuccess from "@/components/PaymentSuccess";
import PullToRefresh from "@/components/PullToRefresh";

export default function TokenStore() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [justPurchased, setJustPurchased] = useState(false);
  const [searchParams] = useSearchParams();
  const { voterId, balance, refresh } = useVoter();

  useEffect(() => {
    if (!isBackendPreview && searchParams.get("status") === "success") {
      setJustPurchased(true);
      refresh();
      let n = 0;
      const id = setInterval(() => {
        refresh();
        if (++n >= 5) clearInterval(id);
      }, 2000);
      return () => clearInterval(id);
    }
  }, [searchParams, refresh]);

  useEffect(() => {
    base44.entities.TokenPackage
      .list("order")
      .then((d) => {
        setPackages(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (justPurchased) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <PaymentSuccess
          tokens={Number(searchParams.get("tokens") || 0)}
          packageName={searchParams.get("name") || ""}
          balance={balance}
          onContinue={() => {
            setJustPurchased(false);
            window.history.replaceState({}, "", "/tokens");
          }}
        />
      </div>
    );
  }

  const buy = async (pkg) => {
    setError("");
    if (window.self !== window.top) {
      setError("Checkout is only available from the published app, not from this preview.");
      return;
    }
    setBusyId(pkg.id);
    try {
      const res = await base44.functions.invoke("createTokenCheckout", {
        package_id: pkg.id,
        voter_id: voterId,
      });
      if (res.status >= 400 || !res.data?.checkout_url) {
        setError(res.data?.error || "Could not start checkout. Please try again.");
        return;
      }
      window.location.href = res.data.checkout_url;
    } catch (e) {
      setError(e.message || "Could not start checkout. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const reloadPackages = async () => {
    setPackages(await base44.entities.TokenPackage.list("order"));
  };

  return (
    <PullToRefresh onRefresh={reloadPackages}>
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-600 mb-3">Power Up Your Votes</p>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">Get Voting Tokens</h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
          Buy tokens once, then spend them on any contestant. Bigger packs come with bonus tokens — more votes, more impact.
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => {
            const total = (pkg.tokens || 0) + (pkg.bonus_tokens || 0);
            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border p-5 flex flex-col ${
                  pkg.popular ? "border-amber-500 bg-amber-400/5 shadow-lg" : "border-border"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest bg-amber-500 text-black px-3 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Popular
                  </span>
                )}
                <h3 className="font-display text-xl">{pkg.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="font-display text-4xl">${pkg.price_usd}</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">{pkg.tokens} tokens</span>
                  {pkg.bonus_tokens > 0 && (
                    <span className="text-emerald-600 font-medium">+ {pkg.bonus_tokens} bonus</span>
                  )}
                </div>
                {pkg.description && (
                  <p className="mt-2 text-xs text-muted-foreground flex-1">{pkg.description}</p>
                )}
                <Button
                  className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-black"
                  onClick={() => buy(pkg)}
                  disabled={busyId === pkg.id}
                >
                  {busyId === pkg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : `Buy ${total} tokens`}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-center text-sm text-destructive mt-6">{error}</p>}

      <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Check className="w-3.5 h-3.5" /> Secure checkout powered by Stripe
      </div>
    </div>
    </PullToRefresh>
  );
}