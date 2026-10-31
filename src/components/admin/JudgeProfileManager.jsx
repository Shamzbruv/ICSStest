import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Loader2, Gavel, Trash2 } from "lucide-react";

export default function JudgeProfileManager() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.JudgeProfile.list("-created_date");
      setProfiles(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Remove this judge's public profile?")) return;
    setBusyId(id);
    try {
      await base44.entities.JudgeProfile.delete(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 mb-5">
      <div className="flex items-center gap-2 mb-4">
        <Gavel className="w-4 h-4 text-amber-600" />
        <h3 className="font-display text-lg">Judge Profiles</h3>
      </div>

      {loading ? (
        <div className="grid place-items-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No judge profiles published yet.</p>
      ) : (
        <div className="space-y-2">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                <Image src={p.image_url} alt={p.name} className="w-full h-full" fittingType="fill" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.profession || "—"}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => remove(p.id)}
                disabled={busyId === p.id}
              >
                {busyId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}