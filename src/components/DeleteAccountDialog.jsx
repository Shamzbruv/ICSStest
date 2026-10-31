import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Loader2, UserX } from "lucide-react";

export default function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("deleteAccount", {
        voter_id: localStorage.getItem("spotlight_voter_id"),
      });
      if (res.status >= 400 || res.data?.error) throw new Error(res.data?.error || "Could not delete account.");
      await base44.auth.logout(window.location.origin);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Could not delete account.");
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <Button
        variant="outline"
        className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => setOpen(true)}
      >
        <UserX className="w-4 h-4" /> Delete Account
      </Button>
      <AlertDialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This is permanent and cannot be undone. You will lose your claimed contestant profile
              (it will be released for someone else to claim), your account data, and any vote tokens
              stored for you on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={confirm} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, delete my account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}