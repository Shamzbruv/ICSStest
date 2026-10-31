import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Gavel } from "lucide-react";

export default function JudgeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      // Ensure the platform's post-login redirect returns to the judge portal.
      const url = new URL(window.location.href);
      if (!url.searchParams.has("returnTo")) url.searchParams.set("returnTo", "/judge");
      window.history.replaceState(null, "", url.pathname + url.search);
      await base44.auth.loginViaEmailPassword(email.trim(), password);
    } catch (err) {
      setLoading(false);
      setError(err?.message || "Invalid email or password.");
    }
  };

  return (
    <div className="max-w-sm mx-auto text-center py-16">
      <Gavel className="w-10 h-10 mx-auto text-amber-600 mb-4" />
      <h1 className="font-display text-3xl mb-2">Judge Portal</h1>
      <p className="text-muted-foreground mb-6">Sign in to score the active battles.</p>
      <form onSubmit={onSubmit} className="space-y-4 text-left">
        <div>
          <Label htmlFor="jl-email">Email</Label>
          <Input
            id="jl-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="judge@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <Label htmlFor="jl-password">Password</Label>
          <Input
            id="jl-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
        </Button>
      </form>
      <div className="mt-4 text-sm">
        <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}