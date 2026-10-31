import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Gavel, Mail } from "lucide-react";

export default function InviteJudgeForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const invite = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setError("");
    try {
      const res = await base44.functions.invoke("inviteJudge", { email: email.trim() });
      if (res.status >= 400) {
        setError(res.data?.error || "Invite failed");
        return;
      }
      setMsg(`Invited ${res.data.email}. ${res.data.judges}/${res.data.max} judge slots used.`);
      setEmail("");
    } catch (e) {
      setError(e.message || "Invite failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 mb-5">
      <div className="flex items-center gap-2 mb-4">
        <Gavel className="w-4 h-4 text-amber-600" />
        <h3 className="font-display text-lg">Invite a Judge</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Send an invite so someone can sign in and score battles (up to 5 judges).
      </p>
      <form onSubmit={invite} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="judge@example.com"
            className="pl-9"
            disabled={busy}
          />
        </div>
        <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black" disabled={busy || !email.trim()}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invite"}
        </Button>
      </form>
      {msg && <p className="text-sm text-amber-600 mt-3">{msg}</p>}
      {error && <p className="text-sm text-destructive mt-3">{error}</p>}
    </div>
  );
}