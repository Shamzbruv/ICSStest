import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import MobileSelect from "@/components/MobileSelect";
import { Loader2, Upload, Save, UserCog } from "lucide-react";

export default function ContestantManager({ contestants }) {
  const [selectedId, setSelectedId] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [stagedImage, setStagedImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const selected = contestants.find((c) => c.id === selectedId);

  useEffect(() => {
    if (selected) {
      setBio(selected.bio || "");
      setImageUrl(selected.image_url || "");
      setVideoUrl(selected.video_url || "");
      setStagedImage(null);
      setMsg("");
    }
  }, [selectedId]);

  useEffect(() => {
    return () => {
      if (stagedImage) URL.revokeObjectURL(stagedImage.url);
    };
  }, [stagedImage]);

  const onStageImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (stagedImage) URL.revokeObjectURL(stagedImage.url);
    setStagedImage({ file, url: URL.createObjectURL(file) });
  };

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    setMsg("");
    try {
      let finalImageUrl = imageUrl;
      if (stagedImage) {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: stagedImage.file });
        finalImageUrl = file_url;
      }
      await base44.entities.Contestant.update(selected.id, {
        bio,
        image_url: finalImageUrl,
        video_url: videoUrl,
      });
      setImageUrl(finalImageUrl);
      if (stagedImage) URL.revokeObjectURL(stagedImage.url);
      setStagedImage(null);
      setMsg("Contestant updated.");
    } catch (e) {
      setMsg(e.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <UserCog className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl">Manage Contestants</h2>
      </div>

      <label className="text-xs uppercase tracking-wide text-muted-foreground">Select Contestant</label>
      <MobileSelect
        value={selectedId}
        onValueChange={setSelectedId}
        placeholder="Choose a contestant…"
        title="Select Contestant"
        className="w-full mt-1 mb-4 h-11"
        options={contestants.map((c) => ({ value: c.id, label: `${c.name} — ${c.parish}` }))}
      />

      {selected && (
        <div className="grid sm:grid-cols-[10rem_1fr] gap-5">
          <div>
            <div className="w-40 h-52 rounded-xl overflow-hidden bg-muted">
              <Image
                src={stagedImage?.url || imageUrl}
                alt={selected.name}
                className="w-full h-full"
                fittingType="fill"
              />
            </div>
            <label className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 text-xs font-semibold cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Change Photo
              <input type="file" accept="image/*" className="hidden" onChange={onStageImage} disabled={busy} />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Write a short bio…"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Video URL</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="https://…"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={save} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </Button>
              {msg && <span className="text-sm text-primary">{msg}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}