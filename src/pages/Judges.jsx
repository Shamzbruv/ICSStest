import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import PullToRefresh from "@/components/PullToRefresh";
import { Gavel, Loader2 } from "lucide-react";

export default function Judges() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.JudgeProfile.list().then(setProfiles).finally(() => setLoading(false));
  }, []);

  const reload = async () => {
    setProfiles(await base44.entities.JudgeProfile.list());
  };

  return (
    <PullToRefresh onRefresh={reload}>
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Transparency</p>
        <h1 className="font-display text-4xl tracking-tight">Meet the Judges</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Get to know the panel scoring each battle — their background, profession, and experience.
        </p>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Gavel className="w-10 h-10 mx-auto mb-3" />
          Judge profiles haven't been published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mx-auto mb-4">
                <Image src={p.image_url} alt={p.name} className="w-full h-full" fittingType="fill" />
              </div>
              <h2 className="font-display text-xl">{p.name}</h2>
              {p.profession && (
                <p className="text-sm text-primary font-medium mt-1">{p.profession}</p>
              )}
              {p.bio && <p className="text-sm text-muted-foreground mt-3">{p.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </PullToRefresh>
  );
}